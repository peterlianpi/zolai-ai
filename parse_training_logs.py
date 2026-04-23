#!/usr/bin/env python3
"""Parse Kaggle training logs and suggest improvements"""

import re
import json
from pathlib import Path

def parse_logs(log_file):
    """Extract training metrics from logs"""
    with open(log_file) as f:
        logs = f.read()
    
    # Extract loss values
    losses = re.findall(r'"loss":\s*([\d.]+)', logs)
    eval_losses = re.findall(r'"eval_loss":\s*([\d.]+)', logs)
    
    print("=== TRAINING SUMMARY ===\n")
    
    if losses:
        print(f"Training Loss:")
        print(f"  Start: {losses[0]}")
        print(f"  End: {losses[-1]}")
        print(f"  Improvement: {float(losses[0]) - float(losses[-1]):.4f}")
    
    if eval_losses:
        print(f"\nValidation Loss:")
        print(f"  Start: {eval_losses[0]}")
        print(f"  End: {eval_losses[-1]}")
    
    # Check for errors
    errors = re.findall(r'(Error|Exception|Traceback).*', logs)
    if errors:
        print(f"\n⚠️ ERRORS FOUND: {len(errors)}")
        for err in errors[:3]:
            print(f"  - {err[:80]}")
    else:
        print("\n✓ No errors detected")
    
    # Suggestions
    print("\n=== IMPROVEMENTS ===")
    if float(losses[-1]) > 2.0:
        print("• Loss still high - increase training epochs")
    if "OOM" in logs or "out of memory" in logs:
        print("• Reduce batch size or max_length")
    if "cuda" not in logs.lower():
        print("• Verify GPU is being used")
    else:
        print("✓ GPU training confirmed")

if __name__ == "__main__":
    log_file = Path("/home/peter/Documents/Projects/zolai/training_test.log")
    if log_file.exists():
        parse_logs(log_file)
    else:
        print("No logs found yet. Run training first.")
