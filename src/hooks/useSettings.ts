import { useCallback, useEffect, useState } from "react";
import { useAppStore } from "@/store/appStore";
import type { ProviderConfig, ProviderId } from "@/types";
import { PROVIDER_META } from "@/types";
import { tauriApi } from "@/utils/tauriApi";

export function useSettingsPersistence() {
  const { setSettings, setProviders, setActiveProvider } = useAppStore();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await tauriApi.loadSettings();
        if (cancelled) return;
        const providers: ProviderConfig[] = await Promise.all(
          stored.providers.map(async (p) => ({
            id: p.id,
            type: p.type as ProviderId,
            name: p.name,
            apiKey: p.apiKeyEncrypted
              ? await tauriApi.decryptKey(p.apiKeyEncrypted)
              : "",
            baseUrl: p.baseUrl ?? undefined,
            model: p.model,
          })),
        );
        setProviders(providers);
        setActiveProvider(stored.activeProviderId);
        setSettings({
          projectPath: stored.projectPath,
          previewUrl: stored.previewUrl || "http://localhost:3000",
        });
      } catch (e) {
        console.warn("Settings load failed (browser mode?)", e);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setSettings, setProviders, setActiveProvider]);

  const persist = useCallback(async () => {
    const state = useAppStore.getState();
    const encryptedProviders = await Promise.all(
      state.settings.providers.map(async (p) => ({
        id: p.id,
        type: p.type,
        name: p.name,
        apiKeyEncrypted: p.apiKey
          ? await tauriApi.encryptKey(p.apiKey)
          : "",
        baseUrl: p.baseUrl,
        model: p.model,
      })),
    );
    await tauriApi.saveSettings({
      activeProviderId: state.settings.activeProviderId,
      providers: encryptedProviders,
      projectPath: state.settings.projectPath,
      previewUrl: state.settings.previewUrl,
    });
  }, []);

  return { loaded, persist };
}

export function createDefaultProvider(type: ProviderId): ProviderConfig {
  const meta = PROVIDER_META[type];
  return {
    id: crypto.randomUUID(),
    type,
    name: meta.label,
    apiKey: "",
    baseUrl: type === "custom" ? meta.defaultBaseUrl : undefined,
    model: meta.defaultModel,
  };
}
