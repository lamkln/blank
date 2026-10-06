import styles from "./terminal.module.css";

export function HeroTerminal() {
  return (
    <div className={styles.terminal} aria-hidden>
      <div className={styles.bar}>
        <span>blank — agent</span>
        <span className={styles.hint}>ctrl+, settings · ctrl+b files</span>
      </div>
      <pre className={styles.content}>{`> add a login page with email magic link

Plan: scaffold auth route and update home CTA

┌ file change ────────────────────────────────┐
│ src/app/login/page.tsx                      │
│ + export default function Login() { ... }   │
│                         [ Undo ] [ Approve ]│
└─────────────────────────────────────────────┘

┌ command ────────────────────────────────────┐
│ npm run dev                                 │
│                         [ Undo ] [ Approve ]│
└─────────────────────────────────────────────┘

Preview · http://localhost:3000  ↻  ↗`}</pre>
    </div>
  );
}
