"""
Zo_Tdm LLM Integration — Unified Module
Consolidates: ask_model, run_llm_correction, update_md_openrouter, cloud_finetune, upload_hf, verify-zolai-gemini
"""
from __future__ import annotations

import json
import os
from pathlib import Path


def call_openrouter(prompt: str, model: str = "google/gemini-2.0-flash-001") -> str:
    """Send a prompt to OpenRouter API."""
    import requests
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    resp = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={"model": model, "messages": [{"role": "user", "content": prompt}]}
    )
    return resp.json().get("choices", [{}])[0].get("message", {}).get("content", "")


def llm_correct_jsonl(input_path: str, output_path: str, model: str = "google/gemini-2.0-flash-001") -> int:
    """Run LLM correction on each line of a JSONL file."""
    corrected = 0
    with open(input_path, "r", encoding="utf-8") as fin, \
         open(output_path, "w", encoding="utf-8") as fout:
        for line in fin:
            obj = json.loads(line)
            text = obj.get("zolai", obj.get("text", ""))
            if not text:
                fout.write(line)
                continue
            prompt = f"Correct this Tedim Zolai text for grammar and spelling. Return only the corrected text:\n{text}"
            corrected_text = call_openrouter(prompt, model)
            if corrected_text:
                obj["zolai"] = corrected_text
                obj["llm_corrected"] = True
                corrected += 1
            fout.write(json.dumps(obj, ensure_ascii=False) + "\n")
    return corrected


def upload_to_huggingface(dataset_path: str, repo_id: str) -> bool:
    """Upload a dataset to HuggingFace Hub."""
    try:
        from huggingface_hub import HfApi
        api = HfApi()
        api.upload_file(
            path_or_fileobj=dataset_path,
            path_in_repo=Path(dataset_path).name,
            repo_id=repo_id,
            repo_type="dataset"
        )
        return True
    except Exception as e:
        print(f"Upload failed: {e}")
        return False


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser(description="Zo_Tdm LLM Integration")
    sub = p.add_subparsers(dest="command")

    ask = sub.add_parser("ask", help="Ask a model a question")
    ask.add_argument("prompt")
    ask.add_argument("--model", default="google/gemini-2.0-flash-001")

    correct = sub.add_parser("correct", help="LLM-correct a JSONL file")
    correct.add_argument("-i", "--input", required=True)
    correct.add_argument("-o", "--output", required=True)

    upload = sub.add_parser("upload", help="Upload dataset to HuggingFace")
    upload.add_argument("--path", required=True)
    upload.add_argument("--repo", required=True)

    args = p.parse_args()
    if args.command == "ask":
        print(call_openrouter(args.prompt, args.model))
    elif args.command == "correct":
        n = llm_correct_jsonl(args.input, args.output)
        print(f"Corrected {n} entries.")
    elif args.command == "upload":
        upload_to_huggingface(args.path, args.repo)
