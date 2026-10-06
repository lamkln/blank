# Blank

**Blank** is a cross-platform desktop AI-only IDE: chat on the left, live preview on the right. You describe what you want; the agent proposes file edits and terminal commands. Every change waits for **Approve** or **Undo**. Files stay hidden unless you open the **Show files** drawer.

- **Landing site (OpenCode-inspired):** [`web/`](web/) — deploy with Vercel (see below)
- **Desktop app:** Tauri 2 + React + TypeScript + Tailwind

## Quick start

### Prerequisites

| Platform | Notes |
|----------|--------|
| **All** | [Node.js](https://nodejs.org/) 18+, [Rust](https://rustup.rs/) |
| **Windows** | [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) |
| **Linux** | `webkit2gtk` / GTK dev packages (see [Tauri Linux](https://v2.tauri.app/start/prerequisites/)) |
| **macOS** | Xcode CLI tools |

### Desktop development

```bash
git clone https://github.com/lamkln/blank.git
cd blank
npm install
npm run tauri:dev
```

### Desktop production builds

```bash
npm run tauri:build          # current OS
npm run tauri:build:mac      # macOS Apple Silicon
npm run tauri:build:mac-intel
npm run tauri:build:linux
npm run tauri:build:win
```

CI builds for **Windows, macOS (arm64 + x64), and Linux** run via [`.github/workflows/build-desktop.yml`](.github/workflows/build-desktop.yml) on pushes and tags.

### Landing site (Vercel)

```bash
cd web
npm install
npm run dev      # http://localhost:3001
npm run build
```

Deploy to Vercel (from repo root or `web/`):

```bash
cd web
npx vercel link    # once
npx vercel --prod
```

Set optional env vars in Vercel:

- `NEXT_PUBLIC_GITHUB_REPO` — GitHub repo URL for links
- `NEXT_PUBLIC_RELEASES_URL` — latest release download page

## Where settings and keys are stored

| Platform | Settings file | API keys |
|----------|---------------|----------|
| **Windows** | `%APPDATA%\blank-ide\settings.json` | DPAPI-encrypted in settings |
| **macOS** | `~/Library/Application Support/blank-ide/settings.json` | macOS Keychain (`keyring:` entries) |
| **Linux** | `~/.local/share/blank-ide/settings.json` | Secret Service / keyutils (`keyring:` entries) |

Keys are only sent to the provider you configure.

## Layout

| Area | Purpose |
|------|---------|
| **Chat (left)** | Tasks, agent replies, one-line plans, approval cards |
| **Preview (right)** | Embedded iframe (default `http://localhost:3000`) |
| **Files drawer** | Optional file list (`Ctrl+B`) |
| **Settings** | Providers, project folder, preview URL (`Ctrl+,`) |

## AI providers

OpenAI, Anthropic, Google Gemini, Groq, OpenRouter, and custom OpenAI-compatible base URLs — one active provider + model in the chat header.

## Agent loop

Plan → propose diff/command → Approve → run → refresh preview → stop when done.

## License

Apache License 2.0 — see [LICENSE](LICENSE).
