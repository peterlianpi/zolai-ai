#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use tauri::Manager;

#[derive(Serialize)]
struct SidecarResult {
  ok: bool,
  status: Option<i32>,
  stdout: String,
  stderr: String,
}

#[derive(Serialize)]
struct SqliteVecStatus {
  ok: bool,
  sqlite_path: String,
  extension_path: String,
  error: Option<String>,
}

fn run_sidecar(program: &str, args: &[&str]) -> Result<SidecarResult, String> {
  let output = Command::new(program)
    .args(args)
    .output()
    .map_err(|e| format!("failed to spawn `{program}`: {e}"))?;

  Ok(SidecarResult {
    ok: output.status.success(),
    status: output.status.code(),
    stdout: String::from_utf8_lossy(&output.stdout).to_string(),
    stderr: String::from_utf8_lossy(&output.stderr).to_string(),
  })
}

fn default_sqlite_path() -> PathBuf {
  std::env::var("SQLITE_PATH")
    .map(PathBuf::from)
    .unwrap_or_else(|_| PathBuf::from("data/db/zolai.sqlite3"))
}

fn default_sqlite_vec_path() -> PathBuf {
  std::env::var("SQLITE_VEC_PATH")
    .map(PathBuf::from)
    .unwrap_or_else(|_| PathBuf::from("desktop/src-tauri/bin/sqlite-vec"))
}

#[tauri::command]
fn run_kg_build() -> Result<SidecarResult, String> {
  // Dev-mode implementation: run the repo script directly.
  run_sidecar("bash", &["scripts/kg/build_kg.sh"])
}

#[derive(Serialize)]
struct KgBuildStart {
  ok: bool,
}

// Streams logs to the frontend using Tauri events:
// - event: "kg_build:log" payload: string
// - event: "kg_build:done" payload: { ok: bool, status: number|null }
#[tauri::command]
fn run_kg_build_stream(app: tauri::AppHandle) -> Result<KgBuildStart, String> {
  std::thread::spawn(move || {
    let mut child = match Command::new("bash")
      .args(["scripts/kg/build_kg.sh"])
      .stdout(Stdio::piped())
      .stderr(Stdio::piped())
      .spawn()
    {
      Ok(c) => c,
      Err(e) => {
        let _ = app.emit_all("kg_build:log", format!("Failed to start KG build: {e}"));
        let _ = app.emit_all(
          "kg_build:done",
          serde_json::json!({ "ok": false, "status": null }),
        );
        return;
      }
    };

    // stdout
    if let Some(out) = child.stdout.take() {
      let app2 = app.clone();
      std::thread::spawn(move || {
        use std::io::{BufRead, BufReader};
        let reader = BufReader::new(out);
        for line in reader.lines().flatten() {
          let _ = app2.emit_all("kg_build:log", line);
        }
      });
    }

    // stderr
    if let Some(err) = child.stderr.take() {
      let app2 = app.clone();
      std::thread::spawn(move || {
        use std::io::{BufRead, BufReader};
        let reader = BufReader::new(err);
        for line in reader.lines().flatten() {
          let _ = app2.emit_all("kg_build:log", line);
        }
      });
    }

    let status = child.wait().ok().and_then(|s| s.code());
    let ok = status.unwrap_or(1) == 0;
    let _ = app.emit_all("kg_build:done", serde_json::json!({ "ok": ok, "status": status }));
  });

  Ok(KgBuildStart { ok: true })
}

#[tauri::command]
fn sqlite_vec_status() -> SqliteVecStatus {
  let sqlite_path = default_sqlite_path();
  let ext_path = default_sqlite_vec_path();

  match rusqlite::Connection::open(&sqlite_path) {
    Ok(conn) => {
      // SAFETY: this is an explicit opt-in to SQLite extension loading for desktop only.
      if let Err(e) = unsafe { conn.load_extension(&ext_path, None) } {
        return SqliteVecStatus {
          ok: false,
          sqlite_path: sqlite_path.display().to_string(),
          extension_path: ext_path.display().to_string(),
          error: Some(format!("load_extension failed: {e}")),
        };
      }
      SqliteVecStatus {
        ok: true,
        sqlite_path: sqlite_path.display().to_string(),
        extension_path: ext_path.display().to_string(),
        error: None,
      }
    }
    Err(e) => SqliteVecStatus {
      ok: false,
      sqlite_path: sqlite_path.display().to_string(),
      extension_path: ext_path.display().to_string(),
      error: Some(format!("open failed: {e}")),
    },
  }
}

#[tauri::command]
fn kg_query(query: String) -> Result<SidecarResult, String> {
  run_sidecar("zolai-cli", &["kg_query", "--query", &query])
}

#[tauri::command]
fn rag_search(query: String) -> Result<SidecarResult, String> {
  run_sidecar("zolai-cli", &["rag_search", "--query", &query])
}

#[tauri::command]
fn run_crawler() -> Result<SidecarResult, String> {
  run_sidecar("zolai-cli", &["run_crawler"])
}

#[tauri::command]
fn run_validator() -> Result<SidecarResult, String> {
  run_sidecar("zolai-cli", &["run_validator"])
}

#[tauri::command]
fn pull_hf_dataset(repo_id: String) -> Result<SidecarResult, String> {
  run_sidecar("zolai-cli", &["pull_hf_dataset", "--repo", &repo_id])
}

#[tauri::command]
fn start_training_job(job_spec_json: String) -> Result<SidecarResult, String> {
  run_sidecar("zolai-cli", &["start_training_job", "--spec", &job_spec_json])
}

#[tauri::command]
fn next_server_status() -> Result<SidecarResult, String> {
  run_sidecar("next-server", &["--version"])
}

#[tauri::command]
fn ollama_status() -> Result<SidecarResult, String> {
  run_sidecar("ollama", &["--version"])
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      run_kg_build,
      run_kg_build_stream,
      sqlite_vec_status,
      kg_query,
      rag_search,
      run_crawler,
      run_validator,
      pull_hf_dataset,
      start_training_job,
      next_server_status,
      ollama_status
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

