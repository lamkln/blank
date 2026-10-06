use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct StoredProvider {
    pub id: String,
    #[serde(rename = "type")]
    pub provider_type: String,
    pub name: String,
    pub api_key_encrypted: String,
    pub base_url: Option<String>,
    pub model: String,
}

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct StoredSettings {
    pub active_provider_id: Option<String>,
    pub providers: Vec<StoredProvider>,
    pub project_path: Option<String>,
    #[serde(default = "default_preview_url")]
    pub preview_url: String,
}

fn default_preview_url() -> String {
    "http://localhost:3000".into()
}

fn settings_path() -> Result<PathBuf, String> {
    let dir = dirs::data_dir()
        .ok_or_else(|| "Could not resolve app data directory".to_string())?
        .join("blank-ide");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("settings.json"))
}

pub fn load_settings() -> Result<StoredSettings, String> {
    let path = settings_path()?;
    if !path.exists() {
        return Ok(StoredSettings {
            preview_url: "http://localhost:3000".into(),
            ..Default::default()
        });
    }
    let data = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&data).map_err(|e| e.to_string())
}

pub fn save_settings(settings: StoredSettings) -> Result<(), String> {
    let path = settings_path()?;
    let data = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(path, data).map_err(|e| e.to_string())
}
