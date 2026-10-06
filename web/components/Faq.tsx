import styles from "./faq.module.css";

const ITEMS = [
  {
    q: "What is Blank?",
    a: "A desktop AI-only IDE: you chat, the agent edits and runs your project, and you approve every change.",
  },
  {
    q: "Which platforms are supported?",
    a: "Windows, macOS (Apple Silicon and Intel), and Linux (.deb / AppImage via Tauri).",
  },
  {
    q: "Do I need separate AI subscriptions?",
    a: "You bring your own API keys for OpenAI, Anthropic, Gemini, Groq, OpenRouter, or any OpenAI-compatible host.",
  },
  {
    q: "Where are my keys stored?",
    a: "Locally in your OS credential store (DPAPI on Windows, Keychain on macOS, Secret Service on Linux).",
  },
  {
    q: "Is Blank open source?",
    a: "Yes — Apache 2.0. Clone the repo and run npm run tauri:dev.",
  },
];

export function Faq() {
  return (
    <section id="faq" className={`${styles.section} ${styles.anchorTarget}`}>
      <h2>FAQ</h2>
      <div className={styles.faq}>
        {ITEMS.map(({ q, a }) => (
          <article key={q} className={styles.item}>
            <h3 className={styles.question}>{q}</h3>
            <p className={styles.answer}>{a}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
