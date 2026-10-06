import * as Diff from "diff";

export function buildUnifiedDiff(
  path: string,
  oldContent: string | null,
  newContent: string,
): string {
  const oldText = oldContent ?? "";
  const patch = Diff.createPatch(path, oldText, newContent, "before", "after");
  return patch;
}

export function parseDiffLines(patch: string): Array<{ type: "add" | "remove" | "context" | "header"; line: string }> {
  const lines = patch.split("\n");
  return lines.map((line) => {
    if (line.startsWith("+++") || line.startsWith("---") || line.startsWith("@@")) {
      return { type: "header" as const, line };
    }
    if (line.startsWith("+")) {
      return { type: "add" as const, line };
    }
    if (line.startsWith("-")) {
      return { type: "remove" as const, line };
    }
    return { type: "context" as const, line };
  });
}
