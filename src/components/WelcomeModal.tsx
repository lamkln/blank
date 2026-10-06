import { useAppStore } from "@/store/appStore";
import { tauriApi } from "@/utils/tauriApi";

export function WelcomeModal({ ready }: { ready: boolean }) {
  const projectPath = useAppStore((s) => s.settings.projectPath);
  const setSettings = useAppStore((s) => s.setSettings);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);

  if (!ready || projectPath) return null;

  const choose = async () => {
    const path = await tauriApi.pickProjectFolder();
    if (path) setSettings({ projectPath: path });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
      <div className="max-w-md rounded-xl border border-blank-border bg-blank-surface p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-2">Welcome to Blank</h2>
        <p className="text-sm text-blank-muted mb-4">
          Pick a folder for this project, then add an AI provider in Settings. You talk; the agent writes and runs code.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => void choose()}
            className="w-full py-2 rounded-lg bg-blank-accent text-white font-medium"
          >
            Choose project folder
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="w-full py-2 rounded-lg border border-blank-border text-sm"
          >
            Open Settings
          </button>
        </div>
      </div>
    </div>
  );
}
