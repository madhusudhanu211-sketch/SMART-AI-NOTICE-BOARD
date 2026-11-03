#!/usr/bin/env python3
"""
security/check-secrets.py
Scans backend source code for hardcoded secrets and dangerous patterns.
Does NOT print actual secret values — only reports locations.
Usage: python security/check-secrets.py
"""
import re, sys
from pathlib import Path

ROOT = Path(__file__).parent.parent

# Patterns to search for (regex, description, severity)
PATTERNS = [
    (r'SECRET_KEY\s*:\s*str\s*=\s*["\'][^"\']{10,}["\']', "Hardcoded default SECRET_KEY", "CRITICAL"),
    (r'demo_otp\s*:', "OTP value leaked in API response", "CRITICAL"),
    (r'allow_origins\s*=\s*\["\*"\]', "Wildcard CORS allow_origins", "HIGH"),
    (r'allow_credentials\s*=\s*True', "CORS allow_credentials=True", "MEDIUM"),
    (r'docs_url\s*=\s*["\'][^"\']+["\']', "Swagger UI exposed (disable in production)", "LOW"),
    (r'user_id\s*=\s*1\b', "Hardcoded user_id=1 (no auth context)", "HIGH"),
    (r'password\s*=\s*["\'][A-Za-z0-9!@#\$]{6,}["\']', "Possible hardcoded password", "HIGH"),
    (r'GoogleAuth123', "Hardcoded Google auth password", "HIGH"),
    (r'uploaded_by\s*=\s*1\b', "Hardcoded uploaded_by=1", "MEDIUM"),
    (r'faculty_id\s*=\s*(faculty_user\.id\s+if\s+faculty_user\s+else\s+1)', "Hardcoded faculty fallback=1", "MEDIUM"),
]

SCAN_DIRS = [ROOT / "backend" / "app", ROOT / "backend" / "main.py"]
SKIP_DIRS = {"__pycache__", ".pytest_cache", "venv", "env"}

def mask(value: str) -> str:
    """Never print actual secret — mask it."""
    return "********"

def scan():
    findings = []
    
    files = []
    for target in SCAN_DIRS:
        if target.is_file():
            files.append(target)
        else:
            for f in target.rglob("*.py"):
                if not any(skip in f.parts for skip in SKIP_DIRS):
                    files.append(f)
    
    for filepath in sorted(files):
        try:
            content = filepath.read_text(encoding="utf-8")
        except:
            continue
        
        for pattern, description, severity in PATTERNS:
            for match in re.finditer(pattern, content):
                line_num = content[:match.start()].count('\n') + 1
                rel_path = filepath.relative_to(ROOT)
                findings.append({
                    "severity": severity,
                    "description": description,
                    "file": str(rel_path),
                    "line": line_num,
                    "pattern": pattern
                })
    
    return findings

if __name__ == "__main__":
    findings = scan()
    
    sev_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    findings.sort(key=lambda x: sev_order.get(x["severity"], 9))
    
    icons = {"CRITICAL": "[CRITICAL]", "HIGH": "[HIGH]", "MEDIUM": "[MEDIUM]", "LOW": "[LOW]"}
    
    print("\n=== Secret & Pattern Scanner ===\n")
    print("NOTE: No actual secret values are printed.\n")
    
    if not findings:
        print("[OK] No dangerous patterns found.")
    else:
        for f in findings:
            icon = icons.get(f["severity"], "")
            print(f"{icon} [{f['severity']}] {f['description']}")
            print(f"   File: {f['file']} (line {f['line']})")
            print()
    
    critical = sum(1 for f in findings if f["severity"] == "CRITICAL")
    high = sum(1 for f in findings if f["severity"] == "HIGH")
    
    print(f"Summary: {len(findings)} patterns found ({critical} Critical, {high} High)")
    
    if critical > 0:
        print("\n[ACTION REQUIRED] CRITICAL findings require immediate remediation!")
        sys.exit(1)
    else:
        print("\n[OK] No Critical findings.")
        sys.exit(0)
