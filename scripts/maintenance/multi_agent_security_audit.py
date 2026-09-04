#!/usr/bin/env python3
"""Multi-agent security audit system for Zolai project."""

import json
import re
from pathlib import Path
from typing import Dict, List
import subprocess

class SecurityAuditAgent:
    """Base security audit agent."""
    
    def __init__(self, name: str):
        self.name = name
        self.findings = []
    
    def audit(self, file_path: Path) -> List[Dict]:
        raise NotImplementedError
    
    def report(self) -> Dict:
        return {
            "agent": self.name,
            "findings": self.findings,
            "count": len(self.findings)
        }

class APIKeyAuditAgent(SecurityAuditAgent):
    """Detects exposed API keys."""
    
    def __init__(self):
        super().__init__("APIKeyAuditAgent")
        self.patterns = [
            r"GEMINI_API_KEY\s*=\s*['\"]?[A-Za-z0-9_-]+['\"]?",
            r"OPENROUTER_API_KEY\s*=\s*['\"]?[A-Za-z0-9_-]+['\"]?",
            r"GROQ_API_KEY\s*=\s*['\"]?[A-Za-z0-9_-]+['\"]?",
            r"sk-[A-Za-z0-9_-]{20,}",
            r"AIza[0-9A-Za-z\-_]{35}",
        ]
    
    def audit(self, file_path: Path) -> List[Dict]:
        try:
            content = file_path.read_text()
            for pattern in self.patterns:
                matches = re.finditer(pattern, content)
                for match in matches:
                    self.findings.append({
                        "file": str(file_path),
                        "type": "API_KEY",
                        "pattern": pattern,
                        "line": content[:match.start()].count('\n') + 1
                    })
        except:
            pass
        return self.findings

class CookieAuditAgent(SecurityAuditAgent):
    """Detects exposed cookies."""
    
    def __init__(self):
        super().__init__("CookieAuditAgent")
        self.patterns = [
            r"__Secure-1PSID\s*[=:]\s*['\"]?[A-Za-z0-9_.-]+['\"]?",
            r"__Secure-1PSIDTS\s*[=:]\s*['\"]?[A-Za-z0-9_.-]+['\"]?",
            r"GEMINI_PSID\s*=\s*['\"]?[A-Za-z0-9_.-]+['\"]?",
        ]
    
    def audit(self, file_path: Path) -> List[Dict]:
        try:
            content = file_path.read_text()
            for pattern in self.patterns:
                matches = re.finditer(pattern, content)
                for match in matches:
                    self.findings.append({
                        "file": str(file_path),
                        "type": "COOKIE",
                        "pattern": pattern,
                        "line": content[:match.start()].count('\n') + 1
                    })
        except:
            pass
        return self.findings

class CredentialAuditAgent(SecurityAuditAgent):
    """Detects hardcoded credentials."""
    
    def __init__(self):
        super().__init__("CredentialAuditAgent")
        self.patterns = [
            r"password\s*[=:]\s*['\"][^'\"]+['\"]",
            r"secret\s*[=:]\s*['\"][^'\"]+['\"]",
            r"token\s*[=:]\s*['\"][^'\"]+['\"]",
        ]
    
    def audit(self, file_path: Path) -> List[Dict]:
        try:
            content = file_path.read_text()
            for pattern in self.patterns:
                matches = re.finditer(pattern, content, re.IGNORECASE)
                for match in matches:
                    self.findings.append({
                        "file": str(file_path),
                        "type": "CREDENTIAL",
                        "pattern": pattern,
                        "line": content[:match.start()].count('\n') + 1
                    })
        except:
            pass
        return self.findings

class GitignoreAuditAgent(SecurityAuditAgent):
    """Checks .gitignore coverage."""
    
    def __init__(self):
        super().__init__("GitignoreAuditAgent")
    
    def audit(self, project_root: Path) -> List[Dict]:
        gitignore_path = project_root / ".gitignore"
        if not gitignore_path.exists():
            self.findings.append({
                "type": "MISSING_GITIGNORE",
                "severity": "HIGH",
                "message": ".gitignore not found"
            })
            return self.findings
        
        gitignore_content = gitignore_path.read_text()
        required_patterns = [
            ".env",
            "cookies.json",
            "*.key",
            "secrets.json",
            "credentials.json"
        ]
        
        for pattern in required_patterns:
            if pattern not in gitignore_content:
                self.findings.append({
                    "type": "MISSING_PATTERN",
                    "pattern": pattern,
                    "severity": "MEDIUM",
                    "message": f"Pattern '{pattern}' not in .gitignore"
                })
        
        return self.findings

class MultiAgentAuditSystem:
    """Orchestrates multiple security audit agents."""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.agents = [
            APIKeyAuditAgent(),
            CookieAuditAgent(),
            CredentialAuditAgent(),
            GitignoreAuditAgent(),
        ]
    
    def run_audit(self) -> Dict:
        """Run all agents and collect findings."""
        results = {
            "project": str(self.project_root),
            "agents": [],
            "total_findings": 0,
            "critical": 0,
            "high": 0,
            "medium": 0,
        }
        
        # Run file-based agents
        for agent in self.agents[:-1]:
            for file_path in self.project_root.rglob("*"):
                if file_path.is_file() and not self._should_skip(file_path):
                    agent.audit(file_path)
            
            report = agent.report()
            results["agents"].append(report)
            results["total_findings"] += report["count"]
        
        # Run gitignore agent
        gitignore_agent = self.agents[-1]
        gitignore_agent.audit(self.project_root)
        report = gitignore_agent.report()
        results["agents"].append(report)
        results["total_findings"] += report["count"]
        
        return results
    
    def _should_skip(self, file_path: Path) -> bool:
        """Skip certain directories and files."""
        skip_dirs = {".git", "__pycache__", "node_modules", ".venv", "venv"}
        skip_extensions = {".pyc", ".pyo", ".so"}
        
        if any(part in skip_dirs for part in file_path.parts):
            return True
        if file_path.suffix in skip_extensions:
            return True
        
        return False

if __name__ == "__main__":
    project_root = Path("/home/peter/Documents/Projects/zolai")
    
    print("🔐 Multi-Agent Security Audit System")
    print("=" * 50)
    print(f"Project: {project_root}\n")
    
    system = MultiAgentAuditSystem(project_root)
    results = system.run_audit()
    
    # Display results
    print(f"📊 Total Findings: {results['total_findings']}\n")
    
    for agent_report in results["agents"]:
        print(f"🤖 {agent_report['agent']}: {agent_report['count']} findings")
        for finding in agent_report["findings"][:3]:  # Show first 3
            print(f"   - {finding}")
        if agent_report["count"] > 3:
            print(f"   ... and {agent_report['count'] - 3} more")
    
    # Save detailed report
    report_file = project_root / "artifacts" / "security_audit_report.json"
    report_file.parent.mkdir(parents=True, exist_ok=True)
    with open(report_file, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✅ Detailed report saved to: {report_file}")
    
    # Recommendations
    if results["total_findings"] > 0:
        print("\n⚠️  RECOMMENDATIONS:")
        print("1. Review findings in security_audit_report.json")
        print("2. Remove sensitive data from git history: git filter-branch")
        print("3. Update .gitignore with missing patterns")
        print("4. Use environment variables for secrets")
        print("5. Rotate exposed API keys immediately")
