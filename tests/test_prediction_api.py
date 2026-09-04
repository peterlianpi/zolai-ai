"""Tests for prediction API endpoints (Backlog C).

Uses FastAPI TestClient against the tools app with in-memory n-gram tables.
"""
from __future__ import annotations

from unittest.mock import patch

from fastapi.testclient import TestClient

from zolai.api.tools import app

# --- Small deterministic tables for testing ---
UNIGRAMS = {
    "khi": 100,
    "kha": 80,
    "khe": 60,
    "khu": 40,
    "le": 200,
    "la": 150,
    "lu": 120,
    "lo": 90,
}
BIGRAMS = {
    ("khi", "a"): 50,
    ("khi", "b"): 30,
    ("khi", "c"): 20,
    ("kha", "a"): 40,
    ("le", "a"): 100,
    ("le", "b"): 80,
    ("la", "x"): 60,
}
TABLES = {"unigrams": UNIGRAMS, "bigrams": BIGRAMS}
_EMPTY_TABLES = {"unigrams": {}, "bigrams": {}}


def _client_with_tables(tables: dict):
    return TestClient(
        app,
        raise_server_exceptions=False,
    )


# --- Health ───────────────────────────────────────────────────────────


class TestHealth:
    def test_tables_loaded(self):
        with patch("zolai.api.prediction_api.load_ngram_tables", return_value=TABLES):
            with TestClient(app) as c:
                resp = c.get("/predictions/health")
        data = resp.json()
        assert data["tables_loaded"] is True
        assert data["status"] == "ok"
        assert data["unigram_count"] == len(UNIGRAMS)
        assert data["bigram_count"] == len(BIGRAMS)

    def test_no_tables(self):
        with patch("zolai.api.prediction_api.load_ngram_tables", return_value=_EMPTY_TABLES):
            with TestClient(app) as c:
                resp = c.get("/predictions/health")
        data = resp.json()
        assert data["tables_loaded"] is False
        assert data["status"] == "no_tables"
        assert data["unigram_count"] == 0
        assert data["bigram_count"] == 0


# --- /next ────────────────────────────────────────────────────


class TestNextWord:
    def test_get_next_word(self):
        with patch("zolai.api.prediction_api.load_ngram_tables", return_value=TABLES):
            with TestClient(app) as c:
                resp = c.get("/predictions/next", params={"word": "khi", "top_k": 2})
        data = resp.json()
        assert data["word"] == "khi"
        assert len(data["predictions"]) == 2
        assert data["predictions"][0]["next"] == "a"
        assert data["predictions"][0]["count"] == 50

    def test_post_next_word(self):
        with patch("zolai.api.prediction_api.load_ngram_tables", return_value=TABLES):
            with TestClient(app) as c:
                resp = c.post("/predictions/next", params={"word": "khi", "top_k": 2})
        data = resp.json()
        assert data["word"] == "khi"
        assert len(data["predictions"]) == 2

    def test_empty_tables(self):
        with patch("zolai.api.prediction_api.load_ngram_tables", return_value=_EMPTY_TABLES):
            with TestClient(app) as c:
                resp = c.get("/predictions/next", params={"word": "khi"})
        data = resp.json()
        assert data["word"] == "khi"
        assert data["predictions"] == []

    def test_missing_word_returns_fallback(self):
        with patch("zolai.api.prediction_api.load_ngram_tables", return_value=TABLES):
            with TestClient(app) as c:
                resp = c.get("/predictions/next", params={"word": "zzz"})
        data = resp.json()
        assert len(data["predictions"]) > 0


# --- /completions ─────────────────────────────────────────────


class TestCompletions:
    def test_get_completions(self):
        with patch("zolai.api.prediction_api.load_ngram_tables", return_value=TABLES):
            with TestClient(app) as c:
                resp = c.get("/predictions/completions", params={"prefix": "le", "top_k": 3})
        data = resp.json()
        assert data["prefix"] == "le"
        assert len(data["completions"]) >= 1
        assert data["completions"][0]["completion"].startswith("le")

    def test_post_completions(self):
        with patch("zolai.api.prediction_api.load_ngram_tables", return_value=TABLES):
            with TestClient(app) as c:
                resp = c.post("/predictions/completions", params={"prefix": "le", "top_k": 3})
        data = resp.json()
        assert data["prefix"] == "le"

    def test_empty_tables(self):
        with patch("zolai.api.prediction_api.load_ngram_tables", return_value=_EMPTY_TABLES):
            with TestClient(app) as c:
                resp = c.get("/predictions/completions", params={"prefix": "le"})
        data = resp.json()
        assert data["completions"] == []

    def test_empty_prefix(self):
        with patch("zolai.api.prediction_api.load_ngram_tables", return_value=TABLES):
            with TestClient(app) as c:
                resp = c.get("/predictions/completions", params={"prefix": ""})
        data = resp.json()
        assert data["completions"] == []


# --- /corrections ─────────────────────────────────────────────


class TestCorrections:
    def test_get_corrections(self):
        with patch("zolai.api.prediction_api.load_ngram_tables", return_value=TABLES):
            with TestClient(app) as c:
                resp = c.get("/predictions/corrections", params={"word": "khi", "top_k": 3})
        data = resp.json()
        assert data["word"] == "khi"
        assert len(data["corrections"]) >= 1
        assert any(c["candidate"] == "khi" and c["distance"] == 0 for c in data["corrections"])

    def test_post_corrections(self):
        with patch("zolai.api.prediction_api.load_ngram_tables", return_value=TABLES):
            with TestClient(app) as c:
                resp = c.post("/predictions/corrections", params={"word": "khi", "top_k": 3})
        data = resp.json()
        assert data["word"] == "khi"

    def test_empty_tables(self):
        with patch("zolai.api.prediction_api.load_ngram_tables", return_value=_EMPTY_TABLES):
            with TestClient(app) as c:
                resp = c.get("/predictions/corrections", params={"word": "khi"})
        data = resp.json()
        assert data["corrections"] == []

    def test_top_k_limits_results(self):
        with patch("zolai.api.prediction_api.load_ngram_tables", return_value=TABLES):
            with TestClient(app) as c:
                resp = c.get("/predictions/corrections", params={"word": "khi", "top_k": 1})
        data = resp.json()
        assert len(data["corrections"]) == 1
