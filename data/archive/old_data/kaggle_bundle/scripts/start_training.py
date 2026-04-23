#!/usr/bin/env python3
"""
Quick Start: Kaggle GPU Training
Run this on your local machine to get directions
"""

import subprocess
import sys
import webbrowser


def open_kaggle():
    """Open relevant Kaggle pages."""
    pages = {
        "1": "https://www.kaggle.com/datasets/create",  # Create dataset
        "2": "https://www.kaggle.com/new?notebook=true",  # Create notebook
        "3": "https://www.kaggle.com/account",  # Account settings
        "4": "https://www.kaggle.com",  # Kaggle home
    }
    print("\n" + "=" * 50)
    print("KAGGLE QUICK LINKS")
    print("=" * 50)
    for num, url in pages.items():
        print(f"{num}. {url}")
    print("=" * 50)

    choice = input("\nOpen which page? (1-4) or 'q' to quit: ").strip()
    if choice in pages:
        webbrowser.open(pages[choice])


def check_system():
    """Check local system capabilities."""
    print("\n" + "=" * 50)
    print("SYSTEM CHECK")
    print("=" * 50)

    # Check Python
    print(f"Python: {sys.version.split()[0]}")

    # Check RAM
    try:
        import subprocess

        result = subprocess.run(["free", "-h"], capture_output=True, text=True)
        print(f"\nRAM:\n{result.stdout}")
    except:
        pass

    # Check GPU (if available)
    try:
        result = subprocess.run(["nvidia-smi"], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ NVIDIA GPU detected!")
        else:
            print("⚠️ No NVIDIA GPU (will use Kaggle/Colab)")
    except:
        print("⚠️ No NVIDIA GPU (will use cloud)")


def show_instructions():
    """Show step-by-step instructions."""
    print("""
╔══════════════════════════════════════════════════════════════╗
║           KAGGLE GPU TRAINING - STEP BY STEP               ║
╚══════════════════════════════════════════════════════════════╝

STEP 1: Upload Data to Kaggle
────────────────────────────
Option A - Manual (Recommended):
1. Go to: https://www.kaggle.com/datasets/create
2. Drag & drop these files:
   - kaggle_bundle/data/zolai_train_full.jsonl (444MB)
   - kaggle_bundle/data/zolai_val.jsonl (665KB)
3. Name: zolai-training-bundle
4. Make Public

Option B - From your machine:
   kaggle datasets create -p kaggle_bundle/data/ -u

────────────────────────────────────────────────────────────

STEP 2: Create Training Notebook
────────────────────────────────────────────
1. Go to: https://www.kaggle.com/new?notebook=true
2. Click "Create" 
3. In first cell, paste this:
   
   !pip install -q torch transformers peft bitsandbytes accelerate datasets
   
4. Add more cells from: kaggle_bundle/scripts/kaggle_notebook.py

────────────────────────────────────────────────────────────

STEP 3: Start Training
────────────────────��───────────────────────
1. Settings (gear icon) → Accelerator → GPU (T4 x2)
2. Click "Run All"
3. Wait for training to complete (~30-60 min)
4. Download model from Files sidebar

────────────────────────────────────────────────────────────

FILES TO DOWNLOAD AFTER TRAINING:
────────────────────────────────────────────
- zolai-model/adapter_config.json
- zolai-model/adapter_model.safetensors  
- zolai-model/tokenizer.json
- zolai-model/tokenizer_config.json

""")


def run_kaggle_automation():
    """Run the interactive Kaggle setup."""
    while True:
        print("""
╔══════════════════════════════════════════════════════════════╗
║              🎯 ZOLAI KAGGLE GPU AUTOMATION                   ║
╠══════════════════════════════════════════════════════════════╣
║  1. 📤 Upload to Kaggle (manual)                             ║
║  2. 📓 Create notebook                                        ║
║  3. ▶️  Show training instructions                            ║
║  4. 💻 Check system                                          ║
║  5. 🔗 Quick links                                            ║
║  6. ❌ Exit                                                   ║
╚══════════════════════════════════════════════════════════════╝
""")

        choice = input("Choose option (1-6): ").strip()

        if choice == "1":
            print("\n📤 UPLOAD DATA")
            print("-" * 40)
            print("""
Manual upload required (API token limited).
            
1. Download: /home/peter/Documents/Projects/zolai/kaggle_bundle.zip
2. Extract files: zolai_train_full.jsonl, zolai_val.jsonl  
3. Go to: https://www.kaggle.com/datasets/create
4. Upload both JSONL files
            """)
        elif choice == "2":
            print("\n📓 CREATE NOTEBOOK")
            print("-" * 40)
            print("""
1. Go to: https://www.kaggle.com/new?notebook=true
2. Click "Create"
3. Copy code from: kaggle_bundle/scripts/kaggle_notebook.py
4. Save and Run
            """)
        elif choice == "3":
            show_instructions()
        elif choice == "4":
            check_system()
        elif choice == "5":
            open_kaggle()
        elif choice == "6":
            print("\n👋 Goodbye!")
            break
        else:
            print("Invalid choice!")


if __name__ == "__main__":
    run_kaggle_automation()
