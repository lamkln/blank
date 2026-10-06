"use client";

import { useEffect, useId, useState } from "react";
import { detectDefaultOs } from "@/lib/github";
import styles from "./download.module.css";

type Os = "macos" | "windows" | "linux";

const TAB_ORDER: Os[] = ["macos", "windows", "linux"];

const RELEASE_BASE =
  process.env.NEXT_PUBLIC_RELEASES_URL ??
  "https://github.com/lamkln/blank/releases/latest";

export function DownloadTabs({ githubUrl }: { githubUrl: string }) {
  const [os, setOs] = useState<Os>("macos");
  const [mounted, setMounted] = useState(false);
  const baseId = useId();

  useEffect(() => {
    setOs(detectDefaultOs());
    setMounted(true);
  }, []);

  const labels: Record<Os, string> = {
    macos: "macOS (.dmg)",
    windows: "Windows (.msi / .exe)",
    linux: "Linux (.deb / .AppImage)",
  };

  const panelId = `${baseId}-panel`;

  return (
    <section id="download" className={`${styles.wrap} ${styles.anchorTarget}`}>
      <div className={styles.tabs} role="tablist" aria-label="Choose platform">
        {TAB_ORDER.map((key) => {
          const tabId = `${baseId}-tab-${key}`;
          const selected = os === key;
          return (
            <button
              key={key}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              className={`${styles.tabBtn} ${selected ? styles.tabBtnActive : ""}`}
              onClick={() => setOs(key)}
              onKeyDown={(e) => {
                const idx = TAB_ORDER.indexOf(key);
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  setOs(TAB_ORDER[(idx + 1) % TAB_ORDER.length]);
                }
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  setOs(TAB_ORDER[(idx + TAB_ORDER.length - 1) % TAB_ORDER.length]);
                }
              }}
            >
              {key === "macos" ? "macOS" : key === "windows" ? "Windows" : "Linux"}
            </button>
          );
        })}
      </div>
      <div
        id={panelId}
        className={styles.panel}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${os}`}
      >
        <p className={styles.label}>
          {mounted ? labels[os] : "Pick your platform"}
        </p>
        <div className={styles.actions}>
          <a className={`${styles.btn} ${styles.btnPrimary}`} href={RELEASE_BASE}>
            Download
          </a>
          <a className={styles.btn} href={githubUrl}>
            All releases
          </a>
        </div>
        <p className={styles.note}>
          Desktop builds are produced by GitHub Actions on tag push. Until the
          first release, build locally with{" "}
          <code>npm run tauri:build</code>.
        </p>
      </div>
    </section>
  );
}
