"""Pipeline control endpoints — triggered by n8n workflows."""
from __future__ import annotations

import asyncio
import json
import random
import subprocess
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["pipeline"])

# In-memory job store (survives process lifetime, fine for local dev)
_jobs: dict[str, dict] = {}

ROOT = Path(__file__).parent.parent.parent  # zolai project root
SCRIPTS = ROOT / "scripts"
DATA = ROOT / "data"


# ── Models ─────────────────────────────────────────────────────────────────

class JobResponse(BaseModel):
    job_id: str
    status: str
    stage: str


class JobStatus(BaseModel):
    job_id: str
    stage: str
    status: str  # pending | running | done | error
    records_added: int = 0
    error: Optional[str] = None


class SubscribeRequest(BaseModel):
    chat_id: str
    username: Optional[str] = None
    level: str = "a1"


# ── Helpers ────────────────────────────────────────────────────────────────

def _run_script(job_id: str, stage: str, cmd: list[str]) -> None:
    """Run a script in background, update job store."""
    _jobs[job_id] = {"stage": stage, "status": "running", "records_added": 0, "error": None}
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=3600)
        if result.returncode != 0:
            _jobs[job_id]["status"] = "error"
            _jobs[job_id]["error"] = result.stderr[:500]
        else:
            _jobs[job_id]["status"] = "done"
    except Exception as e:
        _jobs[job_id]["status"] = "error"
        _jobs[job_id]["error"] = str(e)


# ── Pipeline endpoints ──────────────────────────────────────────────────────

@router.post("/pipeline/crawl", response_model=JobResponse)
async def pipeline_crawl():
    job_id = str(uuid.uuid4())[:8]
    script = SCRIPTS / "crawlers" / "crawl_all_news.py"
    asyncio.get_event_loop().run_in_executor(
        None, _run_script, job_id, "crawl", ["python", str(script)]
    )
    _jobs[job_id] = {"stage": "crawl", "status": "pending", "records_added": 0, "error": None}
    return JobResponse(job_id=job_id, status="pending", stage="crawl")


@router.post("/pipeline/clean", response_model=JobResponse)
async def pipeline_clean():
    job_id = str(uuid.uuid4())[:8]
    script = SCRIPTS / "pipelines" / "clean.py"
    asyncio.get_event_loop().run_in_executor(
        None, _run_script, job_id, "clean", ["python", str(script)]
    )
    _jobs[job_id] = {"stage": "clean", "status": "pending", "records_added": 0, "error": None}
    return JobResponse(job_id=job_id, status="pending", stage="clean")


@router.post("/pipeline/dedup", response_model=JobResponse)
async def pipeline_dedup():
    job_id = str(uuid.uuid4())[:8]
    script = SCRIPTS / "pipelines" / "deduplicate.py"
    asyncio.get_event_loop().run_in_executor(
        None, _run_script, job_id, "dedup", ["python", str(script)]
    )
    _jobs[job_id] = {"stage": "dedup", "status": "pending", "records_added": 0, "error": None}
    return JobResponse(job_id=job_id, status="pending", stage="dedup")


@router.post("/pipeline/publish-hf", response_model=JobResponse)
async def pipeline_publish_hf():
    job_id = str(uuid.uuid4())[:8]
    script = SCRIPTS / "data" / "pull.py"
    asyncio.get_event_loop().run_in_executor(
        None, _run_script, job_id, "publish-hf", ["python", str(script), "--push"]
    )
    _jobs[job_id] = {"stage": "publish-hf", "status": "pending", "records_added": 0, "error": None}
    return JobResponse(job_id=job_id, status="pending", stage="publish-hf")


@router.get("/pipeline/status/{job_id}", response_model=JobStatus)
async def pipeline_status(job_id: str):
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    return JobStatus(job_id=job_id, **job)


@router.post("/pipeline/trigger")
async def pipeline_trigger():
    """Trigger full pipeline — called by admin dashboard 'Run Now' button."""
    return await pipeline_crawl()


# ── Vocab daily endpoint ────────────────────────────────────────────────────

@router.get("/vocab/daily")
async def vocab_daily(level: str = "a1"):
    """Return a random vocab word for the daily lesson."""
    dict_path = DATA / "dictionary" / "processed" / "dict_master_v2.json"
    if not dict_path.exists():
        raise HTTPException(status_code=503, detail="Dictionary not available")

    with open(dict_path, encoding="utf-8") as f:
        entries = json.load(f)

    # Filter by level if tagged, else use all
    pool = [e for e in entries if e.get("level", "a1").lower() == level.lower()]
    if not pool:
        pool = entries

    entry = random.choice(pool)
    return {
        "word": entry.get("zolai", ""),
        "english": entry.get("english", ""),
        "pos": entry.get("pos", ""),
        "example_zo": entry.get("example", ""),
        "example_en": entry.get("example_en", ""),
        "grammar_tip": entry.get("notes", ""),
        "level": level,
    }


