import { useRef, useEffect, useState, KeyboardEvent } from "react";
import { useAppStore, getActiveProvider } from "@/store/appStore";
import { ApprovalCard } from "./ApprovalCard";
import { useAgent } from "@/hooks/useAgent";
export function ChatPanel() {
  const messages = useAppStore((s) => s.messages);
  const pendingActions = useAppStore((s) => s.pendingActions);
  const actionHistory = useAppStore((s) => s.actionHistory);
  const agentBusy = useAppStore((s) => s.agentBusy);
  const settings = useAppStore((s) => s.settings);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const clearChat = useAppStore((s) => s.clearChat);
  const { runAgentLoop } = useAgent();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = getActiveProvider(useAppStore.getState());
  const providerLabel = active
    ? `${active.name} · ${active.model}`
    : "No provider";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingActions]);

  const send = async () => {
    const text = input.trim();
    if (!text || agentBusy) return;
    setInput("");
    await runAgentLoop(text);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <div className="flex flex-col h-full min-w-0 border-r border-blank-border">
      <header className="flex items-center justify-between px-4 py-3 border-b border-blank-border bg-blank-surface shrink-0">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Blank</h1>
          <p className="text-xs text-blank-muted truncate max-w-md" title={providerLabel}>
            {providerLabel}
          </p>
        </div>
        <div className="flex gap-1">
          <IconButton title="Clear chat (Ctrl+L)" onClick={clearChat} label="⌫" />
          <IconButton
            title="Settings (Ctrl+,)"
            onClick={() => setSettingsOpen(true)}
            label="⚙"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && (
          <div className="text-blank-muted text-sm mt-8 max-w-md">
            <p className="mb-2">Describe what to build. Files stay hidden until you open the drawer.</p>
            {!settings.projectPath && (
              <p className="text-blank-warning">Pick a project folder in Settings to start.</p>
            )}
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === "user"
                ? "ml-8 rounded-lg bg-blank-elevated px-3 py-2 text-sm"
                : "mr-4 text-sm space-y-1"
            }
          >
            {m.plan && (
              <div className="text-xs text-blank-accent font-medium mb-1">
                Plan: {m.plan}
              </div>
            )}
            <div className="whitespace-pre-wrap break-words">{m.content}</div>
          </div>
        ))}

        {[...actionHistory, ...pendingActions.filter(
          (p) => !actionHistory.some((h) => h.id === p.id),
        )].map((a) => (
          <ApprovalCard key={a.id} action={a} />
        ))}

        {agentBusy && (
          <div className="text-xs text-blank-muted animate-pulse-subtle">Agent working…</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-blank-border bg-blank-surface shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Add login, scaffold Next.js, fix the error…"
          rows={3}
          className="w-full resize-none rounded-lg border border-blank-border bg-blank-bg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blank-accent"
          disabled={agentBusy}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-blank-muted">
            Enter send · Shift+Enter newline
          </span>
          <button
            type="button"
            onClick={() => void send()}
            disabled={agentBusy || !input.trim()}
            className="px-4 py-1.5 rounded-lg bg-blank-accent hover:bg-blank-accent-hover disabled:opacity-40 text-white text-sm font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  onClick,
  title,
  label,
}: {
  onClick: () => void;
  title: string;
  label: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="w-8 h-8 rounded hover:bg-blank-border/60 text-sm"
    >
      {label}
    </button>
  );
}
