#!/usr/bin/env python
"""Validate Zolai project structure and dependencies."""
from __future__ import annotations

import sys
from pathlib import Path


def check_structure() -> bool:
    """Verify project structure."""
    root = Path.cwd()
    required = {
        "zolai/": "Main package",
        "scripts/": "Scripts directory",
        "data/": "Data directory",
        "wiki/": "Documentation",
        "config/": "Configuration",
        "tests/": "Test suite",
        "pyproject.toml": "Project config",
        "requirements.txt": "Dependencies",
    }
    
    print("📁 Checking project structure...")
    all_ok = True
    for path, desc in required.items():
        full_path = root / path
        exists = full_path.exists()
        status = "✓" if exists else "✗"
        print(f"  {status} {path:30} ({desc})")
        all_ok = all_ok and exists
    
    return all_ok


def check_imports() -> bool:
    """Verify package imports."""
    print("\n📦 Checking package imports...")
    try:
        from zolai.utils import get_device, stream_jsonl, batch_stream_jsonl
        print("  ✓ zolai.utils (device, data_loader)")
        
        from zolai.cli.main import main as cli_main
        print("  ✓ zolai.cli")
        
        return True
    except ImportError as e:
        print(f"  ✗ Import failed: {e}")
        return False


def check_cli() -> bool:
    """Verify CLI is installed."""
    print("\n🔧 Checking CLI...")
    try:
        import subprocess
        result = subprocess.run(["zolai", "--help"], capture_output=True, timeout=5)
        if result.returncode == 0:
            print("  ✓ zolai CLI installed")
            return True
    except Exception as e:
        print(f"  ✗ CLI check failed: {e}")
    return False


def check_data() -> bool:
    """Verify data structure."""
    print("\n📊 Checking data structure...")
    root = Path.cwd()
    data_dirs = {
        "data/master/": "Training datasets",
        "data/processed/": "Processed data",
        "data/raw/": "Raw data",
        "data/history/": "Crawl logs",
    }
    
    all_ok = True
    for path, desc in data_dirs.items():
        full_path = root / path
        exists = full_path.exists()
        status = "✓" if exists else "✗"
        print(f"  {status} {path:30} ({desc})")
        all_ok = all_ok and exists
    
    return all_ok


def check_scripts() -> bool:
    """Verify scripts organization."""
    print("\n📜 Checking scripts...")
    root = Path.cwd()
    script_dirs = {
        "scripts/crawlers/": "Web scrapers",
        "scripts/data_pipeline/": "Data processing",
        "scripts/training/": "Training scripts",
        "scripts/maintenance/": "Maintenance",
        "scripts/synthesis/": "Synthesis",
        "scripts/deploy/": "Deployment",
        "scripts/dev/": "Dev/test files",
        "scripts/ui/": "UI & menu",
    }
    
    all_ok = True
    for path, desc in script_dirs.items():
        full_path = root / path
        exists = full_path.exists()
        status = "✓" if exists else "✗"
        print(f"  {status} {path:30} ({desc})")
        all_ok = all_ok and exists
    
    return all_ok


def check_system() -> bool:
    """Check system specs."""
    print("\n💻 Checking system specs...")
    import os
    import torch
    
    cpu_count = os.cpu_count() or 1
    print(f"  ✓ CPU cores: {cpu_count}")
    
    try:
        import psutil
        ram_gb = psutil.virtual_memory().total / (1024**3)
        print(f"  ✓ RAM: {ram_gb:.1f}GB")
    except ImportError:
        print("  ⚠ psutil not installed (optional)")
    
    cuda_available = torch.cuda.is_available()
    gpu_status = "✓ GPU available" if cuda_available else "⚠ CPU-only (expected)"
    print(f"  {gpu_status}")
    
    return True


def main() -> int:
    """Run all checks."""
    print("=" * 60)
    print("  ZOLAI PROJECT VALIDATION")
    print("=" * 60)
    
    checks = [
        ("Structure", check_structure),
        ("Imports", check_imports),
        ("CLI", check_cli),
        ("Data", check_data),
        ("Scripts", check_scripts),
        ("System", check_system),
    ]
    
    results = {}
    for name, check_fn in checks:
        try:
            results[name] = check_fn()
        except Exception as e:
            print(f"\n✗ {name} check failed: {e}")
            results[name] = False
    
    print("\n" + "=" * 60)
    print("  SUMMARY")
    print("=" * 60)
    
    for name, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"  {status:10} {name}")
    
    all_passed = all(results.values())
    print("=" * 60)
    
    if all_passed:
        print("\n✅ All checks passed! Project is ready.")
        return 0
    else:
        print("\n⚠️  Some checks failed. See above for details.")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
