# Security Helper Scripts — Smart Notice Board

This directory contains reusable security helper scripts for the Smart Notice Board backend.

## Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `detect-stack.py` | Auto-detect backend technology and flag risky config | `python security/detect-stack.py` |
| `endpoint-inventory.py` | Scan all FastAPI routers and list authentication status | `python security/endpoint-inventory.py` |
| `check-secrets.py` | Scan source code for hardcoded secrets and dangerous patterns | `python security/check-secrets.py` |

## Quick Start

From the project root:

```bash
# 1. Detect the tech stack
python security/detect-stack.py

# 2. Generate endpoint inventory
python security/endpoint-inventory.py

# 3. Scan for secrets and dangerous patterns
python security/check-secrets.py
```

## What check-secrets.py finds

- Hardcoded JWT secret key defaults
- OTP values leaked in API responses
- Wildcard CORS configurations
- Hardcoded user IDs (no auth context)
- Hardcoded passwords in source code

> **Note:** The secret scanner NEVER prints actual secret values — it only reports file locations.

## CI/CD Integration

The `check-secrets.py` script exits with code 1 if Critical findings are detected.  
Use in CI:

```yaml
- name: Secret scan
  run: python security/check-secrets.py
```

This integrates with the GitHub Actions workflow in `.github/workflows/security-review.yml`.

## Required Python Packages

No extra dependencies — uses only the Python standard library.  
For pip-audit, install separately:

```bash
pip install pip-audit
pip-audit -r backend/requirements.txt
```

## Findings

See `Vulnerability Test Results/` for the complete audit:

- `security-review.md` — Full findings (17 total)
- `executive-summary.md` — Score and prioritized roadmap
- `backend-inventory.md` — Technology stack inventory
- `dependency-report.md` — CVE analysis
- `findings.xlsx` — Excel report (4 sheets)
