"""
push_to_github.py
=============================================================================
Helper script to push commits to GitHub using a GitHub Personal Access Token.
Usage:
    python push_to_github.py <YOUR_GITHUB_TOKEN>
    or:
    python push_to_github.py  (will prompt securely for token)
"""

import sys
import getpass
from dulwich import porcelain

def main():
    token = sys.argv[1].strip() if len(sys.argv) > 1 else ""
    if not token:
        try:
            token = getpass.getpass("Enter your GitHub Personal Access Token (PAT): ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nOperation cancelled.")
            sys.exit(1)

    if not token:
        print("\n[ERROR] No GitHub token provided.")
        print("Please generate a token with 'repo' and 'workflow' scope at:")
        print("  https://github.com/settings/tokens")
        sys.exit(1)

    remote_url = f"https://{token}@github.com/madhusudhanu211-sketch/SMART-AI-NOTICE-BOARD.git"
    print("\n[INFO] Pushing local commits to origin main...")
    try:
        porcelain.push(".", remote_url, "refs/heads/main")
        print("\n[SUCCESS] Successfully pushed all commits to https://github.com/madhusudhanu211-sketch/SMART-AI-NOTICE-BOARD!")
        print("[CI/CD] Your GitHub Actions workflows (Selenium, Appium, Load Tests) are now triggered on GitHub.")
    except Exception as e:
        print(f"\n[ERROR] Push failed: {e}")
        print("Please verify that your GitHub token has the 'repo' and 'workflow' permissions enabled.")

if __name__ == "__main__":
    main()

