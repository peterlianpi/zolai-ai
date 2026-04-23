#!/usr/bin/env python3
"""Quick security audit - scans only critical files."""

import json
import re
from pathlib import Path

def scan_for_secrets(root: Path) -> dict:
    """Scan critical files for secrets."""
    findings = {
        "api_keys": [],
        "cookies": [],
        "credentials": [],
        "files_scanned": 0
    }
    
    # Critical file patterns
    critical_patterns = [
        "*.md",
        "*.json",
        "*.py",
        ".env*",
        "*.txt"
    ]
    
    # Patterns to search for
    secret_patterns = {
        "api_keys": [
            r"AIza[0-9A-Za-z\-_]{35}",
            r"sk-or-v1-[A-Za-z0-9_-]{40,}",
            r"GEMINI_API_KEY\s*=\s*['\"]?[A-Za-z0-9_-]+['\"]?",
        ],
        "cookies": [
            r"__Secure-1PSID\s*[=:]\s*['\"]?g\.[A-Za-z0-9_.-]+['\"]?",
            r"__Secure-1PSIDTS\s*[=:]\s*sidts-[A-Za-z0-9_-]+",
        ],
        "credentials": [
            r"password\s*[=:]\s*['\"][^'\"]{5,}['\"]",
            r"secret\s*[=:]\s*['\"][^'\"]{5,}['\"]",
        ]
    }
    
    # Scan only website and root level
    scan_dirs = [
        root / "website",
        root / "scripts",
        root / "docs",
    ]
    
    for scan_dir in scan_dirs:
        if not scan_dir.exists():
            continue
        
        for file_path in scan_dir.rglob("*"):
            if not file_path.is_file():
                continue
            
            # Skip large files
            if file_path.stat().st_size > 1_000_000:
                continue
            
            try:
                content = file_path.read_text(errors='ignore')
                findings["files_scanned"] += 1
                
                for secret_type, patterns in secret_patterns.items():
                    for pattern in patterns:
                        matches = re.finditer(pattern, content)
                        for match in matches:
                            line_num = content[:match.start()].count('\n') + 1
                            findings[secret_type].append({
                                "file": str(file_path.relative_to(root)),
                                "line": line_num,
                                "pattern": pattern[:50]
                            })
            except:
                pass
    
    return findings

if __name__ == "__main__":
    root = Path("/home/peter/Documents/Projects/zolai")
    
    print("🔐 Quick Security Audit")
    print("=" * 50)
    
    results = scan_for_secrets(root)
    
    print(f"📊 Files scanned: {results['files_scanned']}")
    print(f"🔑 API Keys found: {len(results['api_keys'])}")
    print(f"🍪 Cookies found: {len(results['cookies'])}")
    print(f"🔐 Credentials found: {len(results['credentials'])}")
    
    total = len(results['api_keys']) + len(results['cookies']) + len(results['credentials'])
    
    if total > 0:
        print(f"\n⚠️  SENSITIVE DATA FOUND: {total} instances\n")
        
        if results['api_keys']:
            print("🔑 API Keys:")
            for item in results['api_keys'][:5]:
                print(f"   {item['file']}:{item['line']}")
        
        if results['cookies']:
            print("\n🍪 Cookies:")
            for item in results['cookies'][:5]:
                print(f"   {item['file']}:{item['line']}")
        
        if results['credentials']:
            print("\n🔐 Credentials:")
            for item in results['credentials'][:5]:
                print(f"   {item['file']}:{item['line']}")
    else:
        print("\n✅ No sensitive data found!")
    
    # Save report
    report_file = root / "artifacts" / "quick_security_audit.json"
    report_file.parent.mkdir(parents=True, exist_ok=True)
    with open(report_file, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Report saved to: artifacts/quick_security_audit.json")
