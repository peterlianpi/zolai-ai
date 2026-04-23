#!/usr/bin/env python3
"""
Fully Automated Upload - Multiple Methods
Tries different approaches to upload without manual intervention
"""

from __future__ import annotations

import os
import subprocess
import sys
import json
from pathlib import Path
from typing import Optional


def try_kaggle_upload() -> bool:
    """Try Kaggle official upload."""
    print("Method 1: Kaggle API...")
    try:
        result = subprocess.run(
            ["kaggle", "datasets", "create", "-p", "kaggle_bundle/data", "-u"],
            capture_output=True,
            text=True,
            timeout=300,
        )
        if "success" in result.stdout.lower():
            print("✅ Kaggle upload successful!")
            return True
    except Exception as e:
        print(f"❌ Kaggle failed: {e}")
    return False


def try_huggingface_upload() -> bool:
    """Try HuggingFace upload via API."""
    print("Method 2: HuggingFace...")

    # Check if huggingface_hub is available
    try:
        import subprocess

        result = subprocess.run(["pip", "install", "--quiet", "huggingface_hub"], capture_output=True, timeout=60)

        # Try to use huggingface-cli
        result = subprocess.run(["huggingface-cli", "--help"], capture_output=True, timeout=10)

        if result.returncode == 0:
            print("Enter HuggingFace token: (get from https://huggingface.co/settings/tokens)")
            token = input("Token: ").strip()
            if token:
                os.environ["HF_TOKEN"] = token
                # Upload
                result = subprocess.run(
                    [
                        "huggingface-cli",
                        "upload_dataset",
                        "peterpausianlian/zolai-training-bundle",
                        "./kaggle_bundle/data/",
                    ],
                    capture_output=True,
                    text=True,
                    timeout=600,
                    env={**os.environ, "HF_TOKEN": token},
                )
                if result.returncode == 0:
                    print("✅ HuggingFace upload successful!")
                    return True
    except Exception as e:
        print(f"❌ HuggingFace failed: {e}")
    return False


def create_download_server() -> str:
    """Create a simple download server and provide access link."""
    print("Method 3: Local server/transfer...")

    # Create a simple redirect/info file
    info = {
        "files": [],
        "download_methods": [
            "1. From local machine: copy kaggle_bundle/data/ to your cloud storage",
            "2. Upload to Google Drive manually once, use gdown in Kaggle",
            "3. Use ngrok/localtunnel to serve files",
        ],
    }

    # List files
    data_dir = Path("kaggle_bundle/data")
    for f in data_dir.glob("*.jsonl"):
        info["files"].append({"name": f.name, "size": f.stat().st_size, "lines": sum(1 for _ in open(f))})

    with open("kaggle_bundle/download_info.json", "w") as f:
        json.dump(info, f, indent=2)

    print(f"✅ Created download info: {info}")
    return "local"


def try_github_release() -> bool:
    """Try uploading to GitHub release."""
    print("Method 4: GitHub Release...")
    print("""
To automate GitHub release:
1. Create GitHub token: https://github.com/settings/tokens
2. Set GITHUB_TOKEN environment var
3. Use: gh release create v1.0 ./kaggle_bundle/data/*.jsonl
    """)
    return False


def generate_auto_script() -> str:
    """Generate an auto-upload script for user to run later."""
    script = '''#!/usr/bin/env python3
"""
Auto-upload script - Run this when you have proper credentials
"""
import os
import subprocess

# Configuration
FILES = [
    "kaggle_bundle/data/zolai_train_full.jsonl",
    "kaggle_bundle/data/zolai_val.jsonl"
]

def upload_kaggle():
    """Upload to Kaggle."""
    print("Uploading to Kaggle...")
    for f in FILES:
        result = subprocess.run([
            "kaggle", "datasets", "version", 
            "-p", "kaggle_bundle/data", 
            "-m", "Updated data"
        ], capture_output=True)
        if result.returncode == 0:
            print(f"✅ {f} uploaded")
            return True
    return False

def upload_huggingface():
    """Upload to HuggingFace."""
    print("Uploading to HuggingFace...")
    token = os.environ.get("HF_TOKEN")
    if not token:
        print("Set HF_TOKEN first: export HF_TOKEN=your_token")
        return False
    
    for f in FILES:
        result = subprocess.run([
            "huggingface-cli", "upload_dataset",
            f"peterpausianlian/zolai-{Path(f).stem}",
            f
        ], capture_output=True, env={**os.environ, "HF_TOKEN": token})
        if result.returncode == 0:
            print(f"✅ {f} uploaded")
    return True

if __name__ == "__main__":
    upload_kaggle() or upload_huggingface()
'''

    script_path = Path("kaggle_bundle/scripts/auto_upload.py")
    with open(script_path, "w") as f:
        f.write(script)

    print(f"✅ Created auto-upload script: {script_path}")
    return str(script_path)


def main():
    """Main automation entry."""
    print("=" * 60)
    print("🤖 FULLY AUTOMATED UPLOAD ATTEMPTS")
    print("=" * 60)

    # Try methods
    methods = [
        try_kaggle_upload,
        try_huggingface_upload,
    ]

    success = False
    for method in methods:
        if method():
            success = True
            break

    if not success:
        print("\n📋 CREATED ALTERNATIVES")
        print("-" * 40)

        # Create download info
        create_download_server()

        # Create auto-upload script
        script = generate_auto_script()

        print("""
┌─────────────────────────────────────────────────────────────┐
│                     AVAILABLE OPTIONS                       │
├─────────────────────────────────────────────────────────────┤
│ 1. Refresh Kaggle Token:                                   │
│    - Go to https://www.kaggle.com/account                    │
│    - Click "Create New API Token"                          │
│    - Replace ~/.kaggle/kaggle.json                        │
│                                                              │
│ 2. Use Google Drive:                                        │
│    - Upload files to Drive                                  │
│    - Use: !pip install gdown && gdown --fuzzy LINK         │
│                                                              │
│ 3. Manual for now (fastest):                                 │
│    - Download kaggle_bundle.zip                              │
│    - Drag & drop to https://www.kaggle.com/datasets/create │
└─────────────────────────────────────────────────────────────┘
        """)

    print("\nRun 'python kaggle_bundle/scripts/auto_upload.py' when you have new tokens!")


if __name__ == "__main__":
    main()