# ── Telegram subscriber endpoints ───────────────────────────────────────────

# Simple file-based store — no DB dependency for now
_SUBS_FILE = ROOT / "data" / "telegram_subscribers.json"


def _load_subs() -> list[dict]:
    if _SUBS_FILE.exists():
        return json.loads(_SUBS_FILE.read_text())
    return []


def _save_subs(subs: list[dict]) -> None:
    _SUBS_FILE.parent.mkdir(parents=True, exist_ok=True)
    _SUBS_FILE.write_text(json.dumps(subs, indent=2))


@router.post("/telegram/subscribe")
async def telegram_subscribe(req: SubscribeRequest):
    subs = _load_subs()
    existing = next((s for s in subs if s["chat_id"] == req.chat_id), None)
    if existing:
        existing["active"] = True
        existing["level"] = req.level
    else:
        subs.append({
            "chat_id": req.chat_id,
            "username": req.username,
            "level": req.level,
            "active": True,
        })
    _save_subs(subs)
    return {"status": "subscribed", "chat_id": req.chat_id, "level": req.level}


@router.post("/telegram/unsubscribe")
async def telegram_unsubscribe(chat_id: str):
    subs = _load_subs()
    for s in subs:
        if s["chat_id"] == chat_id:
            s["active"] = False
    _save_subs(subs)
    return {"status": "unsubscribed", "chat_id": chat_id}


@router.get("/telegram/subscribers")
async def telegram_subscribers():
    subs = [s for s in _load_subs() if s.get("active")]
    return {"count": len(subs), "subscribers": subs}


# ── Dictionary add / corpus add (for contribution merge) ───────────────────

class DictAddRequest(BaseModel):
    zolai: str
    english: str
    pos: str = "n"
    example: str = ""
    notes: str = ""
    source: str = "community"


class CorpusAddRequest(BaseModel):
    zolai: str
    english: str
    source: str = "community"


@router.post("/dictionary/add")
async def dictionary_add(req: DictAddRequest):
    dict_path = DATA / "dictionary" / "processed" / "dict_master_v2.json"
    if not dict_path.exists():
        raise HTTPException(status_code=503, detail="Dictionary not available")
    entries = json.loads(dict_path.read_text())
    entries.append(req.model_dump())
    dict_path.write_text(json.dumps(entries, ensure_ascii=False, indent=2))
    return {"status": "added", "word": req.zolai}


@router.post("/corpus/add")
async def corpus_add(req: CorpusAddRequest):
    corpus_path = DATA / "parallel" / "community_contributions.jsonl"
    corpus_path.parent.mkdir(parents=True, exist_ok=True)
    with open(corpus_path, "a", encoding="utf-8") as f:
        f.write(json.dumps({"zo": req.zolai, "en": req.english, "source": req.source}, ensure_ascii=False) + "\n")
    return {"status": "added"}


# ── Translate endpoint ──────────────────────────────────────────────────────

class TranslateRequest(BaseModel):
    text: str
    direction: str = "zo-en"  # zo-en or en-zo


@router.post("/translate")
async def translate(req: TranslateRequest):
    """Translate via gemini-server /api/generate."""
    import httpx
    import os

    direction_label = "Zolai (Tedim) to English" if req.direction == "zo-en" else "English to Zolai (Tedim)"
    system_prompt = (
        f"You are a Zolai (Tedim Chin) language translator. "
        f"Translate the following text from {direction_label}. "
        f"Output only the translation, nothing else."
    )

    gemini_url = os.environ.get("GEMINI_SERVER_URL", "").rstrip("/")
    api_key = os.environ.get("GEMINI_SERVER_API_KEY", "")

    if not gemini_url or not api_key:
        raise HTTPException(status_code=503, detail="GEMINI_SERVER_URL / GEMINI_SERVER_API_KEY not configured")

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{gemini_url}/api/generate",
                headers={"Authorization": f"Bearer {api_key}"},
                json={"prompt": req.text, "system_prompt": system_prompt, "temporary": True},
            )
            resp.raise_for_status()
            data = resp.json()
        return {"translation": (data.get("text") or "").strip(), "direction": req.direction}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Translation service unavailable: {e}")
