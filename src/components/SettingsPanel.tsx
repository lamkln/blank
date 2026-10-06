import { useState, type ReactNode } from "react";
import { useAppStore } from "@/store/appStore";
import type { ProviderId } from "@/types";
import { PROVIDER_META } from "@/types";
import {
  createDefaultProvider,
  useSettingsPersistence,
} from "@/hooks/useSettings";
import { tauriApi } from "@/utils/tauriApi";

type Tab = "providers" | "project";

export function SettingsPanel() {
  const open = useAppStore((s) => s.settingsOpen);
  const setOpen = useAppStore((s) => s.setSettingsOpen);
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const setProviders = useAppStore((s) => s.setProviders);
  const setActiveProvider = useAppStore((s) => s.setActiveProvider);
  const { persist } = useSettingsPersistence();
  const [tab, setTab] = useState<Tab>("providers");
  const [status, setStatus] = useState("");

  if (!open) return null;

  const saveAll = async () => {
    try {
      await persist();
      setStatus("Saved locally.");
      setTimeout(() => setStatus(""), 2000);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Save failed");
    }
  };

  const addProvider = (type: ProviderId) => {
    const p = createDefaultProvider(type);
    setProviders([...settings.providers, p]);
    if (!settings.activeProviderId) setActiveProvider(p.id);
  };

  const updateProvider = (
    id: string,
    patch: Partial<(typeof settings.providers)[0]>,
  ) => {
    setProviders(
      settings.providers.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  };

  const removeProvider = (id: string) => {
    const next = settings.providers.filter((p) => p.id !== id);
    setProviders(next);
    if (settings.activeProviderId === id) {
      setActiveProvider(next[0]?.id ?? null);
    }
  };

  const pickFolder = async () => {
    const path = await tauriApi.pickProjectFolder();
    if (path) setSettings({ projectPath: path });
  };

  const scaffold = async (kind: "next" | "static") => {
    const parent = await tauriApi.pickProjectFolder();
    if (!parent) return;
    const name = kind === "next" ? "blank-next-app" : "blank-static-site";
    const projectPath =
      kind === "next"
        ? await tauriApi.scaffoldNextJs(parent, name)
        : await tauriApi.scaffoldStatic(parent, name);
    setSettings({ projectPath });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-blank-border bg-blank-surface shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-blank-border">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-blank-muted hover:text-blank-text"
          >
            ✕
          </button>
        </div>

        <div className="flex border-b border-blank-border px-4 gap-4">
          <TabButton active={tab === "providers"} onClick={() => setTab("providers")}>
            AI providers
          </TabButton>
          <TabButton active={tab === "project"} onClick={() => setTab("project")}>
            Project
          </TabButton>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tab === "providers" && (
            <>
              <p className="text-sm text-blank-muted">
                API keys are stored on this PC only (encrypted). Requests go directly to the provider you select.
              </p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PROVIDER_META) as ProviderId[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addProvider(type)}
                    className="text-xs px-2 py-1 rounded border border-blank-border hover:bg-blank-elevated"
                  >
                    + {PROVIDER_META[type].label}
                  </button>
                ))}
              </div>

              {settings.providers.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-blank-border p-3 space-y-2 bg-blank-elevated/30"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="activeProvider"
                      checked={settings.activeProviderId === p.id}
                      onChange={() => setActiveProvider(p.id)}
                    />
                    <input
                      className="flex-1 bg-blank-bg border border-blank-border rounded px-2 py-1 text-sm"
                      value={p.name}
                      onChange={(e) => updateProvider(p.id, { name: e.target.value })}
                    />
                    <button
                      type="button"
                      className="text-xs text-blank-danger"
                      onClick={() => removeProvider(p.id)}
                    >
                      Remove
                    </button>
                  </div>
                  <label className="block text-xs text-blank-muted">
                    API key
                    <input
                      type="password"
                      className="mt-1 w-full bg-blank-bg border border-blank-border rounded px-2 py-1 text-sm font-mono"
                      value={p.apiKey}
                      onChange={(e) => updateProvider(p.id, { apiKey: e.target.value })}
                      autoComplete="off"
                    />
                  </label>
                  {(p.type === "custom" || p.type === "openrouter") && (
                    <label className="block text-xs text-blank-muted">
                      Base URL
                      <input
                        className="mt-1 w-full bg-blank-bg border border-blank-border rounded px-2 py-1 text-sm font-mono"
                        value={p.baseUrl ?? ""}
                        onChange={(e) =>
                          updateProvider(p.id, { baseUrl: e.target.value })
                        }
                      />
                    </label>
                  )}
                  <label className="block text-xs text-blank-muted">
                    Model
                    <input
                      list={`models-${p.id}`}
                      className="mt-1 w-full bg-blank-bg border border-blank-border rounded px-2 py-1 text-sm font-mono"
                      value={p.model}
                      onChange={(e) => updateProvider(p.id, { model: e.target.value })}
                    />
                    <datalist id={`models-${p.id}`}>
                      {PROVIDER_META[p.type].models.map((m) => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                  </label>
                </div>
              ))}
            </>
          )}

          {tab === "project" && (
            <>
              <div>
                <p className="text-sm text-blank-muted mb-2">One project folder per window.</p>
                <p className="text-sm font-mono break-all bg-blank-bg p-2 rounded border border-blank-border">
                  {settings.projectPath ?? "Not set"}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => void pickFolder()}
                    className="px-3 py-1.5 text-sm rounded bg-blank-accent text-white"
                  >
                    Choose folder
                  </button>
                  <button
                    type="button"
                    onClick={() => void scaffold("next")}
                    className="px-3 py-1.5 text-sm rounded border border-blank-border"
                  >
                    Scaffold Next.js
                  </button>
                  <button
                    type="button"
                    onClick={() => void scaffold("static")}
                    className="px-3 py-1.5 text-sm rounded border border-blank-border"
                  >
                    Scaffold static site
                  </button>
                </div>
              </div>
              <label className="block text-sm text-blank-muted">
                Preview URL
                <input
                  className="mt-1 w-full bg-blank-bg border border-blank-border rounded px-2 py-1 text-sm font-mono"
                  value={settings.previewUrl}
                  onChange={(e) => setSettings({ previewUrl: e.target.value })}
                />
              </label>
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-blank-border">
          <span className="text-xs text-blank-success">{status}</span>
          <button
            type="button"
            onClick={() => void saveAll()}
            className="px-4 py-2 rounded-lg bg-blank-accent text-white text-sm font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-2 text-sm border-b-2 -mb-px ${
        active
          ? "border-blank-accent text-blank-text"
          : "border-transparent text-blank-muted hover:text-blank-text"
      }`}
    >
      {children}
    </button>
  );
}
