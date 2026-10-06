import styles from "./footer.module.css";

export function SiteFooter({ githubUrl }: { githubUrl: string }) {
  return (
    <footer className={styles.footer}>
      <p>
        Blank — AI-only IDE ·{" "}
        <a
          className={styles.link}
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
        >
          Source
        </a>
      </p>
    </footer>
  );
}
