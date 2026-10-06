mod crypto;
mod fs_ops;
mod project;
mod settings;
mod terminal;

use settings::StoredSettings;

#[tauri::command]
fn load_settings() -> Result<StoredSettings, String> {
    settings::load_settings()
}

#[tauri::command]
fn save_settings(settings: StoredSettings) -> Result<(), String> {
    settings::save_settings(settings)
}

#[tauri::command]
fn encrypt_secret(plaintext: String) -> Result<String, String> {
    crypto::encrypt_secret(&plaintext)
}

#[tauri::command]
fn decrypt_secret(ciphertext: String) -> Result<String, String> {
    crypto::decrypt_secret(&ciphertext)
}

#[tauri::command]
async fn pick_project_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    let folder = app
        .dialog()
        .file()
        .set_title("Choose project folder")
        .blocking_pick_folder();
    Ok(folder.map(|p| p.to_string()))
}

#[tauri::command]
fn read_project_file(project_path: String, relative_path: String) -> Result<Option<String>, String> {
    fs_ops::read_project_file(&project_path, &relative_path)
}

#[tauri::command]
fn write_project_file(
    project_path: String,
    relative_path: String,
    content: String,
) -> Result<(), String> {
    fs_ops::write_project_file(&project_path, &relative_path, &content)
}

#[tauri::command]
fn list_project_files(project_path: String) -> Result<Vec<fs_ops::FileEntry>, String> {
    fs_ops::list_project_files(&project_path)
}

#[tauri::command]
fn run_shell_command(project_path: String, command: String) -> Result<terminal::CommandResult, String> {
    terminal::run_shell_command(&project_path, &command)
}

#[tauri::command]
fn scaffold_nextjs(parent_path: String, folder_name: String) -> Result<String, String> {
    project::scaffold_nextjs(&parent_path, &folder_name)
}

#[tauri::command]
fn scaffold_static(parent_path: String, folder_name: String) -> Result<String, String> {
    project::scaffold_static(&parent_path, &folder_name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            load_settings,
            save_settings,
            encrypt_secret,
            decrypt_secret,
            pick_project_folder,
            read_project_file,
            write_project_file,
            list_project_files,
            run_shell_command,
            scaffold_nextjs,
            scaffold_static,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
