export type ProviderId =
  | "openai"
  | "anthropic"
  | "gemini"
  | "groq"
  | "openrouter"
  | "custom";

export interface ProviderConfig {
  id: string;
  type: ProviderId;
  name: string;
  apiKey: string;
  baseUrl?: string;
  model: string;
}

export interface AppSettings {
  activeProviderId: string | null;
  providers: ProviderConfig[];
  projectPath: string | null;
  previewUrl: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  plan?: string;
  timestamp: number;
}

export type ActionStatus = "pending" | "approved" | "rejected" | "undone";

export interface FileEditAction {
  id: string;
  type: "file_edit";
  path: string;
  oldContent: string | null;
  newContent: string;
  status: ActionStatus;
}

export interface CommandAction {
  id: string;
  type: "command";
  command: string;
  cwd: string;
  output: string;
  exitCode: number | null;
  status: ActionStatus;
}

export type AgentAction = FileEditAction | CommandAction;

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface AIStreamChunk {
  type: "text" | "plan" | "tool_call";
  content?: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
}

export interface AIResponse {
  content: string;
  toolCalls: Array<{
    name: string;
    arguments: Record<string, unknown>;
  }>;
}

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

export const PROVIDER_META: Record<
  ProviderId,
  { label: string; defaultBaseUrl: string; models: string[]; defaultModel: string }
> = {
  openai: {
    label: "OpenAI",
    defaultBaseUrl: "https://api.openai.com/v1",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1-mini"],
    defaultModel: "gpt-4o-mini",
  },
  anthropic: {
    label: "Anthropic",
    defaultBaseUrl: "https://api.anthropic.com",
    models: [
      "claude-sonnet-4-20250514",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
    ],
    defaultModel: "claude-sonnet-4-20250514",
  },
  gemini: {
    label: "Google Gemini",
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    defaultModel: "gemini-2.0-flash",
  },
  groq: {
    label: "Groq",
    defaultBaseUrl: "https://api.groq.com/openai/v1",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    defaultModel: "llama-3.3-70b-versatile",
  },
  openrouter: {
    label: "OpenRouter",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    models: [
      "anthropic/claude-sonnet-4",
      "openai/gpt-4o",
      "google/gemini-2.0-flash-001",
    ],
    defaultModel: "anthropic/claude-sonnet-4",
  },
  custom: {
    label: "Custom (OpenAI-compatible)",
    defaultBaseUrl: "http://localhost:11434/v1",
    models: ["default"],
    defaultModel: "default",
  },
};
