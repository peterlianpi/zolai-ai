"""Zolai Toolkit — FastAPI REST API Server."""

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

import httpx
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ..analyzer.corpus import CorpusAnalyzer
from ..cleaner.pipeline import CleanPipeline
from ..config import config
from ..crawler.engine import CrawlEngine
from ..dictionary.manager import DictionaryManager
from ..trainer.dataset import DatasetBuilder

logger = logging.getLogger(__name__)


def build_prompt(messages: list[ChatMessage], system_prompt: str) -> str:
    """Build prompt from chat messages."""
    prompt_parts = [f"system\n{system_prompt}\n"]

    for msg in messages:
        prompt_parts.append(f"{msg.role}\n{msg.content}")

    prompt_parts.append("assistant\n")
    return "\n\n".join(prompt_parts)


OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
DEFAULT_MODEL = os.environ.get("DEFAULT_MODEL", "qwen3-coder:480b-cloud")

ZOLAI_SYSTEM_PROMPT = """You are an AI Senior Engineer, System Architect, Knowledge Manager, and Zolai Language Expert.

Your primary goal is to build and maintain a persistent AI Second Brain for the Zolai (Tedim) language.

STRICT RULES:
1. DOMAIN LOCK: "Zolai" refers exclusively to the Zolai/Tedim language and culture. NEVER provide information about unrelated entities (e.g., wedding platforms). If context is missing or ambiguous, state that you are a Zolai Language Expert and ask for Zolai-related input.
2. TUTORING MODE: Never act as a simple translator. Use the Socratic method: guide the learner's thinking, provide hints, and encourage participation before revealing answers.
3. LINGUISTIC RIGOR:
   - Enforce OSV (Object-Subject-Verb) word order.
   - Use the Ergative marker "in" for transitive verb subjects.
   - Distinguish between Stem I and Stem II verbs.
   - Use "Suahtakna" for freedom/liberation.
4. MODERN TECH: Use loanwords for primary tech terms (e.g., AI, Internet) but only use descriptive Zolai compounds (e.g., A kibawltawm Pilna) when EXPLAINING the concept.
5. RESPONSE FORMAT:
   - Responses MUST be short (≤4 lines).
   - Use English only for explanations.
   - Avoid preamble/postamble (e.g., "Here is the answer").

Linguistic References:
- Hello: Kum
- Thank you: Lungdam mahmah
- Yes: Aw
- No: Ai
- Good: Hoih / Cidam (healthy)
- Bad: Koh / Sia"""

# --- Pydantic Models ---


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    data_root: str


class CrawlRequest(BaseModel):
    seed: str
    max_depth: int = 2
    max_pages: int = 50


class CrawlResponse(BaseModel):
    status: str
    pages_crawled: int
    seed: str


class CleanRequest(BaseModel):
    input_dir: Optional[str] = None
    output_dir: Optional[str] = None


class CleanResponse(BaseModel):
    status: str
    files_processed: int
    sentences_cleaned: int
    output_path: str


class AnalyzeRequest(BaseModel):
    corpus_path: Optional[str] = None


class AnalyzeResponse(BaseModel):
    status: str
    stats: dict


class TrainRequest(BaseModel):
    val_ratio: float = 0.02
    test_ratio: float = 0.01
    seed: int = 42


class TrainResponse(BaseModel):
    status: str
    splits: dict


class DictSearchRequest(BaseModel):
    query: str
    lang: str = "zolai"  # "zolai" or "english"


class DictSearchResponse(BaseModel):
    status: str
    results: list


# --- Chat Models ---


class ChatMessage(BaseModel):
    role: str = "user"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    model: str = DEFAULT_MODEL
    temperature: float = 0.7
    stream: bool = False
    system_prompt: str = ZOLAI_SYSTEM_PROMPT
    max_tokens: int = 2048


class ChatResponse(BaseModel):
    model: str
    message: ChatMessage
    done: bool = True
    total_duration: int = 0


class ChatStreamRequest(BaseModel):
    messages: list[ChatMessage]
    model: str = DEFAULT_MODEL
    temperature: float = 0.7
    system_prompt: str = ZOLAI_SYSTEM_PROMPT


class ModelInfo(BaseModel):
    name: str
    size: int
    modified_at: str


class ModelsResponse(BaseModel):
    models: list[ModelInfo]


# --- WebSocket Manager ---


class ConnectionManager:
    def __init__(self):
        self.connections: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.append(ws)

    def disconnect(self, ws: WebSocket):
        self.connections.remove(ws)

    async def broadcast(self, message: dict):
        for conn in self.connections:
            try:
                await conn.send_json(message)
            except Exception:
                pass


manager = ConnectionManager()

