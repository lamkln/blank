import { create } from "zustand";
import type {
  AgentAction,
  AppSettings,
  ChatMessage,
  ProviderConfig,
} from "@/types";

interface AppState {
  settings: AppSettings;
  messages: ChatMessage[];
  pendingActions: AgentAction[];
  actionHistory: AgentAction[];
  fileDrawerOpen: boolean;
  settingsOpen: boolean;
  agentBusy: boolean;
  previewKey: number;
  setSettings: (partial: Partial<AppSettings>) => void;
  setProviders: (providers: ProviderConfig[]) => void;
  setActiveProvider: (id: string | null) => void;
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => string;
  updateMessage: (id: string, partial: Partial<ChatMessage>) => void;
  setPendingActions: (actions: AgentAction[]) => void;
  updateAction: (id: string, partial: Partial<AgentAction>) => void;
  pushActionHistory: (action: AgentAction) => void;
  setFileDrawerOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setAgentBusy: (busy: boolean) => void;
  bumpPreview: () => void;
  clearChat: () => void;
}

const defaultSettings: AppSettings = {
  activeProviderId: null,
  providers: [],
  projectPath: null,
  previewUrl: "http://localhost:3000",
};

export const useAppStore = create<AppState>((set) => ({
  settings: defaultSettings,
  messages: [],
  pendingActions: [],
  actionHistory: [],
  fileDrawerOpen: false,
  settingsOpen: false,
  agentBusy: false,
  previewKey: 0,

  setSettings: (partial) =>
    set((s) => ({ settings: { ...s.settings, ...partial } })),

  setProviders: (providers) =>
    set((s) => ({ settings: { ...s.settings, providers } })),

  setActiveProvider: (id) =>
    set((s) => ({ settings: { ...s.settings, activeProviderId: id } })),

  addMessage: (msg) => {
    const id = crypto.randomUUID();
    set((s) => ({
      messages: [
        ...s.messages,
        { ...msg, id, timestamp: Date.now() },
      ],
    }));
    return id;
  },

  updateMessage: (id, partial) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, ...partial } : m,
      ),
    })),

  setPendingActions: (actions) => set({ pendingActions: actions }),

  updateAction: (id, partial) =>
    set((s) => ({
      pendingActions: s.pendingActions.map((a) =>
        a.id === id ? ({ ...a, ...partial } as AgentAction) : a,
      ),
      actionHistory: s.actionHistory.map((a) =>
        a.id === id ? ({ ...a, ...partial } as AgentAction) : a,
      ),
    })),

  pushActionHistory: (action) =>
    set((s) => ({ actionHistory: [...s.actionHistory, action] })),

  setFileDrawerOpen: (open) => set({ fileDrawerOpen: open }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setAgentBusy: (busy) => set({ agentBusy: busy }),
  bumpPreview: () => set((s) => ({ previewKey: s.previewKey + 1 })),
  clearChat: () => set({ messages: [], pendingActions: [] }),
}));

export function getActiveProvider(state: AppState): ProviderConfig | null {
  const { activeProviderId, providers } = state.settings;
  if (!activeProviderId) return null;
  return providers.find((p) => p.id === activeProviderId) ?? null;
}
