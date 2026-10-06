"use client";

import { useState } from "react";
import styles from "./download.module.css";

type Os = "macos" | "windows" | "linux";

const RELEASE_BASE =
  process.env.NEXT_PUBLIC_RELEASES_URL ??
  "https://github.com/lamkln/blank/releases/latest";

export function DownloadTabs({ githubUrl }: { githubUrl: string }) {
  const [os, setOs] = useState<Os>("macos");

  const labels: Record<Os, string> = {
    macos: "macOS (.dmg)",
    windows: "Windows (.msi / .exe)",
    linux: "Linux (.deb / .AppImage)",
  };

  return (
    <div id="download" className={styles.wrap}>
      <div className={styles.tabs} role="tablist">
        {(Object.keys(labels) as Os[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={os === key}
            className={`${styles.tabBtn} ${os === key ? styles.tabBtnActive : ""}`}
            onClick={() => setOs(key)}
          >
            {key === "macos" ? "macOS" : key === "windows" ? "Windows" : "Linux"}
          </button>
        ))}
      </div>
      <div className={styles.panel} role="tabpanel">
        <p className={styles.label}>{labels[os]}</p>
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
          first release, build locally with <code>npm run tauri:build</code>.
        </p>
      </div>
    </div>
  );
}
