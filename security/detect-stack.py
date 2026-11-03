#!/usr/bin/env python3
"""
security/detect-stack.py
Auto-detects the backend technology stack of the Smart Notice Board project.
Usage: python security/detect-stack.py
"""
import os, json, sys
from pathlib import Path

ROOT = Path(__file__).parent.parent

def detect():
    results = {}

    # Python/FastAPI
    req = ROOT / "backend" / "requirements.txt"
    if req.exists():
        content = req.read_text()
        results["language"] = "Python"
        if "fastapi" in content.lower():
            results["framework"] = "FastAPI"
        if "flask" in content.lower():
            results["framework"] = "Flask"
        if "django" in content.lower():
            results["framework"] = "Django"
        if "sqlalchemy" in content.lower():
            results["orm"] = "SQLAlchemy"
        if "python-jose" in content.lower():
            results["auth"] = "JWT (python-jose)"
        if "passlib" in content.lower():
            results["hashing"] = "bcrypt (passlib)"
        if "gemini" in content.lower() or "google-genai" in content.lower():
            results["ai"] = "Google Gemini AI"
        if "cloudinary" in content.lower():
            results["storage"] = "Cloudinary"

    # Node.js
    pkg = ROOT / "package.json"
    if pkg.exists():
        try:
            data = json.loads(pkg.read_text())
            deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
            results["language"] = "JavaScript/Node.js"
            if "express" in deps:
                results["framework"] = "Express"
            if "@nestjs/core" in deps:
                results["framework"] = "NestJS"
        except:
            pass

    # Database detection
    env = ROOT / "backend" / ".env"
    if env.exists():
        content = env.read_text()
        if "sqlite" in content.lower():
            results["database"] = "SQLite"
        elif "postgresql" in content.lower() or "postgres" in content.lower():
            results["database"] = "PostgreSQL"
        elif "mysql" in content.lower():
            results["database"] = "MySQL"

    # Config check
    config = ROOT / "backend" / "app" / "core" / "config.py"
    if config.exists():
        content = config.read_text()
        if 'HS256' in content:
            results["jwt_algorithm"] = "HS256"
        if 'ACCESS_TOKEN_EXPIRE_MINUTES' in content:
            for line in content.split('\n'):
                if 'ACCESS_TOKEN_EXPIRE_MINUTES' in line and '=' in line:
                    try:
                        val = int(line.split('=')[1].strip())
                        results["token_expiry_minutes"] = val
                        results["token_expiry_days"] = round(val / 60 / 24, 1)
                    except:
                        pass

    return results

if __name__ == "__main__":
    stack = detect()
    print("\n=== Backend Technology Stack Detection ===\n")
    for k, v in stack.items():
        print(f"  {k:<30} {v}")
    print()

    # Warnings
    if stack.get("auth") == "JWT (python-jose)":
        print("  [WARN] python-jose has known CVEs (CVE-2024-33664). Consider migrating to PyJWT.")
    if stack.get("hashing") == "bcrypt (passlib)":
        print("  [WARN] passlib is unmaintained (last release 2020). Consider using bcrypt directly.")
    if stack.get("token_expiry_days", 0) > 1:
        days = stack.get("token_expiry_days")
        print(f"  [WARN] JWT expiry is {days} days -- recommend reducing to 1-2 hours.")
    print()
