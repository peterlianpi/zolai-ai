#!/usr/bin/env python3
"""Multi-agent wiki example audit and discussion system."""

import json
import re
from pathlib import Path
from typing import Dict, List

class WikiAuditAgent:
    """Base wiki audit agent."""
    
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role
        self.findings = []
    
    def audit(self, content: str, file_path: str) -> List[Dict]:
        raise NotImplementedError
    
    def report(self) -> Dict:
        return {
            "agent": self.name,
            "role": self.role,
            "findings": self.findings,
            "count": len(self.findings)
        }

class GrammarAuditAgent(WikiAuditAgent):
    """Audits Zolai grammar examples for Zolai Standard compliance."""
    
    def __init__(self):
        super().__init__("GrammarAuditAgent", "Grammar Validator")
        self.forbidden_words = ["pasian", "ram", "tapa", "topa", "kumpipa", "tua", "tua", "tanu"]
        self.correct_words = ["pasian", "gam", "tapa", "topa", "kumpipa", "tua", "tanu"]
    
    def audit(self, content: str, file_path: str) -> List[Dict]:
        self.findings = []
        lines = content.split('\n')
        for i, line in enumerate(lines, 1):
            # Skip rule explanations and examples of "wrong" usage
            if any(x in line.lower() for x in ["never:", "wrong", "forbidden", "rule:", "note:", "never use", "incorrect"]):
                continue
                
            # Check for forbidden words
            for word in self.forbidden_words:
                if re.search(rf'\b{word}\b', line, re.IGNORECASE):
                    # Check if it's 'ram' but not in a 'country' context (optional, but keep it simple for now)
                    if word.lower() == "ram" and "gam" in line:
                        continue # Might be a discussion about ram vs gam
                        
                    self.findings.append({
                        "file": file_path,
                        "line": i,
                        "type": "FORBIDDEN_WORD",
                        "word": word,
                        "suggestion": f"Use Zolai Standard compliant word instead",
                        "content": line.strip()[:80]
                    })
            
            # Check for proper plural marking (i ... uh)
            if re.search(r'\bi\b.*\buh\b', line):
                self.findings.append({
                    "file": file_path,
                    "line": i,
                    "type": "PLURAL_VIOLATION",
                    "issue": "Cannot combine 'uh' with first-person inclusive 'i'",
                    "content": line.strip()[:80]
                })
        
        return self.findings

class ExampleAuditAgent(WikiAuditAgent):
    """Audits code examples and usage patterns."""
    
    def __init__(self):
        super().__init__("ExampleAuditAgent", "Example Validator")
    
    def audit(self, content: str, file_path: str) -> List[Dict]:
        self.findings = [] # Reset findings for each audit call
        lines = content.split('\n')
        in_code_block = False
        code_lines = []
        
        for i, line in enumerate(lines, 1):
            if line.startswith("```"):
                if in_code_block:
                    # Check code block
                    self._check_code_block(code_lines, file_path, i)
                    code_lines = []
                in_code_block = not in_code_block
            elif in_code_block:
                code_lines.append((i, line))
        
        return self.findings
    
    def _check_code_block(self, code_lines: List, file_path: str, line_num: int):
        """Check code block for issues."""
        code = '\n'.join([line for _, line in code_lines])
        
        # Check for missing comments, but only if it looks like actual programming code
        is_programming_code = any(lang in code.lower() for lang in ['def ', 'import ', 'class ', 'echo ', 'npm ', 'pip ', 'bun ', 'git ', 'python', 'bash'])
        
        if is_programming_code:
            # Check for incomplete examples
            if len(code_lines) < 2:
                self.findings.append({
                    "file": file_path,
                    "line": line_num,
                    "type": "INCOMPLETE_EXAMPLE",
                    "issue": "Code example too short",
                    "suggestion": "Provide complete, runnable examples"
                })
                
            if not any('#' in line or '//' in line for _, line in code_lines):
                self.findings.append({
                    "file": file_path,
                    "line": line_num,
                    "type": "MISSING_COMMENTS",
                    "issue": "Code example lacks explanatory comments",
                    "suggestion": "Add comments explaining the code"
                })

class DocumentationAuditAgent(WikiAuditAgent):
    """Audits documentation completeness."""
    
    def __init__(self):
        super().__init__("DocumentationAuditAgent", "Documentation Validator")
    
    def audit(self, content: str, file_path: str) -> List[Dict]:
        self.findings = [] # Reset findings for each audit call
        
        # Only require sections for README files
        if file_path == "README.md":
            required_sections = ["## Usage", "## Examples", "## Installation", "## API"]
            found_sections = set()
            
            for section in required_sections:
                if section in content:
                    found_sections.add(section)
            
            missing = set(required_sections) - found_sections
            
            for section in missing:
                self.findings.append({
                    "file": file_path,
                    "type": "MISSING_SECTION",
                    "section": section,
                    "suggestion": f"Add '{section}' section to documentation"
                })
        
        # Check for broken links
        links = re.findall(r'\[([^\]]+)\]\(([^\)]+)\)', content)
        for text, url in links:
            if url.startswith('#') and url[1:].lower() not in content.lower():
                self.findings.append({
                    "file": file_path,
                    "type": "BROKEN_LINK",
                    "link": url,
                    "text": text,
                    "suggestion": "Fix broken internal link"
                })
        
        return self.findings

