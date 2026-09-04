import typer
import httpx
import os
from typing import Optional

app = typer.Typer()

ZOLAI_API_URL = "http://localhost:8001"
GEMINI_SERVER_URL = "http://localhost:8000"

@app.command()
def status():
    """Check the status of Zolai API and Gemini Server."""
    try:
        r = httpx.get(f"{ZOLAI_API_URL}/openapi.json")
        typer.echo(f"Zolai API: {'Online' if r.status_code == 200 else 'Offline'}")
    except:
        typer.echo("Zolai API: Offline")

@app.command()
def audit(file_path: str):
    """Audit a file for Zolai linguistic compliance."""
    if not os.path.exists(file_path):
        typer.echo(f"Error: File {file_path} not found.")
        return

    content = open(file_path, "r").read()
    typer.echo(f"Auditing {file_path}...")
    
    try:
        r = httpx.post(f"{ZOLAI_API_URL}/verify-grammar", json={"sentence": content})
        if r.status_code == 200:
            result = r.json()
            if result["is_valid"]:
                typer.echo("✅ Audit passed: Sentence complies with Zolai Standard.")
            else:
                typer.echo(f"❌ Audit failed: {result['feedback']}")
                for sug in result['suggestions']:
                    typer.echo(f"  - Suggestion: {sug}")
        else:
            typer.echo(f"Error: API returned status {r.status_code}")
    except Exception as e:
        typer.echo(f"Failed to connect to Zolai API: {e}")

@app.command()
def improve(task: str):
    """Improve the project using AI agents."""
    typer.echo(f"Reasoning about task: {task}...")
    
    try:
        # We send the request to the Gemini Server (8000) for reasoning.
        # Assuming the Gemini Server has a /api/generate endpoint that accepts a prompt.
        r = httpx.post(
            f"{GEMINI_SERVER_URL}/api/generate", 
            json={"prompt": f"Act as a Zolai AI Agent. Improve the project based on this task: {task}"}
        )
        
        if r.status_code == 200:
            result = r.json()
            typer.echo("--- Improvement Plan ---")
            typer.echo(result.get("response", "No plan returned."))
        else:
            typer.echo(f"Error communicating with Gemini Server: {r.status_code}")
    except Exception as e:
        typer.echo(f"Failed to connect to Gemini Server: {e}")

if __name__ == "__main__":
    app()
