import { buildUnifiedDiff, parseDiffLines } from "@/utils/diff";
import type { AgentAction, CommandAction, FileEditAction } from "@/types";
import { useAppStore } from "@/store/appStore";

interface Props {
  action: AgentAction;
}

export function ApprovalCard({ action }: Props) {
  const updateAction = useAppStore((s) => s.updateAction);
  const setPendingActions = useAppStore((s) => s.setPendingActions);

  const approve = () => {
    updateAction(action.id, { status: "approved" });
  };

  const undo = () => {
    updateAction(action.id, { status: "rejected" });
    setPendingActions([]);
  };

  if (action.status !== "pending") {
    return (
      <div className="rounded-lg border border-blank-border bg-blank-elevated/50 overflow-hidden text-sm">
        <div className="px-3 py-2 text-blank-muted border-b border-blank-border">
          {action.type === "file_edit" ? (
            <span>
              File {action.status}:{" "}
              <code className="text-blank-text">{action.path}</code>
            </span>
          ) : (
            <span>Command {action.status}</span>
          )}
        </div>
        {action.type === "file_edit" ? (
          <FileDiff action={action} />
        ) : (
          <CommandPreview action={action} />
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-blank-accent/40 bg-blank-elevated shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-blank-border bg-blank-surface">
        <span className="text-xs font-medium uppercase tracking-wide text-blank-accent">
          {action.type === "file_edit" ? "File change" : "Terminal command"}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={undo}
            className="px-3 py-1 text-sm rounded border border-blank-border hover:bg-blank-border/50 text-blank-text"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={approve}
            className="px-3 py-1 text-sm rounded bg-blank-accent hover:bg-blank-accent-hover text-white font-medium"
          >
            Approve
          </button>
        </div>
      </div>

      {action.type === "file_edit" ? (
        <FileDiff action={action} />
      ) : (
        <CommandPreview action={action} />
      )}
    </div>
  );
}

function FileDiff({ action }: { action: FileEditAction }) {
  const patch = buildUnifiedDiff(action.path, action.oldContent, action.newContent);
  const lines = parseDiffLines(patch);

  return (
    <div className="max-h-64 overflow-auto">
      <div className="px-3 py-1 text-xs text-blank-muted font-mono border-b border-blank-border">
        {action.path}
      </div>
      <pre className="p-2 text-xs font-mono leading-relaxed">
        {lines.map((l, i) => (
          <div
            key={i}
            className={
              l.type === "add"
                ? "bg-green-950/40 text-green-300"
                : l.type === "remove"
                  ? "bg-red-950/40 text-red-300"
                  : l.type === "header"
                    ? "text-blank-accent"
                    : "text-blank-muted"
            }
          >
            {l.line}
          </div>
        ))}
      </pre>
    </div>
  );
}

function CommandPreview({ action }: { action: CommandAction }) {
  return (
    <div className="p-3 font-mono text-sm">
      <div className="text-blank-muted text-xs mb-1">{action.cwd}</div>
      <code className="text-blank-text">{action.command}</code>
      {action.output ? (
        <pre className="mt-2 p-2 rounded bg-black/40 text-xs text-blank-muted max-h-40 overflow-auto whitespace-pre-wrap">
          {action.output}
        </pre>
      ) : null}
    </div>
  );
}
