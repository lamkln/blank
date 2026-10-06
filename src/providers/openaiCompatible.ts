import type { AIResponse, ChatMessage } from "@/types";
import type { ProviderAdapter } from "./types";

const AGENT_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "write_file",
      description: "Propose writing or updating a file in the project",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Relative path from project root" },
          content: { type: "string", description: "Full new file content" },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "run_command",
      description: "Propose running a shell command in the project directory",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string", description: "Command to run" },
        },
        required: ["command"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "plan",
      description: "State a one-line plan before taking actions",
      parameters: {
        type: "object",
        properties: {
          line: { type: "string", description: "Single short plan line" },
        },
        required: ["line"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "stop",
      description: "Stop when task is done or preview is running",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
    },
  },
];

function toOpenAIMessages(
  messages: ChatMessage[],
  systemPrompt: string,
): Array<{ role: string; content: string }> {
  const out: Array<{ role: string; content: string }> = [
    { role: "system", content: systemPrompt },
  ];
  for (const m of messages) {
    if (m.role === "system") continue;
    out.push({ role: m.role, content: m.content });
  }
  return out;
}

export function createOpenAICompatibleAdapter(
  defaultBaseUrl: string,
): ProviderAdapter {
  return {
    async sendMessage(config, messages, systemPrompt, onChunk) {
      const baseUrl = (config.baseUrl || defaultBaseUrl).replace(/\/$/, "");
      const url = `${baseUrl}/chat/completions`;

      const body = {
        model: config.model,
        messages: toOpenAIMessages(messages, systemPrompt),
        tools: AGENT_TOOLS,
        tool_choice: "auto" as const,
        stream: Boolean(onChunk),
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      };

      if (config.type === "openrouter") {
        headers["HTTP-Referer"] = "https://blank-ide.local";
        headers["X-Title"] = "Blank IDE";
      }

      if (!body.stream) {
        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(`API error ${res.status}: ${err.slice(0, 500)}`);
        }
        const data = await res.json();
        return parseCompletion(data);
      }

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`API error ${res.status}: ${err.slice(0, 500)}`);
      }

      let content = "";
      const toolCalls: AIResponse["toolCalls"] = [];
      const toolAcc: Record<
        number,
        { name: string; arguments: string }
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
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed.choices?.[0]?.delta;
            if (!delta) continue;
            if (delta.content) {
              content += delta.content;
              onChunk?.(delta.content);
            }
            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                const idx = tc.index ?? 0;
                if (!toolAcc[idx]) {
                  toolAcc[idx] = { name: tc.function?.name ?? "", arguments: "" };
                }
                if (tc.function?.name) toolAcc[idx].name = tc.function.name;
                if (tc.function?.arguments) {
                  toolAcc[idx].arguments += tc.function.arguments;
                }
              }
            }
          } catch {
            /* ignore parse errors in stream */
          }
        }
      }

      for (const idx of Object.keys(toolAcc).map(Number).sort()) {
        const t = toolAcc[idx];
        try {
          toolCalls.push({
            name: t.name,
            arguments: JSON.parse(t.arguments || "{}"),
          });
        } catch {
          toolCalls.push({ name: t.name, arguments: {} });
        }
      }

      return { content, toolCalls };
    },
  };
}

function parseCompletion(data: {
  choices?: Array<{
    message?: {
      content?: string | null;
      tool_calls?: Array<{
        function: { name: string; arguments: string };
      }>;
    };
  }>;
}): AIResponse {
  const message = data.choices?.[0]?.message;
  const content = message?.content ?? "";
  const toolCalls =
    message?.tool_calls?.map((tc) => ({
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments || "{}") as Record<
        string,
        unknown
      >,
    })) ?? [];
  return { content, toolCalls };
}