# --- App Factory ---


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        config.paths.ensure_dirs()
        logger.info("Zolai API started on %s:%d", config.api_host, config.api_port)
        yield
        logger.info("Zolai API shutting down")

    app = FastAPI(
        title="Zolai Toolkit API",
        description="REST API for Zolai language data pipeline",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- Health ---

    @app.get("/health", response_model=HealthResponse)
    async def health():
        return HealthResponse(
            status="ok",
            data_root=str(config.paths.data),
        )

    # --- Crawler ---

    @app.post("/crawl", response_model=CrawlResponse)
    async def start_crawl(req: CrawlRequest):
        try:
            engine = CrawlEngine()
            results = engine.crawl_seed(req.seed)
            await manager.broadcast({"event": "crawl_complete", "pages": len(results)})
            return CrawlResponse(status="ok", pages_crawled=len(results), seed=req.seed)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # --- Cleaner ---

    @app.post("/clean", response_model=CleanResponse)
    async def start_clean(req: CleanRequest):
        try:
            pipeline = CleanPipeline()
            result = pipeline.run_full_pipeline()
            await manager.broadcast({"event": "clean_complete", "result": result})
            return CleanResponse(
                status="ok",
                files_processed=result.get("files", 0),
                sentences_cleaned=result.get("sentences", 0),
                output_path=str(config.paths.data_cleaned),
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # --- Analyzer ---

    @app.post("/analyze", response_model=AnalyzeResponse)
    async def analyze(req: AnalyzeRequest):
        try:
            analyzer = CorpusAnalyzer()
            stats = analyzer.full_stats()
            return AnalyzeResponse(status="ok", stats=stats)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.get("/stats")
    async def quick_stats():
        """Quick corpus statistics endpoint."""
        try:
            analyzer = CorpusAnalyzer()
            return analyzer.full_stats()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # --- Trainer ---

    @app.post("/train/splits", response_model=TrainResponse)
    async def build_splits(req: TrainRequest):
        try:
            builder = DatasetBuilder()
            result = builder.build_splits(val_ratio=req.val_ratio, test_ratio=req.test_ratio, seed=req.seed)
            await manager.broadcast({"event": "splits_built", "result": result})
            return TrainResponse(status="ok", splits=result)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # --- Dictionary ---

    @app.post("/dictionary/search", response_model=DictSearchResponse)
    async def dictionary_search(req: DictSearchRequest):
        try:
            manager = DictionaryManager()
            entries = manager.search(req.query) if req.query else []
            results = []
            for entry in entries[:20]:
                results.append(
                    {
                        "source": entry.get("source", ""),
                        "zolai": entry.get("zolai", ""),
                        "english": entry.get("english", ""),
                        "pos": entry.get("pos", ""),
                        "example": entry.get("example", ""),
                    }
                )
            return DictSearchResponse(status="ok", results=results)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # --- Bible ---

    @app.get("/bible/status")
    async def bible_status():
        """Check Bible data availability."""
        bibles_dir = config.paths.data_knowledge / "bibles"
        files = list(bibles_dir.glob("**/*.xml")) if bibles_dir.exists() else []
        return {"status": "ok", "bible_files": len(files), "path": str(bibles_dir)}

    # --- WebSocket ---

    @app.websocket("/ws")
    async def websocket_endpoint(ws: WebSocket):
        await manager.connect(ws)
        try:
            while True:
                data = await ws.receive_json()
                await manager.broadcast({"echo": data})
        except WebSocketDisconnect:
            manager.disconnect(ws)

    # === Ollama Chat Endpoints ===

    @app.get("/chat/models", response_model=ModelsResponse)
    async def list_models():
        """List available Ollama models."""
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(f"{OLLAMA_URL}/api/tags")
            data = resp.json()
            models = []
            for m in data.get("models", []):
                models.append(
                    ModelInfo(
                        name=m["name"],
                        size=m.get("size", 0),
                        modified_at=m.get("modified_at", ""),
                    )
                )
            return ModelsResponse(models=models)

    @app.post("/chat/chat", response_model=ChatResponse)
    async def chat(req: ChatRequest):
        """Chat with Ollama model."""
        # Build prompt from messages
        prompt = build_prompt(req.messages, req.system_prompt)

        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": req.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": req.temperature,
                        "num_predict": req.max_tokens,
                    },
                },
            )
            data = resp.json()

        return ChatResponse(
            model=req.model,
            message=ChatMessage(role="assistant", content=data.get("response", "").strip()),
            done=data.get("done", True),
            total_duration=data.get("total_duration", 0),
        )

    @app.post("/chat/chat/stream")
    async def chat_stream(req: ChatStreamRequest):
        """Chat with Ollama model (streaming)."""
        prompt = build_prompt(req.messages, req.system_prompt)

        async def generate():
            async with httpx.AsyncClient(timeout=120) as client:
                async with client.stream(
                    "POST",
                    f"{OLLAMA_URL}/api/generate",
                    json={
                        "model": req.model,
                        "prompt": prompt,
                        "stream": True,
                        "options": {
                            "temperature": req.temperature,
                        },
                    },
                ) as resp:
                    async for line in resp.aiter_lines():
                        if line.strip():
                            yield f"data: {line}\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")

    @app.get("/chat")
    async def chat_get(q: str, model: str = DEFAULT_MODEL):
        """Simple GET chat endpoint."""
        messages = [ChatMessage(role="user", content=q)]
        return await chat(ChatRequest(messages=messages, model=model))

    # === Web UI ===

    @app.get("/")
    async def web_ui():
        """Serve web chat UI."""
        from fastapi.responses import HTMLResponse

        html_path = Path(__file__).parent / "templates" / "index.html"
        if html_path.exists():
            return HTMLResponse(html_path.read_text(encoding="utf-8"))
        return HTMLResponse("<h1>Zolai API</h1><p>Go to /docs for API docs</p>")

    return app


# App instance for uvicorn
app = create_app()
