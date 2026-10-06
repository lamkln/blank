import type { AIResponse } from "@/types";
import type { ProviderAdapter } from "./types";

const TOOL_DECLARATIONS = [
  {
    name: "write_file",
    description: "Propose writing or updating a file in the project",
    parameters: {
      type: "OBJECT",
      properties: {
        path: { type: "STRING" },
        content: { type: "STRING" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "run_command",
    description: "Propose running a shell command",
    parameters: {
      type: "OBJECT",
      properties: {
        command: { type: "STRING" },
      },
      required: ["command"],
    },
  },
  {
    name: "plan",
    description: "One-line plan",
    parameters: {
      type: "OBJECT",
      properties: { line: { type: "STRING" } },
      required: ["line"],
    },
  },
  {
    name: "stop",
    description: "Stop when done",
    parameters: {
      type: "OBJECT",
      properties: { message: { type: "STRING" } },
      required: ["message"],
    },
  },
];

export const geminiAdapter: ProviderAdapter = {
  async sendMessage(config, messages, systemPrompt, onChunk) {
    const base =
      config.baseUrl?.replace(/\/$/, "") ??
      "https://generativelanguage.googleapis.com/v1beta";
    const url = `${base}/models/${encodeURIComponent(config.model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(config.apiKey)}`;

    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const body = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
    }

    let content = "";
    const toolCalls: AIResponse["toolCalls"] = [];

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
        try {
          const parsed = JSON.parse(payload);
          const parts = parsed.candidates?.[0]?.content?.parts ?? [];
          for (const part of parts) {
            if (part.text) {
              content += part.text;
              onChunk?.(part.text);
            }
            if (part.functionCall) {
              toolCalls.push({
                name: part.functionCall.name,
                arguments: part.functionCall.args ?? {},
              });
            }
          }
        } catch {
          /* ignore */
        }
      }
    }

    return { content, toolCalls };
  },
};
