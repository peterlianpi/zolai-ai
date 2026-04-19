from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.machine import MACHINE_CONFIG
from server.cache import cache_stats, clear_cache
from server.config import get_server_config
from server.logging import get_logger, setup_logging

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown."""
    setup_logging(os.getenv("LOG_LEVEL", "INFO"))
    logger.info(
        "Starting Zolai server",
        workers=MACHINE_CONFIG.api_workers,
        batch_size=MACHINE_CONFIG.batch_size,
        db_pool=MACHINE_CONFIG.db_pool_size,
    )
    yield
    logger.info("Shutting down Zolai server")
    clear_cache()


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(
        title="Zolai API",
        description="Zolai Language AI Second Brain",
        version="1.0.0",
        lifespan=lifespan,
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health() -> dict:
        """Health check endpoint."""
        return {
            "status": "ok",
            "workers": MACHINE_CONFIG.api_workers,
            "batch_size": MACHINE_CONFIG.batch_size,
            "cache": cache_stats(),
        }

    @app.get("/api/translate")
    async def translate(text: str, target: str = "zo") -> dict[str, str]:
        """Translate text between English and Zolai."""
        return {"text": text, "target": target, "result": ""}

    @app.get("/api/grammar")
    async def grammar(rule: str) -> dict[str, str]:
        """Get grammar rule information."""
        return {"rule": rule, "explanation": ""}

    @app.get("/api/concepts")
    async def concepts(category: str) -> dict[str, list]:
        """Get wiki concepts by category."""
        return {"category": category, "concepts": []}

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    config = get_server_config()
    uvicorn.run(
        app,
        host=config.host,
        port=config.port,
        workers=config.workers,
        timeout_keep_alive=config.timeout,
    )
