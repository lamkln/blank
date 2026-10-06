use std::fs;
use std::path::PathBuf;
use std::process::Command;

pub fn scaffold_static(parent_path: &str, folder_name: &str) -> Result<String, String> {
    let project = PathBuf::from(parent_path).join(folder_name);
    if project.exists() {
        return Err("Folder already exists".into());
    }
    fs::create_dir_all(&project).map_err(|e| e.to_string())?;
    fs::write(
        project.join("index.html"),
        r#"<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blank static site</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main>
    <h1>Hello from Blank</h1>
    <p>Edit this site by chatting with the agent.</p>
  </main>
  <script src="app.js"></script>
</body>
</html>
"#,
    )
    .map_err(|e| e.to_string())?;
    fs::write(
        project.join("styles.css"),
        "body { font-family: system-ui, sans-serif; margin: 2rem; background: #0d0d0f; color: #e4e4e7; }\n",
    )
    .map_err(|e| e.to_string())?;
    fs::write(
        project.join("app.js"),
        "console.log('Blank static site ready');\n",
    )
    .map_err(|e| e.to_string())?;
    Ok(project.to_string_lossy().to_string())
}

pub fn scaffold_nextjs(parent_path: &str, folder_name: &str) -> Result<String, String> {
    let project = PathBuf::from(parent_path).join(folder_name);
    if project.exists() {
        return Err("Folder already exists".into());
    }

    let status = Command::new("npx")
        .args([
            "--yes",
            "create-next-app@15",
            folder_name,
            "--typescript",
            "--tailwind",
            "--eslint",
            "--app",
            "--src-dir",
            "--import-alias",
            "@/*",
            "--use-npm",
            "--no-turbopack",
        ])
        .current_dir(parent_path)
        .status()
        .map_err(|e| format!("Failed to run create-next-app: {e}"))?;

    if !status.success() {
        return Err("create-next-app failed".into());
    }

    Ok(project.to_string_lossy().to_string())
}
