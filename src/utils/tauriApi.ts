import { invoke } from "@tauri-apps/api/core";

export async function isTauri(): Promise<boolean> {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export interface StoredSettings {
  activeProviderId: string | null;
  providers: Array<{
    id: string;
    type: string;
    name: string;
    apiKeyEncrypted: string;
    baseUrl?: string | null;
    model: string;
  }>;
  projectPath: string | null;
  previewUrl: string;
}

export const tauriApi = {
  loadSettings: () => invoke<StoredSettings>("load_settings"),
  saveSettings: (settings: StoredSettings) =>
    invoke<void>("save_settings", { settings }),

  pickProjectFolder: () => invoke<string | null>("pick_project_folder"),
  readFile: (projectPath: string, relativePath: string) =>
    invoke<string | null>("read_project_file", { projectPath, relativePath }),
  writeFile: (projectPath: string, relativePath: string, content: string) =>
    invoke<void>("write_project_file", { projectPath, relativePath, content }),
  listFiles: (projectPath: string) =>
    invoke<Array<{ name: string; path: string; is_directory: boolean }>>(
      "list_project_files",
      { projectPath },
    ),
  runCommand: (projectPath: string, command: string) =>
    invoke<{ stdout: string; stderr: string; exit_code: number }>(
      "run_shell_command",
      { projectPath, command },
    ),
  scaffoldNextJs: (parentPath: string, folderName: string) =>
    invoke<string>("scaffold_nextjs", { parentPath, folderName }),
  scaffoldStatic: (parentPath: string, folderName: string) =>
    invoke<string>("scaffold_static", { parentPath, folderName }),
  encryptKey: (plaintext: string) =>
    invoke<string>("encrypt_secret", { plaintext }),
  decryptKey: (ciphertext: string) =>
    invoke<string>("decrypt_secret", { ciphertext }),
};
