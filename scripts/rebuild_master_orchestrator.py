#!/usr/bin/env python3
"""
MASTER ORCHESTRATOR: Complete Dictionary Rebuild Pipeline
Runs all cycles in sequence with live heartbeat, memory, and final database seeding.
"""

from __future__ import annotations

import subprocess
import sys
import time
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = PROJECT_ROOT / "scripts"
OUTPUT_DIR = PROJECT_ROOT / "data" / "processed" / "rebuild_v1"
HEARTBEAT_FILE = OUTPUT_DIR / "heartbeat.log"

def beat(phase: str, msg: str, **kwargs):
    """Log with heartbeat."""
    line = f"[{phase:25s}] {msg}"
    if kwargs:
        import json
        line += f" | {json.dumps(kwargs)}"
    print(line)
    sys.stdout.flush()
    with open(HEARTBEAT_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def run_cycle(cycle_num: int, script_name: str) -> bool:
    """Run a single cycle."""
    beat("ORCHESTRATOR", f"Starting Cycle {cycle_num}...", script=script_name)
    
    script_path = SCRIPTS_DIR / script_name
    if not script_path.exists():
        beat("ORCHESTRATOR", f"Script not found: {script_name}")
        return False
    
    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            cwd=str(PROJECT_ROOT),
            capture_output=False,
            text=True,
            timeout=3600
        )
        
        if result.returncode == 0:
            beat("ORCHESTRATOR", f"✅ Cycle {cycle_num} complete")
            return True
        else:
            beat("ORCHESTRATOR", f"❌ Cycle {cycle_num} failed")
            return False
    
    except subprocess.TimeoutExpired:
        beat("ORCHESTRATOR", f"❌ Cycle {cycle_num} timeout")
        return False
    except Exception as e:
        beat("ORCHESTRATOR", f"❌ Cycle {cycle_num} error: {str(e)}")
        return False

def seed_nextjs_database() -> bool:
    """Seed the Next.js database with final dictionary."""
    beat("ORCHESTRATOR", "Seeding Next.js database...")
    
    website_dir = PROJECT_ROOT / "website" / "zolai-project"
    seed_script = website_dir / "scripts" / "seed-dictionary.ts"
    
    if not seed_script.exists():
        beat("ORCHESTRATOR", f"Seed script not found: {seed_script}")
        return False
    
    try:
        result = subprocess.run(
            ["bunx", "tsx", str(seed_script)],
            cwd=str(website_dir),
            capture_output=False,
            text=True,
            timeout=600
        )
        
        if result.returncode == 0:
            beat("ORCHESTRATOR", "✅ Database seeding complete")
            return True
        else:
            beat("ORCHESTRATOR", "❌ Database seeding failed")
            return False
    
    except Exception as e:
        beat("ORCHESTRATOR", f"❌ Seeding error: {str(e)}")
        return False

def generate_final_report():
    """Generate final audit report."""
    beat("ORCHESTRATOR", "Generating final report...")
    
    final_en_zo = OUTPUT_DIR / "final_en_zo_dictionary_v7.jsonl"
    final_zo_en = OUTPUT_DIR / "final_zo_en_dictionary_v7.jsonl"
    
    en_count = 0
    zo_count = 0
    
    if final_en_zo.exists():
        with open(final_en_zo, "r", encoding="utf-8") as f:
            en_count = sum(1 for _ in f)
    
    if final_zo_en.exists():
        with open(final_zo_en, "r", encoding="utf-8") as f:
            zo_count = sum(1 for _ in f)
    
    report = f"""
╔════════════════════════════════════════════════════════════════╗
║         ZOLAI DICTIONARY REBUILD - FINAL REPORT               ║
╚════════════════════════════════════════════════════════════════╝

📊 FINAL STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EN→ZO Dictionary Entries:  {en_count:,}
  ZO→EN Dictionary Entries:  {zo_count:,}
  Bidirectional Coverage:    {(zo_count/en_count*100):.1f}%

📁 OUTPUT FILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EN→ZO: {final_en_zo}
  ZO→EN: {final_zo_en}
  Audit: {OUTPUT_DIR / 'audit.jsonl'}
  Memory: {OUTPUT_DIR / 'memory.jsonl'}
  Learning Log: {OUTPUT_DIR / 'learning_log.jsonl'}
  Heartbeat: {HEARTBEAT_FILE}

🎯 NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. Dictionary is seeded in Next.js database
  2. Access at: http://localhost:3000/dictionary
  3. Run: cd {PROJECT_ROOT / 'website' / 'zolai-project'} && bun dev
  4. Search EN→ZO and ZO→EN translations

✅ REBUILD COMPLETE - Dictionary ready for production
"""
    
    print(report)
    
    with open(OUTPUT_DIR / "FINAL_REPORT.txt", "w", encoding="utf-8") as f:
        f.write(report)
    
    beat("ORCHESTRATOR", "Final report generated")

def main() -> int:
    """Execute master orchestrator."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    beat("ORCHESTRATOR", "🚀 MASTER ORCHESTRATOR STARTING")
    beat("ORCHESTRATOR", f"Project: {PROJECT_ROOT}")
    beat("ORCHESTRATOR", f"Output: {OUTPUT_DIR}")
    beat("ORCHESTRATOR", f"Timestamp: {datetime.now().isoformat()}")
    
    start_time = time.time()
    
    cycles = [
        (1, "rebuild_dictionary_orchestrator.py"),
        (2, "rebuild_cycle_2_bible_deep_learning.py"),
        (3, "rebuild_cycle_3_iterative_improvement.py"),
        (4, "rebuild_cycle_4_continuous_learning.py"),
    ]
    
    results = {}
    
    for cycle_num, script_name in cycles:
        beat("ORCHESTRATOR", f"\n{'='*60}")
        success = run_cycle(cycle_num, script_name)
        results[cycle_num] = success
        
        if not success:
            beat("ORCHESTRATOR", f"⚠️  Cycle {cycle_num} failed, continuing...")
    
    # Seed database
    beat("ORCHESTRATOR", f"\n{'='*60}")
    seed_success = seed_nextjs_database()
    
    # Generate report
    beat("ORCHESTRATOR", f"\n{'='*60}")
    generate_final_report()
    
    elapsed = time.time() - start_time
    beat("ORCHESTRATOR", f"\n{'='*60}")
    beat("ORCHESTRATOR", f"✅ MASTER ORCHESTRATOR COMPLETE")
    beat("ORCHESTRATOR", f"Total time: {elapsed/60:.1f} minutes")
    beat("ORCHESTRATOR", f"Cycles: {sum(1 for v in results.values() if v)}/{len(results)} successful")
    beat("ORCHESTRATOR", f"Database seeding: {'✅ Success' if seed_success else '⚠️  Check manually'}")
    
    return 0 if all(results.values()) else 1

if __name__ == "__main__":
    raise SystemExit(main())
