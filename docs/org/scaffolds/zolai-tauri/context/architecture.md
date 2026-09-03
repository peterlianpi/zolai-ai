# Zolai Tauri — Architecture

- Tauri (Rust) shell; sidecars: `run_api`, `ollama`, `next-server`, `sqlite-vec`.
- Communicates with Zolai Core via bundled FastAPI server + localhost REST.
- GGUF model served by bundled Ollama for offline inference.
- Versioning in `src-tauri/Cargo.toml`.
