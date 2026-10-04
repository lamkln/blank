# Blank IDE

> A Windows desktop AI-only IDE with chat on the left, live preview on the right, hidden file drawer, approval-based file/command execution, and multi-provider AI support.

![Blank IDE Screenshot](https://via.placeholder.com/1200x700/1e1e2e/ffffff?text=Blank+IDE)

## Features

### 🤖 Multi-Provider AI Support
- **OpenAI** (GPT-4, GPT-3.5, etc.)
- **Anthropic** (Claude 3 Opus/Sonnet/Haiku)
- **Google Gemini** (1.5 Pro/Flash)
- **Groq** (Llama 3, Mixtral, Gemma)
- **OpenRouter** (Access 100+ models)
- **Custom** (Any OpenAI-compatible API)

### 💬 Chat-Centric Workflow
- Natural language conversation with AI agent
- Streaming responses with tool use visualization
- Context-aware code generation and editing

### ✅ Approval-Based Execution
- Every file edit and command requires explicit approval
- Side-by-side diff preview for file changes
- Command preview with working directory context
- One-click approve/reject with undo support

### 📁 Hidden File Drawer
- Collapsible file explorer (toggle with `Ctrl+B`)
- Filter files by name
- Click to open in editor context
- Real-time file system watching

### 🔴 Live Preview
- Embedded preview of your running dev server (port 3000)
- Automatic fallback to static file serving
- Refresh, open in browser, and copy URL actions

### 🔐 Secure Configuration
- API keys encrypted at rest using Windows DPAPI
- Provider configurations stored locally
- No telemetry or data collection

### 🎨 Developer Experience
- VS Code-inspired dark theme
- Keyboard shortcuts for common actions
- Responsive split-pane layout
- Smooth animations and transitions
## Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Rust** 1.70+ (install via [rustup.rs](https://rustup.rs/))
- **Windows 10/11** (primary target)

### Development

```bash
# Clone the repository
git clone https://github.com/yourusername/blank-ide.git
cd blank-ide

# Install frontend dependencies
npm install

# Start development server (frontend + Tauri)
npm run tauri:dev
```

### Production Build

```bash
# Build frontend and Tauri app
npm run tauri:build

# Output: src-tauri/target/release/blank-ide.exe
```

### Frontend Only (No Tauri)

```bash
# Start Vite dev server
npm run dev
# Open http://localhost:1420 (Tauri APIs won't work)
```

## Project Structure

```
blank-ide/
├── src/                          # React frontend
│   ├── components/               # UI components
│   │   ├── ApprovalCard.tsx      # Action approval with diff view
│   │   ├── ChatPanel.tsx         # Chat interface
│   │   ├── FileTree.tsx          # File explorer
│   │   ├── PreviewPanel.tsx      # Live preview iframe
│   │   ├── ProviderPicker.tsx    # Provider selection
│   │   ├── SettingsPanel.tsx     # Settings modal
│   │   └── ...
│   ├── hooks/                    # React hooks
│   │   ├── useAgent.ts           # Agent loop logic
│   │   ├── useProject.ts         # Project management
│   │   └── useProviders.ts       # Provider state
│   ├── providers/                # AI provider implementations
│   │   ├── openai.ts
│   │   ├── anthropic.ts
│   │   ├── gemini.ts
│   │   ├── groq.ts
│   │   ├── openrouter.ts
│   │   └── custom.ts
│   ├── utils/                    # Utilities
│   │   ├── diff.ts               # Diff parsing
│   │   ├── encryption.ts         # DPAPI encryption
│   │   └── project.ts            # Project Tauri commands
│   ├── types.ts                  # TypeScript types
│   ├── App.tsx                   # Main app component
│   └── main.tsx                  # Entry point
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── commands.rs           # Tauri command handlers
│   │   ├── crypto.rs             # Encryption (DPAPI)
│   │   ├── fs.rs                 # File system operations
│   │   ├── project.rs            # Project scaffolding
│   │   ├── terminal.rs           # PTY terminal management
│   │   └── main.rs               # Tauri app entry
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Architecture

### Frontend (React + TypeScript)
- **State Management**: Zustand store + React hooks
- **Styling**: Tailwind CSS with custom theme
- **Build**: Vite + TypeScript (strict mode)
- **IPC**: `@tauri-apps/api` for Rust communication

### Backend (Rust + Tauri 2)
- **Commands**: File ops, shell execution, project scaffolding, encryption
- **Security**: Windows DPAPI for credential storage
- **Process**: `portable-pty` for terminal emulation
- **Plugins**: dialog, fs, process, shell, opener, clipboard

### AI Provider Interface
```typescript
interface AIProvider {
  id: ProviderId;
  name: string;
  models: string[];
  defaultModel: string;
  sendMessage(messages, tools, streamCallback): Promise<AIResponse>;
}
```

## Configuration

### Adding a Provider
1. Open Settings (`Ctrl+,` or gear icon)
2. Click "Add Provider"
3. Select type (OpenAI, Anthropic, etc.)
4. Enter API key and optional base URL
5. Save and set as active

### Project Setup
1. Open Settings → Project tab
2. Click "Choose Folder" to select project directory
3. Or click "Scaffold Next.js" / "Scaffold Static" for new projects
4. Start dev server from Project tab or let agent do it

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Toggle file drawer |
| `Ctrl+,` | Open settings |
| `Ctrl+L` | Clear chat |
| `Enter` | Send message |
| `Shift+Enter` | New line in input |

## Security Model

- **API Keys**: Encrypted with Windows DPAPI, never in plaintext
- **File Access**: Scoped to `$APPDATA/blank-ide/**` and `$PROJECT/**`
- **Shell Commands**: Allow-listed (cmd, powershell, npm, npx, node)
- **No Network**: Frontend only talks to configured AI providers

## Scripts

```bash
# Frontend
npm run dev          # Vite dev server
npm run build        # TypeScript + Vite production build
npm run preview      # Preview production build
npm run lint         # ESLint

# Tauri
npm run tauri:dev    # Development with hot reload
npm run tauri:build  # Production build (.exe/.msi)
```

## Troubleshooting

### "cargo not found"
Install Rust: `irm https://win.rustup.rs | iex`

### "WebView2 not found"
Install [Microsoft Edge WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

### Dev server not connecting
- Ensure port 3000 is free
- Check project has valid `package.json` with dev script
- View terminal output in Project tab

### Provider errors
- Verify API key is correct
- Check base URL for custom providers
- Test connection in Settings → Providers

## License

Apache License 2.0 - see [LICENSE](LICENSE) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run build` and `npm run tauri:build` to verify
5. Submit a PR

## Roadmap

- [ ] Multi-file diff view
- [ ] Terminal panel integration
- [ ] Git integration (status, diff, commit)
- [ ] Plugin system for custom tools
- [ ] macOS/Linux support
- [ ] Settings sync across devices

---

Built with ❤️ using [Tauri](https://tauri.app/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/).
