import { DownloadTabs } from "@/components/DownloadTabs";
import { Faq } from "@/components/Faq";
import { FeatureList } from "@/components/FeatureList";
import { HeroTerminal } from "@/components/HeroTerminal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import styles from "./page.module.css";

const GITHUB =
  process.env.NEXT_PUBLIC_GITHUB_REPO ?? "https://github.com/lamkln/blank";

export default function HomePage() {
  return (
    <>
      <SiteNav githubUrl={GITHUB} />
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.chip}>[+] desktop · macOS · Windows · Linux</p>
          <h1 className={styles.title}>The AI-only IDE</h1>
          <p className={styles.lede}>
            One window: chat on the left, live preview on the right. You describe
            the task; the agent proposes diffs and commands. Every change waits
            for Approve or Undo. Files stay hidden until you open the drawer.
          </p>
          <DownloadTabs githubUrl={GITHUB} />
          <HeroTerminal />
        </section>

        <section className={styles.section}>
          <h2>What is Blank?</h2>
          <p className={styles.bodyText}>
            Blank is a native desktop app for people who want to build software
            by conversation — not by hunting through tabs and trees. Pick your
            AI provider, pick a project folder, and talk. The agent plans in one
            line, shows you the diff, runs the dev server after you approve, and
            stops when the preview is up.
          </p>
          <FeatureList />
        </section>

        <section className={styles.section}>
          <h2>Built for privacy first</h2>
          <p className={styles.bodyText}>
            API keys live on your machine only — Windows DPAPI, macOS Keychain, or
            Linux Secret Service. Requests go straight to the provider you
            choose. No accounts, no cloud sync, no telemetry in the MVP.
          </p>
          <ul className={styles.asciiList}>
            <li>
              <span>[+]</span> OpenAI, Anthropic, Gemini, Groq, OpenRouter, custom
              OpenAI-compatible URL
            </li>
            <li>
              <span>[+]</span> Active provider + model shown in the chat header
            </li>
            <li>
              <span>[+]</span> Settings stored under your OS app data directory
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Install from source</h2>
          <p className={styles.bodyText}>
            Requires Node.js 18+, Rust, and platform WebView dependencies.
          </p>
          <pre className={styles.installBlock}>
            <code>{`git clone ${GITHUB}.git
cd blank
npm install
npm run tauri:dev    # dev
npm run tauri:build  # release binary for your OS`}</code>
          </pre>
        </section>

        <Faq />
      </main>
      <SiteFooter githubUrl={GITHUB} />
    </>
  );
}
