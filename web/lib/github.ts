export function normalizeRepoUrl(url: string): string {
  return url.replace(/\/$/, "").replace(/\.git$/i, "");
}

export function cloneCommand(repoUrl: string): string {
  const base = normalizeRepoUrl(repoUrl);
  return `git clone ${base}.git`;
}

export function detectDefaultOs(): "macos" | "windows" | "linux" {
  if (typeof navigator === "undefined") return "macos";
  const ua = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();
  if (platform.includes("win") || ua.includes("windows")) return "windows";
  if (platform.includes("mac") || ua.includes("macintosh")) return "macos";
  return "linux";
}
