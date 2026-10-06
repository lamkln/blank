import type { AIResponse } from "@/types";
import type { ProviderAdapter } from "./types";

const TOOLS = [
  {
    name: "write_file",
    description: "Propose writing or updating a file in the project",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string" },
        content: { type: "string" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "run_command",
    description: "Propose running a shell command in the project directory",
    input_schema: {
      type: "object" as const,
      properties: {
        command: { type: "string" },
      },
      required: ["command"],
    },
  },
  {
    name: "plan",
    description: "State a one-line plan before taking actions",
    input_schema: {
      type: "object" as const,
      properties: {
        line: { type: "string" },
      },
      required: ["line"],
    },
  },
  {
    name: "stop",
    description: "Stop when task is done or preview is running",
    input_schema: {
      type: "object" as const,
      properties: {
        message: { type: "string" },
      },
      required: ["message"],
    },
  },
];

export const anthropicAdapter: ProviderAdapter = {
  async sendMessage(config, messages, systemPrompt, onChunk) {
    const url = "https://api.anthropic.com/v1/messages";
    const anthropicMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      }));

    const body = {
      model: config.model,
      max_tokens: 8192,
      system: systemPrompt,
      messages: anthropicMessages,
      tools: TOOLS,
      stream: Boolean(onChunk),
    };

    const headers = {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    };

    if (!onChunk) {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ ...body, stream: false }),
      });
      if (!res.ok) {
        throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);
      }
      return parseAnthropic(await res.json());
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);
    }

    let content = "";
    const toolCalls: AIResponse["toolCalls"] = [];
    const toolBlocks: Record<
      number,
      { name: string; json: string }
    > = {};

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          const event = JSON.parse(payload);
          if (event.type === "content_block_delta") {
            if (event.delta?.type === "text_delta" && event.delta.text) {
              content += event.delta.text;
              onChunk(event.delta.text);
            }
            if (event.delta?.type === "input_json_delta" && event.delta.partial_json) {
              const idx = event.index ?? 0;
              if (!toolBlocks[idx]) toolBlocks[idx] = { name: "", json: "" };
              toolBlocks[idx].json += event.delta.partial_json;
            }
          }
          if (event.type === "content_block_start" && event.content_block?.type === "tool_use") {
            const idx = event.index ?? 0;
            toolBlocks[idx] = {
              name: event.content_block.name,
              json: "",
            };
          }
        } catch {
          /* ignore */
        }
      }
    }

    for (const idx of Object.keys(toolBlocks).map(Number).sort()) {
      const b = toolBlocks[idx];
      try {
        toolCalls.push({
          name: b.name,
          arguments: JSON.parse(b.json || "{}"),
        });
      } catch {
        toolCalls.push({ name: b.name, arguments: {} });
      }
    }

    return { content, toolCalls };
  },
};

function parseAnthropic(data: {
  content?: Array<
    | { type: "text"; text: string }
    | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  >;
}): AIResponse {
  let content = "";
  const toolCalls: AIResponse["toolCalls"] = [];
  for (const block of data.content ?? []) {
    if (block.type === "text") content += block.text;
    if (block.type === "tool_use") {
      toolCalls.push({ name: block.name, arguments: block.input });
    }
  }
  return { content, toolCalls };
}
