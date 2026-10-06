import type { ReactNode } from "react";
import { useAppStore } from "@/store/appStore";
import { openUrl } from "@tauri-apps/plugin-opener";

export function PreviewPanel() {
  const previewUrl = useAppStore((s) => s.settings.previewUrl);
  const previewKey = useAppStore((s) => s.previewKey);
  const bumpPreview = useAppStore((s) => s.bumpPreview);
  const setFileDrawerOpen = useAppStore((s) => s.setFileDrawerOpen);
  const fileDrawerOpen = useAppStore((s) => s.fileDrawerOpen);

  return (
    <div className="flex flex-col h-full min-w-0 bg-blank-bg">
      <header className="flex items-center justify-between px-3 py-2 border-b border-blank-border bg-blank-surface shrink-0">
        <span className="text-sm text-blank-muted truncate flex-1">{previewUrl}</span>
        <div className="flex gap-1 shrink-0">
          <ToolbarButton onClick={() => setFileDrawerOpen(!fileDrawerOpen)} title="Show files (Ctrl+B)">
            Files
          </ToolbarButton>
          <ToolbarButton onClick={bumpPreview} title="Refresh preview">
            ↻
          </ToolbarButton>
          <ToolbarButton
            onClick={() => void openUrl(previewUrl)}
            title="Open in browser"
          >
            ↗
          </ToolbarButton>
        </div>
      </header>
      <div className="flex-1 relative">
        <iframe
          key={previewKey}
          src={previewUrl}
          title="Live preview"
          className="absolute inset-0 w-full h-full border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
        <div className="absolute inset-0 pointer-events-none border border-blank-border/30" />
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  title,
}: {
  children: ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="px-2 py-1 text-xs rounded border border-blank-border hover:bg-blank-elevated text-blank-text"
    >
      {children}
    </button>
  );
}
