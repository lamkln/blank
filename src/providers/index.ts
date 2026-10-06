import type { ProviderId } from "@/types";
import { PROVIDER_META } from "@/types";
import { anthropicAdapter } from "./anthropic";
import { geminiAdapter } from "./gemini";
import { createOpenAICompatibleAdapter } from "./openaiCompatible";
import type { ProviderAdapter } from "./types";

export function getProviderAdapter(type: ProviderId): ProviderAdapter {
  switch (type) {
    case "anthropic":
      return anthropicAdapter;
    case "gemini":
      return geminiAdapter;
    case "openai":
      return createOpenAICompatibleAdapter(PROVIDER_META.openai.defaultBaseUrl);
    case "groq":
      return createOpenAICompatibleAdapter(PROVIDER_META.groq.defaultBaseUrl);
    case "openrouter":
      return createOpenAICompatibleAdapter(PROVIDER_META.openrouter.defaultBaseUrl);
    case "custom":
      return createOpenAICompatibleAdapter(PROVIDER_META.custom.defaultBaseUrl);
    default:
      return createOpenAICompatibleAdapter(PROVIDER_META.openai.defaultBaseUrl);
  }
}
