#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path


def main() -> int:
    p = argparse.ArgumentParser(description="Merge a PEFT LoRA adapter into a base model and save as HF-style directory.")
    p.add_argument("--base", required=True, help="Base model repo id or local path (e.g. Qwen/Qwen2.5-0.5B-Instruct)")
    p.add_argument("--adapter", required=True, help="Adapter repo id or local path (e.g. peterpausianlian/zolai-qwen-0.5b)")
    p.add_argument("--output", required=True, help="Output directory to write merged model")
    p.add_argument("--dtype", default="float16", choices=["float16", "bfloat16", "float32"], help="Weights dtype")
    args = p.parse_args()

    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer
    from peft import PeftModel

    out_dir = Path(args.output)
    out_dir.mkdir(parents=True, exist_ok=True)

    dtype = {
        "float16": torch.float16,
        "bfloat16": torch.bfloat16,
        "float32": torch.float32,
    }[args.dtype]

    tok = AutoTokenizer.from_pretrained(args.base, use_fast=True)
    base = AutoModelForCausalLM.from_pretrained(
        args.base,
        torch_dtype=dtype,
        device_map="auto",
        low_cpu_mem_usage=True,
        trust_remote_code=True,
    )

    model = PeftModel.from_pretrained(base, args.adapter)
    merged = model.merge_and_unload()

    merged.save_pretrained(out_dir, safe_serialization=True)
    tok.save_pretrained(out_dir)

    print(f"Merged model written to: {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

