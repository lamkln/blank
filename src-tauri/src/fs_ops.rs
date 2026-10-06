use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

#[derive(Serialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
}

fn resolve_project_path(project_path: &str, relative: &str) -> Result<PathBuf, String> {
    let root = PathBuf::from(project_path)
        .canonicalize()
        .map_err(|e| format!("Invalid project path: {e}"))?;
    let rel = Path::new(relative);
    if rel.is_absolute() || relative.contains("..") {
        return Err("Path must be relative to project root".into());
    }
    let full = root.join(rel);
    if !full.starts_with(&root) {
        return Err("Path escapes project root".into());
    }
    Ok(full)
}

pub fn read_project_file(project_path: &str, relative_path: &str) -> Result<Option<String>, String> {
    let full = resolve_project_path(project_path, relative_path)?;
    if !full.exists() {
        return Ok(None);
    }
    if full.is_dir() {
        return Err("Path is a directory".into());
    }
    fs::read_to_string(&full).map(Some).map_err(|e| e.to_string())
}

pub fn write_project_file(
    project_path: &str,
    relative_path: &str,
    content: &str,
) -> Result<(), String> {
    let full = resolve_project_path(project_path, relative_path)?;
    if let Some(parent) = full.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&full, content).map_err(|e| e.to_string())
}

pub fn list_project_files(project_path: &str) -> Result<Vec<FileEntry>, String> {
    let root = PathBuf::from(project_path)
        .canonicalize()
        .map_err(|e| format!("Invalid project path: {e}"))?;

    let skip = ["node_modules", ".git", "dist", ".next", "target"];

    let mut entries = Vec::new();
    for entry in WalkDir::new(&root)
        .into_iter()
        .filter_entry(|e| {
            let name = e.file_name().to_string_lossy();
            !skip.iter().any(|s| name == *s)
        })
        .filter_map(|e| e.ok())
    {
        let path = entry.path();
        if path == root {
            continue;
        }
        let rel = path
            .strip_prefix(&root)
            .unwrap_or(path)
            .to_string_lossy()
            .replace('\\', "/");
        entries.push(FileEntry {
            name: path
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_default(),
            path: rel,
            is_directory: path.is_dir(),
        });
    }
    entries.sort_by(|a, b| a.path.cmp(&b.path));
    Ok(entries)
}
