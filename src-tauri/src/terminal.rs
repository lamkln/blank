use serde::Serialize;
use std::process::{Command, Stdio};

const ALLOWED: &[&str] = &[
    "npm", "npx", "node", "pnpm", "yarn", "cmd", "powershell", "pwsh",
];

fn is_allowed_command(command: &str) -> bool {
    let trimmed = command.trim();
    let first = trimmed.split_whitespace().next().unwrap_or("");
    let base = first
        .rsplit(['/', '\\'])
        .next()
        .unwrap_or(first)
        .to_lowercase();
    ALLOWED.contains(&base.as_str())
}

#[derive(Serialize)]
pub struct CommandResult {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
}

pub fn run_shell_command(project_path: &str, command: &str) -> Result<CommandResult, String> {
    if !is_allowed_command(command) {
        return Err(format!(
            "Command not allowed. Allowed prefixes: {}",
            ALLOWED.join(", ")
        ));
    }

    #[cfg(windows)]
    let mut cmd = {
        let mut c = Command::new("cmd");
        c.args(["/C", command]);
        c
    };

    #[cfg(not(windows))]
    let mut cmd = {
        let mut c = Command::new("sh");
        c.args(["-c", command]);
        c
    };

    cmd.current_dir(project_path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let output = cmd.output().map_err(|e| e.to_string())?;

    Ok(CommandResult {
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code().unwrap_or(-1),
    })
}
