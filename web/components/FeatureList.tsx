import styles from "./features.module.css";

const FEATURES = [
  "Chat-first workflow — no file tree, no tabs, no extension store",
  "Approve or Undo every file diff and shell command",
  "Live preview pane with refresh and open-in-browser",
  "Optional file drawer when you need to see paths",
  "Scaffold Next.js or a tiny static site from Settings",
  "Agent loop: plan → propose → approve → run → preview → stop",
];

export function FeatureList() {
  return (
    <ul className={styles.list}>
      {FEATURES.map((f) => (
        <li key={f}>
          <span>[+]</span>
          {f}
        </li>
      ))}
    </ul>
  );
}
