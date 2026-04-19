from __future__ import annotations

import sys
from pathlib import Path

import typer
from rich.console import Console

console = Console()
app = typer.Typer(help="Zolai CLI commands")


@app.command()
def serve(host: str = "0.0.0.0", port: int = 8000) -> None:
    """Start the Zolai API server."""
    import uvicorn

    from main import app as fastapi_app

    console.print(f"[green]Starting server on {host}:{port}[/green]")
    uvicorn.run(fastapi_app, host=host, port=port)


@app.command()
def migrate(direction: str = "up") -> None:
    """Run database migrations."""
    console.print(f"[yellow]Running migrations ({direction})...[/yellow]")
    # TODO: Implement migration logic


@app.command()
def seed() -> None:
    """Seed database with initial data."""
    console.print("[yellow]Seeding database...[/yellow]")
    # TODO: Implement seeding logic


@app.command()
def validate() -> None:
    """Validate project structure and configuration."""
    console.print("[yellow]Validating project...[/yellow]")
    # TODO: Implement validation logic


if __name__ == "__main__":
    raise SystemExit(app())
