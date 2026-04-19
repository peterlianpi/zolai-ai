#!/usr/bin/env python3
"""Continue phrase extraction from remaining resources."""
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent))
from deep_learn_phrases import *

def main():
    print("=" * 70)
    print("CONTINUING PHRASE EXTRACTION — Remaining Resources")
    print("=" * 70)
    
    print("\n[1/3] Fetching models...")
    gemini_models = get_gemini_direct_models()
    or_models = get_openrouter_gemini_models()
    groq_models = get_groq_models()
    
    # Use best model from previous run
    best_gemini = gemini_models[0] if gemini_models else ""
    best_or = "google/gemini-2.5-flash-lite-preview-09-2025"
    best_groq = "qwen/qwen3-32b"
    
    print(f"  Using: {best_or} (OpenRouter)")
    print(f"  Backup: {best_groq} (Groq)")
    
    tasks = [
        # Professional lexicon (small, complete)
        (RESOURCES / "zo_tdm_professional_lexicon_v1.md", 0, 20, "lexicon_phrases.md"),
        
        # Gentehna remaining
        (RESOURCES / "Gentehna_Tuamtuam_le_A_Deihnate.md", 500, 800, "gentehna_phrases_part2.md"),
        (RESOURCES / "Gentehna_Tuamtuam_le_A_Deihnate.md", 800, 1100, "gentehna_phrases_part3.md"),
        (RESOURCES / "Gentehna_Tuamtuam_le_A_Deihnate.md", 1100, 1235, "gentehna_phrases_part4.md"),
        
        # Standard Format remaining (grammar-heavy)
        (RESOURCES / "Zolai_Standard_Format.md", 200, 600, "standard_format_phrases_part2.md"),
        (RESOURCES / "Zolai_Standard_Format.md", 600, 1000, "standard_format_phrases_part3.md"),
        (RESOURCES / "Zolai_Standard_Format.md", 1000, 1400, "standard_format_phrases_part4.md"),
        (RESOURCES / "Zolai_Standard_Format.md", 1400, 1800, "standard_format_phrases_part5.md"),
        (RESOURCES / "Zolai_Standard_Format.md", 1800, 2053, "standard_format_phrases_part6.md"),
        
        # Khanggui (historical text, rich in phrases)
        (RESOURCES / "Zolai_Khanggui_AD_1899_AD_2013.md", 0, 500, "khanggui_phrases_part2.md"),
        (RESOURCES / "Zolai_Khanggui_AD_1899_AD_2013.md", 500, 1000, "khanggui_phrases_part3.md"),
        (RESOURCES / "Zolai_Khanggui_AD_1899_AD_2013.md", 1000, 1500, "khanggui_phrases_part4.md"),
        (RESOURCES / "Zolai_Khanggui_AD_1899_AD_2013.md", 1500, 2000, "khanggui_phrases_part5.md"),
        (RESOURCES / "Zolai_Khanggui_AD_1899_AD_2013.md", 2000, 2500, "khanggui_phrases_part6.md"),
        (RESOURCES / "Zolai_Khanggui_AD_1899_AD_2013.md", 2500, 3000, "khanggui_phrases_part7.md"),
    ]
    
    print(f"\n[2/3] Processing {len(tasks)} tasks...")
    print("=" * 70)
    
    total_stats = {"phrases": 0, "compounds": 0, "patterns": 0, "proverbs": 0}
    
    for i, (path, start, end, out) in enumerate(tasks, 1):
        task_name = f"{path.name}:{start}-{end}"
        print(f"\n[{i}/{len(tasks)}] {task_name}")
        
        if not path.exists():
            print(f"    ✗ Not found")
            continue
        
        text = chunk(path, start, end)
        if len(text.strip()) < 50:
            print("    ⊘ Empty")
            continue
        
        try:
            data, model_used, duration = call_api(text, best_gemini, best_or, best_groq)
            provider = model_used.split(":")[0] if ":" in model_used else "unknown"
            model = model_used.split(":", 1)[1] if ":" in model_used else model_used
            
            ph, co, pa, pr = save(out, data, task_name)
            total = ph + co + pa + pr
            
            total_stats["phrases"] += ph
            total_stats["compounds"] += co
            total_stats["patterns"] += pa
            total_stats["proverbs"] += pr
            
            print(f"    ✓ {provider} | {total} items | {duration:.1f}s")
            
            log_extraction(ExtractionLog(
                timestamp=datetime.now().isoformat(),
                task=task_name,
                provider=provider,
                model=model,
                duration_sec=round(duration, 2),
                phrases=ph, compounds=co, patterns=pa, proverbs=pr,
                total_items=total,
                success=True
            ))
            
        except Exception as e:
            print(f"    ✗ FAILED: {e}")
            log_extraction(ExtractionLog(
                timestamp=datetime.now().isoformat(),
                task=task_name,
                provider="failed",
                model="failed",
                duration_sec=0,
                phrases=0, compounds=0, patterns=0, proverbs=0, total_items=0,
                success=False,
                error=str(e)
            ))
        
        time.sleep(2)
    
    print("\n" + "=" * 70)
    print(f"[3/3] COMPLETE")
    print(f"  Phrases:   {total_stats['phrases']}")
    print(f"  Compounds: {total_stats['compounds']}")
    print(f"  Patterns:  {total_stats['patterns']}")
    print(f"  Proverbs:  {total_stats['proverbs']}")
    print("=" * 70)

if __name__ == "__main__":
    raise SystemExit(main())
