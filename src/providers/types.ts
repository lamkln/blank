import type { AIResponse, ChatMessage, ProviderConfig } from "@/types";

export interface ProviderAdapter {
  sendMessage(
    config: ProviderConfig,
    messages: ChatMessage[],
    systemPrompt: string,
    onChunk?: (text: string) => void,
  ): Promise<AIResponse>;
}
