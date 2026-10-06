import { useCallback } from "react";
import { getActiveProvider, useAppStore } from "@/store/appStore";
import type {
  AgentAction,
  ChatMessage,
  CommandAction,
  FileEditAction,
} from "@/types";
import { getProviderAdapter } from "@/providers";
import { tauriApi } from "@/utils/tauriApi";

const SYSTEM_PROMPT = `You are Blank, an AI coding agent inside a minimal IDE.
The user describes tasks in natural language. You edit their project and run commands.

Rules:
1. Always call plan first with ONE short line describing what you will do next.
2. Propose file changes with write_file (full file content). Never assume silent writes.
3. Propose shell commands with run_command only when needed (install, dev server, build).
4. After the dev server is likely running or the task is complete, call stop with a brief message.
5. If a command failed, read the error output the user provides and propose a fix.
6. Prefer Next.js or simple static HTML for new projects when unspecified.
7. Keep responses concise. No markdown file trees.`;

export function useAgent() {
  const {
    settings,
    addMessage,
    updateMessage,
    setAgentBusy,
    setPendingActions,
    pushActionHistory,
    bumpPreview,
  } = useAppStore();

  const waitForApproval = useCallback(
    (action: AgentAction): Promise<"approved" | "rejected"> => {
      return new Promise((resolve) => {
        const check = () => {
          const state = useAppStore.getState();
          const current =
            state.pendingActions.find((a) => a.id === action.id) ??
            state.actionHistory.find((a) => a.id === action.id);
          if (!current || current.status === "pending") {
            setTimeout(check, 200);
            return;
          }
          resolve(current.status === "approved" ? "approved" : "rejected");
        };
        check();
      });
    },
    [],
  );

  const applyFileEdit = useCallback(
    async (args: { path: string; content: string }) => {
      if (!settings.projectPath) throw new Error("No project folder selected");
      const oldContent = await tauriApi.readFile(
        settings.projectPath,
        args.path,
      );
      const action: FileEditAction = {
        id: crypto.randomUUID(),
        type: "file_edit",
        path: args.path,
        oldContent,
        newContent: args.content,
        status: "pending",
      };
      setPendingActions([action]);
      const result = await waitForApproval(action);
      if (result === "rejected") {
        useAppStore.getState().updateAction(action.id, { status: "rejected" });
        pushActionHistory({ ...action, status: "rejected" });
        setPendingActions([]);
        return { ok: false as const, message: "User rejected file edit" };
      }
      await tauriApi.writeFile(
        settings.projectPath,
        args.path,
        args.content,
      );
      useAppStore.getState().updateAction(action.id, { status: "approved" });
      pushActionHistory({ ...action, status: "approved" });
      setPendingActions([]);
      return { ok: true as const };
    },
    [settings.projectPath, setPendingActions, waitForApproval, pushActionHistory],
  );

  const applyCommand = useCallback(
    async (args: { command: string }) => {
      if (!settings.projectPath) throw new Error("No project folder selected");
      const action: CommandAction = {
        id: crypto.randomUUID(),
        type: "command",
        command: args.command,
        cwd: settings.projectPath,
        output: "",
        exitCode: null,
        status: "pending",
      };
      setPendingActions([action]);
      const result = await waitForApproval(action);
      if (result === "rejected") {
        useAppStore.getState().updateAction(action.id, { status: "rejected" });
        pushActionHistory({ ...action, status: "rejected" });
        setPendingActions([]);
        return {
          ok: false as const,
          output: "User rejected command",
          exitCode: -1,
        };
      }
      const run = await tauriApi.runCommand(
        settings.projectPath,
        args.command,
      );
      const output = [run.stdout, run.stderr].filter(Boolean).join("\n");
      const updated: CommandAction = {
        ...action,
        output,
        exitCode: run.exit_code,
        status: "approved",
      };
      useAppStore.getState().updateAction(action.id, updated);
      pushActionHistory(updated);
      setPendingActions([]);
      if (
        args.command.includes("dev") ||
        args.command.includes("start") ||
        args.command.includes("serve")
      ) {
        bumpPreview();
      }
      return { ok: true as const, output, exitCode: run.exit_code };
    },
    [
      settings.projectPath,
      setPendingActions,
      waitForApproval,
      pushActionHistory,
      bumpPreview,
    ],
  );

  const runAgentLoop = useCallback(
    async (userText: string) => {
      const provider = getActiveProvider(useAppStore.getState());
      if (!provider?.apiKey) {
        addMessage({
          role: "assistant",
          content: "Add an API key in Settings and pick an active provider.",
        });
        return;
      }
      if (!settings.projectPath) {
        addMessage({
          role: "assistant",
          content:
            "Choose a project folder in Settings (or scaffold a new project) first.",
        });
        return;
      }

      addMessage({ role: "user", content: userText });
      const assistantId = addMessage({ role: "assistant", content: "" });
      setAgentBusy(true);

      try {
        const adapter = getProviderAdapter(provider.type);
        let iterations = 0;
        let toolFeedback = "";

        const apiMessages: ChatMessage[] = useAppStore
          .getState()
          .messages.filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ ...m }));

        while (iterations < 12) {
          iterations++;
          if (toolFeedback) {
            apiMessages.push({
              id: crypto.randomUUID(),
              role: "user",
              content: toolFeedback,
              timestamp: Date.now(),
            });
            toolFeedback = "";
          }

          const response = await adapter.sendMessage(
            provider,
            apiMessages,
            SYSTEM_PROMPT,
            (chunk) => {
              const prev =
                useAppStore.getState().messages.find((m) => m.id === assistantId)
                  ?.content ?? "";
              updateMessage(assistantId, { content: prev + chunk });
            },
          );

          const assistantContent =
            useAppStore.getState().messages.find((m) => m.id === assistantId)
              ?.content ??
            response.content;
          if (assistantContent) {
            const last = apiMessages[apiMessages.length - 1];
            if (last?.role === "assistant" && last.id === assistantId) {
              last.content = assistantContent;
            } else {
              apiMessages.push({
                id: assistantId,
                role: "assistant",
                content: assistantContent,
                timestamp: Date.now(),
              });
            }
          }

          if (!response.content && response.toolCalls.length === 0) {
            updateMessage(assistantId, {
              content:
                useAppStore.getState().messages.find((m) => m.id === assistantId)
                  ?.content || "Done.",
            });
            break;
          }

          let shouldStop = false;

          for (const call of response.toolCalls) {
            if (call.name === "plan") {
              const line = String(call.arguments.line ?? "");
              updateMessage(assistantId, { plan: line });
            } else if (call.name === "write_file") {
              const path = String(call.arguments.path ?? "");
              const content = String(call.arguments.content ?? "");
              const res = await applyFileEdit({ path, content });
              if (!res.ok) {
                toolFeedback = res.message;
              } else {
                toolFeedback = `Applied file change: ${path}`;
              }
            } else if (call.name === "run_command") {
              const command = String(call.arguments.command ?? "");
              const res = await applyCommand({ command });
              toolFeedback = `Command output (exit ${res.exitCode}):\n${res.output.slice(0, 8000)}`;
              if (res.exitCode !== 0) {
                updateMessage(assistantId, {
                  content:
                    (useAppStore.getState().messages.find(
                      (m) => m.id === assistantId,
                    )?.content ?? "") +
                    `\n\nCommand failed (exit ${res.exitCode}). Waiting for your next instruction or auto-fix.`,
                });
              }
            } else if (call.name === "stop") {
              const msg = String(call.arguments.message ?? "Stopped.");
              updateMessage(assistantId, {
                content:
                  (useAppStore.getState().messages.find(
                    (m) => m.id === assistantId,
                  )?.content ?? "") || msg,
              });
              shouldStop = true;
            }
          }

          if (shouldStop) break;

          if (response.toolCalls.length === 0) break;
        }
      } catch (err) {
        updateMessage(assistantId, {
          content: `Error: ${err instanceof Error ? err.message : String(err)}`,
        });
      } finally {
        setAgentBusy(false);
      }
    },
    [
      settings.projectPath,
      addMessage,
      updateMessage,
      setAgentBusy,
      applyFileEdit,
      applyCommand,
    ],
  );

  return { runAgentLoop };
}
