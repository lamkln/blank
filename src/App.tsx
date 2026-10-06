import { useEffect } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { PreviewPanel } from "@/components/PreviewPanel";
import { FileDrawer } from "@/components/FileDrawer";
import { SettingsPanel } from "@/components/SettingsPanel";
import { WelcomeModal } from "@/components/WelcomeModal";
import { useSettingsPersistence } from "@/hooks/useSettings";
import { useAppStore } from "@/store/appStore";

function useKeyboardShortcuts() {
  const setFileDrawerOpen = useAppStore((s) => s.setFileDrawerOpen);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const clearChat = useAppStore((s) => s.clearChat);
  const fileDrawerOpen = useAppStore((s) => s.fileDrawerOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        setFileDrawerOpen(!fileDrawerOpen);
      }
      if (e.ctrlKey && e.key === ",") {
        e.preventDefault();
        setSettingsOpen(true);
      }
      if (e.ctrlKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        clearChat();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fileDrawerOpen, setFileDrawerOpen, setSettingsOpen, clearChat]);
}

export default function App() {
  const { loaded } = useSettingsPersistence();
  useKeyboardShortcuts();

  return (
    <div className="h-full flex relative">
      <div className="w-[min(440px,40%)] shrink-0 min-w-[320px]">
        <ChatPanel />
      </div>
      <div className="flex-1 min-w-0 relative">
        <PreviewPanel />
        <FileDrawer />
      </div>
      <SettingsPanel />
      <WelcomeModal ready={loaded} />
    </div>
  );
}
