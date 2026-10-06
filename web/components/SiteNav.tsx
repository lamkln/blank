import Link from "next/link";
import styles from "./nav.module.css";

export function SiteNav({ githubUrl }: { githubUrl: string }) {
  return (
    <header className={styles.nav}>
      <Link href="/" className={styles.brand}>
        <pre className={styles.logo} aria-label="Blank">
          {`┌┐  ┬  ┌─┐ ┬┌┐┌ ┌┬┐
├┤  │  ├─┤ ││││  │
└┘  ┴  ┴ ┴ ┴┘└┘  ┴`}
        </pre>
        <span>Blank</span>
      </Link>
      <nav className={styles.links}>
        <a href="#download">Download</a>
        <a href="#faq">FAQ</a>
        <a href={githubUrl} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </nav>
    </header>
  );
}