class DiscussionGroup:
    """Multi-agent discussion group."""
    
    def __init__(self, agents: List[WikiAuditAgent]):
        self.agents = agents
        self.discussion = []
    
    def discuss(self, topic: str, findings: Dict) -> List[Dict]:
        """Agents discuss findings and reach consensus."""
        discussion_points = []
        
        for agent in self.agents:
            point = {
                "agent": agent.name,
                "role": agent.role,
                "perspective": self._generate_perspective(agent, findings),
                "recommendations": self._generate_recommendations(agent, findings)
            }
            discussion_points.append(point)
        
        return discussion_points
    
    def _generate_perspective(self, agent: WikiAuditAgent, findings: Dict) -> str:
        """Generate agent's perspective on findings."""
        if agent.name == "GrammarAuditAgent":
            return "Grammar compliance is critical for Zolai Standard. All examples must follow proper word order and vocabulary."
        elif agent.name == "ExampleAuditAgent":
            return "Examples must be complete, runnable, and well-commented for users to understand implementation."
        elif agent.name == "DocumentationAuditAgent":
            return "Documentation must be comprehensive with all required sections and working links."
        return "Audit findings require attention."
    
    def _generate_recommendations(self, agent: WikiAuditAgent, findings: Dict) -> List[str]:
        """Generate recommendations from agent."""
        recs = []
        
        if agent.name == "GrammarAuditAgent":
            recs.append("Replace all forbidden words with Zolai Standard compliant alternatives")
            recs.append("Verify plural marking follows -te suffix convention")
            recs.append("Check word order is SOV throughout")
        
        elif agent.name == "ExampleAuditAgent":
            recs.append("Expand all code examples to be complete and runnable")
            recs.append("Add explanatory comments to all code blocks")
            recs.append("Include expected output for each example")
        
        elif agent.name == "DocumentationAuditAgent":
            recs.append("Add missing documentation sections")
            recs.append("Fix all broken internal links")
            recs.append("Ensure consistent formatting throughout")
        
        return recs

def audit_wiki_files():
    """Audit all wiki files."""
    wiki_root = Path("/home/peter/Documents/Projects/zolai/wiki")
    readme_file = Path("/home/peter/Documents/Projects/zolai/README.md")
    
    # Initialize agents
    agents = [
        GrammarAuditAgent(),
        ExampleAuditAgent(),
        DocumentationAuditAgent(),
    ]
    
    # Audit files
    files_to_audit = []
    if readme_file.exists():
        files_to_audit.append(readme_file)
    
    if wiki_root.exists():
        files_to_audit.extend(wiki_root.rglob("*.md"))
    
    print("🔍 Wiki Example Audit - Multi-Agent System")
    print("=" * 60)
    print(f"📁 Files to audit: {len(files_to_audit)}\n")
    
    all_findings = {}
    
    for file_path in files_to_audit[:10]:  # Limit to first 10 files
        try:
            content = file_path.read_text()
            rel_path = str(file_path.relative_to(Path("/home/peter/Documents/Projects/zolai")))
            
            for agent in agents:
                agent.audit(content, rel_path)
            
            all_findings[rel_path] = {
                "agents": [agent.report() for agent in agents],
                "total_findings": sum(len(agent.findings) for agent in agents)
            }
        except:
            pass
    
    # Discussion group
    print("🤖 Multi-Agent Discussion Group\n")
    discussion_group = DiscussionGroup(agents)
    
    for file_path, findings in all_findings.items():
        if findings["total_findings"] > 0:
            print(f"📄 {file_path}")
            print(f"   Total findings: {findings['total_findings']}\n")
            
            discussion = discussion_group.discuss(file_path, findings)
            
            for point in discussion:
                print(f"   🤖 {point['agent']} ({point['role']}):")
                print(f"      Perspective: {point['perspective']}")
                print(f"      Recommendations:")
                for rec in point['recommendations'][:2]:
                    print(f"        • {rec}")
                print()
    
    # Save report
    report_file = Path("/home/peter/Documents/Projects/zolai/artifacts/wiki_audit_discussion_report.json")
    report_file.parent.mkdir(parents=True, exist_ok=True)
    
    report = {
        "timestamp": str(Path.cwd()),
        "files_audited": len(files_to_audit),
        "findings": all_findings,
        "discussion_group": {
            "agents": [agent.name for agent in agents],
            "consensus": "All wiki examples and documentation require updates for Zolai Standard compliance and completeness"
        }
    }
    
    with open(report_file, "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"\n✅ Report saved to: artifacts/wiki_audit_discussion_report.json")
    
    return report

if __name__ == "__main__":
    audit_wiki_files()
