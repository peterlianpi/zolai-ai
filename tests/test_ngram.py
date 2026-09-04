"""Unit tests for n-gram prediction functions (Backlog C).

All tests use small in-memory tables — no file I/O required.
"""
from __future__ import annotations

import pytest

from zolai.knowledge.ngram import (
    load_ngram_tables,
    predict_completion,
    predict_next,
    suggest_corrections,
    _levenshtein,
)

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
    "a": 500,
    "b": 300,
    "c": 100,
    "d": 50,
    "e": 25,
    "f": 10,
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


# --- load_ngram_tables ---


class TestLoadNgramTables:
    def test_missing_path_returns_empty(self):
        """load_ngram_tables on missing path returns empty dicts."""
        result = load_ngram_tables("nonexistent/path/ngrams.jsonl")
        assert result == {"unigrams": {}, "bigrams": {}}

    def test_cache_is_lru(self):
        """load_ngram_tables caches results via lru_cache."""
        result1 = load_ngram_tables("nonexistent/path/ngrams.jsonl")
        result2 = load_ngram_tables("nonexistent/path/ngrams.jsonl")
        assert result1 is result2  # same cached object


# --- predict_next ---


class TestPredictNext:
    def test_returns_top_k_bigrams(self):
        """predict_next returns bigrams sorted by count descending."""
        results = predict_next("khi", top_k=2, tables=TABLES)
        assert len(results) == 2
        assert results[0] == ("a", 50)  # highest count
        assert results[1] == ("b", 30)

    def test_fallback_to_top_unigrams(self):
        """predict_next falls back to top unigrams when no bigrams match."""
        results = predict_next("zzz", top_k=3, tables=TABLES)
        assert len(results) == 3
        # Top unigrams: a(500), b(300), le(200)
        assert results == [("a", 500), ("b", 300), ("le", 200)]

    def test_empty_tables_returns_empty(self):
        """predict_next returns [] when tables are empty."""
        results = predict_next("khi", top_k=5, tables={"unigrams": {}, "bigrams": {}})
        assert results == []

    def test_missing_word_returns_top_unigrams(self):
        """predict_next with a word not in bigrams falls back to unigrams."""
        results = predict_next("xyz", top_k=2, tables=TABLES)
        assert len(results) == 2

    def test_top_k_limits_results(self):
        """predict_next respects top_k limit."""
        results = predict_next("khi", top_k=1, tables=TABLES)
        assert len(results) == 1
        assert results[0] == ("a", 50)


# --- predict_completion ---


class TestPredictCompletion:
    def test_returns_completions(self):
        """predict_completion returns completions for a valid prefix."""
        results = predict_completion("le", top_k=3, tables=TABLES)
        assert len(results) >= 1
        # First result should start with "le"
        assert results[0][0].startswith("le")

    def test_empty_tables_returns_empty(self):
        """predict_completion returns [] when tables are empty."""
        results = predict_completion("le", top_k=5, tables={"unigrams": {}, "bigrams": {}})
        assert results == []

    def test_empty_prefix_returns_empty(self):
        """predict_completion returns [] for empty prefix."""
        results = predict_completion("", top_k=5, tables=TABLES)
        assert results == []

    def test_single_word_prefix(self):
        """predict_completion works with a single-word prefix."""
        results = predict_completion("khi", top_k=3, tables=TABLES)
        assert len(results) >= 1
        # Should chain: khi -> a (highest bigram)
        assert results[0][0].startswith("khi")

    def test_score_is_sum_of_counts(self):
        """predict_completion score is the sum of bigram counts."""
        results = predict_completion("le", top_k=1, tables=TABLES)
        assert len(results) == 1
        completion, score = results[0]
        # le -> a is the highest bigram (100); then a has no bigram and
        # falls back to top unigram (a:500) for remaining chain tokens.
        assert completion.startswith("le a")
        assert score >= 100.0

    def test_top_k_limits_results(self):
        """predict_completion respects top_k limit."""
        results = predict_completion("khi", top_k=1, tables=TABLES)
        assert len(results) <= 1


# --- suggest_corrections ---


class TestSuggestCorrections:
    def test_returns_corrections(self):
        """suggest_corrections returns similar words."""
        results = suggest_corrections("khi", top_k=3, tables=TABLES)
        assert len(results) >= 1
        # "khi" should match itself (distance 0) if it's in unigrams
        assert any(cand == "khi" and dist == 0 for cand, dist in results)

    def test_exact_match_distance_zero(self):
        """Levenshtein exact match returns distance 0."""
        results = suggest_corrections("le", top_k=3, tables=TABLES)
        assert any(cand == "le" and dist == 0 for cand, dist in results)

    def test_empty_tables_returns_empty(self):
        """suggest_corrections returns [] when tables are empty."""
        results = suggest_corrections("khi", top_k=3, tables={"unigrams": {}, "bigrams": {}})
        assert results == []

    def test_no_match_returns_list(self):
        """suggest_corrections returns empty list when no candidates found."""
        results = suggest_corrections("xyz", top_k=3, tables=TABLES)
        # "xyz" prefix "xy" doesn't match any unigram prefix
        # Falls back to all unigrams
        assert isinstance(results, list)

    def test_top_k_limits_results(self):
        """suggest_corrections respects top_k limit."""
        results = suggest_corrections("khi", top_k=2, tables=TABLES)
        assert len(results) <= 2

    def test_results_are_tuples(self):
        """suggest_corrections returns (candidate, distance) tuples."""
        results = suggest_corrections("khi", top_k=3, tables=TABLES)
        for candidate, distance in results:
            assert isinstance(candidate, str)
            assert isinstance(distance, int)


# --- _levenshtein helper ---


class TestLevenshtein:
    def test_exact_match(self):
        assert _levenshtein("khi", "khi") == 0

    def test_empty_string(self):
        assert _levenshtein("", "abc") == 3
        assert _levenshtein("abc", "") == 3

    def test_single_char_diff(self):
        assert _levenshtein("khi", "khe") == 1

    def test_completely_different(self):
        assert _levenshtein("a", "z") == 1

    def test_transposition(self):
        assert _levenshtein("ab", "ba") == 2
