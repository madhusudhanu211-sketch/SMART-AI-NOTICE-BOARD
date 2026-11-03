#!/usr/bin/env python3
"""
security/endpoint-inventory.py
Scans all FastAPI routers and generates a complete endpoint inventory.
Usage: python security/endpoint-inventory.py
"""
import os, re, sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
API_DIR = ROOT / "backend" / "app" / "api"

def scan_endpoints():
    results = []
    
    for py_file in sorted(API_DIR.glob("*.py")):
        if py_file.name == "__init__.py":
            continue
        
        content = py_file.read_text(encoding="utf-8")
        lines = content.split("\n")
        
        # Find prefix
        prefix_match = re.search(r'prefix\s*=\s*["\']([^"\']+)["\']', content)
        prefix = prefix_match.group(1) if prefix_match else ""
        
        # Find route decorators
        for i, line in enumerate(lines):
            route_match = re.match(r'\s*@router\.(get|post|put|delete|patch)\((["\'][^"\']*["\'])', line)
            if route_match:
                method = route_match.group(1).upper()
                path = route_match.group(2).strip('"\'')
                
                # Look ahead for auth dependencies
                func_block = "\n".join(lines[i:i+8])
                has_auth = "get_current_user" in func_block or "require_faculty" in func_block or "require_admin" in func_block
                
                if "require_admin" in func_block:
                    role = "Admin"
                elif "require_faculty" in func_block:
                    role = "Faculty/Admin"
                elif "get_current_user" in func_block:
                    role = "All Auth"
                else:
                    role = "⚠️  NONE"
                
                full_path = f"/api{prefix}{path}" if path not in ("", "/") else f"/api{prefix}/"
                full_path = full_path.replace("//", "/")
                
                results.append({
                    "method": method,
                    "path": full_path,
                    "auth": "✅ Yes" if has_auth else "❌ No",
                    "role": role,
                    "file": f"app/api/{py_file.name}"
                })
    
    return results

if __name__ == "__main__":
    endpoints = scan_endpoints()
    
    print(f"\n{'METHOD':<8} {'ENDPOINT':<50} {'AUTH':<10} {'ROLE':<20} FILE")
    print("-" * 110)
    
    unauth_write = 0
    for ep in endpoints:
        flag = ""
        if ep["auth"] == "❌ No" and ep["method"] in ("POST","PUT","DELETE","PATCH"):
            flag = " 🔴 CRITICAL"
            unauth_write += 1
        elif ep["auth"] == "❌ No" and ep["method"] == "GET":
            flag = " ⚠️"
        
        print(f"{ep['method']:<8} {ep['path']:<50} {ep['auth']:<10} {ep['role']:<20} {ep['file']}{flag}")
    
    print(f"\nTotal endpoints: {len(endpoints)}")
    print(f"Unauthenticated write endpoints: {unauth_write} {'🔴 ACTION REQUIRED' if unauth_write > 0 else '✅'}")
    print()
