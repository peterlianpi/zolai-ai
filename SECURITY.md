# Security Guidelines

## Overview

This project implements comprehensive security measures to protect sensitive data and maintain code integrity.

## Security Audit System

### Multi-Agent Security Audit

Run the quick security audit to scan for exposed credentials:

```bash
python scripts/quick_security_audit.py
```

**Agents:**
- **APIKeyAuditAgent** - Detects exposed API keys (GEMINI_API_KEY, OPENROUTER_API_KEY, etc.)
- **CookieAuditAgent** - Detects exposed cookies (__Secure-1PSID, __Secure-1PSIDTS)
- **CredentialAuditAgent** - Detects hardcoded credentials (password, secret, token)

### Wiki Example Audit

Run the wiki audit to validate examples and documentation:

```bash
python scripts/wiki_example_audit_agents.py
```

**Agents:**
- **GrammarAuditAgent** - Validates ZVS 2018 compliance
- **ExampleAuditAgent** - Validates code examples are complete and commented
- **DocumentationAuditAgent** - Validates documentation completeness

## Git Security

### Cleaned History

All sensitive data has been removed from git history using `git filter-branch`:
- ✅ .env files
- ✅ cookies.json
- ✅ API keys
- ✅ Credentials

### .gitignore

The `.gitignore` file prevents accidental commits of:
- `.env` and `.env.*` files
- `cookies.json`
- `*.key` and `*.pem` files
- `secrets.json` and `credentials.json`
- Large datasets (*.jsonl, *.parquet)
- Build artifacts and cache

## Environment Variables

### Setup

1. Create `.env` file in project root (gitignored):

```bash
# Gemini API Keys
GEMINI_API_KEY=your_key_here
GEMINI_API_KEY_2=your_key_here
GEMINI_API_KEY_3=your_key_here

# Other APIs
OPENROUTER_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
NVIDIA_API_KEY=your_key_here
```

2. Never commit `.env` files
3. Use environment variables in code:

```python
import os
api_key = os.getenv("GEMINI_API_KEY")
```

## Best Practices

### Code Review

- ✅ Review all PRs for hardcoded secrets
- ✅ Use code scanning tools
- ✅ Run security audit before commits

### Dependency Management

- ✅ Use pinned versions in requirements.txt
- ✅ Regularly update dependencies
- ✅ Audit for known vulnerabilities

### Data Handling

- ✅ Never log sensitive data
- ✅ Use environment variables for secrets
- ✅ Sanitize user input
- ✅ Use HTTPS for all API calls

## Incident Response

If sensitive data is exposed:

1. **Immediately rotate** all exposed API keys
2. **Run security audit** to identify scope
3. **Review git history** for other exposures
4. **Update .gitignore** to prevent recurrence
5. **Notify users** if user data was affected

## Compliance

- ✅ ZVS 2018 Standard compliance
- ✅ No forbidden words in code
- ✅ Proper grammar in examples
- ✅ Complete documentation

## Reporting Security Issues

Please report security vulnerabilities responsibly:

1. **Do not** open public GitHub issues for security vulnerabilities
2. Email: peterpausianlian2020@gmail.com
3. Include: description, steps to reproduce, potential impact

## Tools

### Security Scanning

```bash
# Quick audit
python scripts/quick_security_audit.py

# Wiki audit
python scripts/wiki_example_audit_agents.py

# Grammar validation
python scripts/test_grammar_rules.py
```

### Git Maintenance

```bash
# Check for secrets in history
git log -p --all -S "GEMINI_API_KEY" | head -5

# Clean git history (if needed)
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all
```

## References

- [OWASP Security Guidelines](https://owasp.org/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [ZVS 2018 Standard](wiki/grammar/)
