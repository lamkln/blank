# Blank

**Blank** is a Windows desktop AI-only IDE: one window with chat on the left and live preview on the right. You describe what you want; the agent proposes file edits and terminal commands. Every change waits for **Approve** or **Undo**. Files stay hidden unless you open the **Show files** drawer.

Built with **Tauri 2**, **React**, **TypeScript**, and **Tailwind CSS**.

## Quick start (Windows)

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) (for the Tauri shell)
- [Microsoft Edge WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (usually already installed on Windows 11)

### Run in development

```powershell
git clone <this-repo>
cd blank-ide
npm install
npm run tauri:dev
```

On first launch:

1. Choose a **project folder** (or scaffold Next.js / static site in Settings → Project).
2. Open **Settings** → add a provider, paste your **API key**, pick a **model**, and set it as active.
3. Type a task in chat (for example: `scaffold a landing page and run the dev server`).

### Production build

```powershell
npm run tauri:build
```

The Windows executable is under `src-tauri\target\release\`. The installer/bundle output depends on your Tauri bundle settings (MSI/NSIS/exe).

## Layout

| Area | Purpose |
|------|---------|
| **Chat (left)** | Tasks, agent replies, one-line plans, approval cards |
| **Preview (right)** | Embedded iframe (default `http://localhost:3000`) |
| **Files drawer** | Optional file list (`Ctrl+B`) — files are not shown by default |
| **Settings** | Providers, project folder, preview URL (`Ctrl+,`) |

## AI providers

All providers share the same chat + tool interface:

| Provider | Notes |
|----------|--------|
| OpenAI | Default OpenAI API base URL |
| Anthropic | Claude models |
| Google Gemini | Gemini API |
| Groq | OpenAI-compatible Groq endpoint |
| OpenRouter | OpenAI-compatible router |
| Custom | Your own OpenAI-compatible base URL (local LLMs, proxies, etc.) |

The active **provider and model** appear in the chat header. Changing provider does **not** delete your project.

**API keys** are sent only to the provider you configure. They are **not** hardcoded in the repo.

## Where settings and keys are stored (Windows)

| Data | Location |
|------|----------|
| App settings (providers, active model, project path, preview URL) | `%APPDATA%\blank-ide\settings.json` |
| API keys inside settings | Encrypted with **Windows DPAPI** (`CryptProtectData`) before being written to disk |

On non-Windows dev builds, encryption falls back to a reversible base64 wrapper (`plain:` prefix) so Linux/macOS development still works — production use is intended on **Windows**.

## Agent loop

1. Read your message  
2. Emit a **one-line plan** (`plan` tool)  
3. Propose **file edits** as diffs (`write_file`) → wait for Approve  
4. Propose **commands** (`run_command`) → wait for Approve → output appears **only on the approval card**  
5. Refresh preview when a dev/start/serve command succeeds  
6. On failure, surface errors and propose fixes (approve again)  
7. **Stop** when you say stop or the preview is up (`stop` tool)

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Toggle file drawer |
| `Ctrl+,` | Settings |
| `Ctrl+L` | Clear chat |
| `Enter` | Send message |
| `Shift+Enter` | New line in chat input |

## MVP scope

- New project: blank **Next.js** (via `create-next-app`) or **static HTML/CSS/JS** scaffold  
- Chat, preview, approve/undo for files and commands  
- Provider settings for all listed backends  
- Allowed shell commands: `npm`, `npx`, `node`, `pnpm`, `yarn`, `cmd`, `powershell`, `pwsh`

## Out of scope

Plugins, themes, git UI, accounts, cloud sync, billing.

## Project structure

```
blank-ide/
├── src/                 # React UI, providers, agent hook
├── src-tauri/           # Rust: FS, shell, DPAPI, scaffolds
├── package.json
└── README.md
```

## Troubleshooting

**`cargo` / Rust not found** — Install from [rustup.rs](https://rustup.rs/) and restart your terminal.

**WebView2 missing** — Install the [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/).

**Preview blank** — Confirm the dev server is running and the preview URL in Settings matches (default port 3000).

**Provider errors** — Check the API key, model id, and base URL (custom/OpenRouter).

## License

Apache License 2.0 — see [LICENSE](LICENSE).
