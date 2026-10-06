import { useEffect, useState } from "react";
import { useAppStore } from "@/store/appStore";
import type { FileEntry } from "@/types";
import { tauriApi } from "@/utils/tauriApi";

export function FileDrawer() {
  const open = useAppStore((s) => s.fileDrawerOpen);
  const projectPath = useAppStore((s) => s.settings.projectPath);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!open || !projectPath) return;
    let cancelled = false;
    const load = async () => {
      try {
        const list = await tauriApi.listFiles(projectPath);
        if (!cancelled) {
          setFiles(
            list.map((f) => ({
              name: f.name,
              path: f.path,
              isDirectory: f.is_directory,
            })),
          );
        }
      } catch (e) {
        console.warn(e);
      }
    };
    void load();
    const t = setInterval(load, 3000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [open, projectPath]);

  if (!open) return null;

  const filtered = files.filter(
    (f) =>
      !filter ||
      f.path.toLowerCase().includes(filter.toLowerCase()) ||
      f.name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <aside className="absolute top-0 right-0 bottom-0 w-72 z-20 flex flex-col border-l border-blank-border bg-blank-surface shadow-xl">
      <div className="px-3 py-2 border-b border-blank-border flex items-center justify-between">
        <span className="text-sm font-medium">Project files</span>
        <button
          type="button"
          className="text-blank-muted hover:text-blank-text text-sm"
          onClick={() => useAppStore.getState().setFileDrawerOpen(false)}
        >
          ✕
        </button>
      </div>
      <input
        type="search"
        placeholder="Filter…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mx-2 mt-2 px-2 py-1 text-sm rounded border border-blank-border bg-blank-bg focus:outline-none focus:ring-1 focus:ring-blank-accent"
      />
      <ul className="flex-1 overflow-y-auto p-2 text-sm font-mono">
        {!projectPath && (
          <li className="text-blank-muted px-2 py-1">No project selected</li>
        )}
        {filtered.map((f) => (
          <li
            key={f.path}
            className="px-2 py-0.5 truncate text-blank-muted hover:text-blank-text hover:bg-blank-elevated rounded cursor-default"
            title={f.path}
          >
            {f.isDirectory ? "📁 " : "📄 "}
            {f.path}
          </li>
        ))}
      </ul>
    </aside>
  );
}
