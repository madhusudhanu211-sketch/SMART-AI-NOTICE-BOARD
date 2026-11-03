"""
load-tests/run_load_test.py
====================================================
Smart Notice Board — Baseline Load Test Runner
====================================================

Usage:
    python load-tests/run_load_test.py

What this does:
    1. Checks the backend is running at localhost:8000
    2. Starts Locust with:
         - 100 virtual users
         - 1 minute duration
         - Headless (no browser UI needed)
    3. Auto-generates:
         - load-tests/reports/load_test_results.csv
         - load-tests/reports/load_test_report.xlsx
         - load-tests/reports/load_test_summary.txt

Output Metrics:
    - Requests per second (RPS)
    - Response time: Average / Min / Max / Median / 95th percentile
    - Total requests sent
    - Failure rate
    - Per-endpoint breakdown
"""

import os
import sys
import time
import subprocess
import json
import csv
import requests
from datetime import datetime
from pathlib import Path

import argparse

# ─── Configuration ─────────────────────────────────────────────────────────────
BASE_URL       = os.getenv("BACKEND_URL", "http://localhost:8000")
USERS          = int(os.getenv("LOAD_TEST_USERS", "100"))
SPAWN_RATE     = int(os.getenv("LOAD_TEST_SPAWN_RATE", "20"))
DURATION       = os.getenv("LOAD_TEST_DURATION", "30s")
LOCUSTFILE     = Path(__file__).parent / "locustfile.py"
REPORT_DIR     = Path(__file__).parent / "reports"
REPORT_DIR.mkdir(exist_ok=True)

TIMESTAMP      = datetime.now().strftime("%Y%m%d_%H%M%S")
CSV_PREFIX     = str(REPORT_DIR / f"load_test_{TIMESTAMP}")
SUMMARY_FILE   = REPORT_DIR / f"load_test_summary_{TIMESTAMP}.txt"

# ─── Step 1: Check if backend is running ─────────────────────────────────────
def check_backend():
    print("\n" + "="*60)
    print("  Smart Notice Board — Baseline Load Test")
    print("="*60)
    print(f"\n[1/4] Checking backend at {BASE_URL} ...")
    
    for attempt in range(3):
        try:
            resp = requests.get(f"{BASE_URL}/health", timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                print(f"      Backend: ONLINE ({data.get('status', 'ok')})")
                print(f"      App:     {data.get('app', 'Smart Notice Board')}")
                return True
        except requests.exceptions.ConnectionError:
            if attempt < 2:
                print(f"      Attempt {attempt+1}/3 failed. Retrying in 3s...")
                time.sleep(3)
    
    print("\n  [ERROR] Backend is not running!")
    print(f"  Please start it first:")
    print(f"    cd backend")
    print(f"    uvicorn main:app --host 0.0.0.0 --port 8000 --reload")
    print()
    return False

# ─── Step 2: Run Locust headless ─────────────────────────────────────────────
def run_locust(target_users=None, target_spawn=None, target_duration=None):
    users = target_users or USERS
    spawn = target_spawn or SPAWN_RATE
    duration = target_duration or DURATION
    
    print(f"\n[2/4] Starting Load Test...")
    print(f"      Users:      {users} virtual users")
    print(f"      Spawn rate: {spawn} users/second (ramp-up ~{max(1, users//spawn)}s)")
    print(f"      Duration:   {duration}")
    print(f"      Target:     {BASE_URL}")
    print(f"      Profile:    65% Students | 25% Faculty | 10% Admins")
    print()
    print("      Running... (press Ctrl+C to stop early)")
    print()

    html_report = str(REPORT_DIR / f"load_test_report_{users}_users_{TIMESTAMP}.html")

    cmd = [
        sys.executable, "-m", "locust",
        "-f", str(LOCUSTFILE),
        "--host", BASE_URL,
        "--users", str(users),
        "--spawn-rate", str(spawn),
        "--run-time", duration,
        "--headless",
        "--csv", CSV_PREFIX,
        "--csv-full-history",
        "--html", html_report,
        "--only-summary",
        "--logfile", str(REPORT_DIR / f"locust_{users}_users_{TIMESTAMP}.log"),
    ]

    start_time = time.time()
    try:
        result = subprocess.run(
            cmd,
            cwd=str(Path(__file__).parent.parent),  # project root
            capture_output=False,
            text=True,
        )
    except KeyboardInterrupt:
        print("\n  [INFO] Test interrupted by user.")
    
    elapsed = round(time.time() - start_time, 1)
    print(f"\n      Test completed in {elapsed}s")
    print(f"      HTML report saved to: {html_report}")
    return elapsed

# ─── Step 3: Parse CSV results ─────────────────────────────────────────────
def parse_results():
    stats_file = Path(f"{CSV_PREFIX}_stats.csv")
    if not stats_file.exists():
        print(f"\n  [WARN] Stats file not found: {stats_file}")
        return None, None
    
    rows = []
    with open(stats_file, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    
    # Find the "Aggregated" summary row
    agg = next((r for r in rows if r.get("Name") == "Aggregated"), None)
    
    return rows, agg

# ─── Step 4: Print summary and generate reports ───────────────────────────
def print_summary(rows, agg, elapsed_seconds):
    print("\n" + "="*60)
    print("  LOAD TEST RESULTS — Smart Notice Board")
    print("="*60)

    if not agg:
        print("  [WARN] No aggregated results found. Did the backend respond?")
        return

    total_requests  = int(agg.get("Request Count", 0))
    total_failures  = int(agg.get("Failure Count", 0))
    avg_rps         = float(agg.get("Requests/s", 0))
    avg_resp        = float(agg.get("Average Response Time", 0))
    min_resp        = float(agg.get("Min Response Time", 0))
    max_resp        = float(agg.get("Max Response Time", 0))
    median_resp     = float(agg.get("Median Response Time", 0))
    p95_resp        = float(agg.get("95%", 0))
    p99_resp        = float(agg.get("99%", 0))
    failure_pct     = (total_failures / total_requests * 100) if total_requests > 0 else 0

    print(f"""
  THROUGHPUT
  ──────────────────────────────────
  Requests/sec (RPS):      {avg_rps:.1f} req/s
  Total requests sent:     {total_requests:,}
  Total failures:          {total_failures:,}
  Failure rate:            {failure_pct:.2f}%

  RESPONSE TIMES
  ──────────────────────────────────
  Average:                 {avg_resp:.0f} ms
  Minimum:                 {min_resp:.0f} ms
  Median (50th pct):       {median_resp:.0f} ms
  95th percentile:         {p95_resp:.0f} ms
  99th percentile:         {p99_resp:.0f} ms
  Maximum:                 {max_resp:.0f} ms

  TEST CONFIG
  ──────────────────────────────────
  Virtual Users:           100
  Duration:                1 minute
  User Mix:                65% Student | 25% Faculty | 10% Admin
""")

    # ── Per-endpoint breakdown ─────────────────────────────────────────────
    endpoint_rows = [r for r in rows if r.get("Name") != "Aggregated"]
    if endpoint_rows:
        print("  ENDPOINT BREAKDOWN")
        print(f"  {'Method':<8} {'Endpoint':<45} {'Req':>6} {'Fail':>5} {'Avg(ms)':>8} {'95%(ms)':>8}")
        print("  " + "-"*82)
        for row in sorted(endpoint_rows, key=lambda r: -float(r.get("Requests/s", 0))):
            method   = row.get("Method", "")[:6]
            name     = row.get("Name", "")[:43]
            req      = row.get("Request Count", "0")
            fail     = row.get("Failure Count", "0")
            avg      = row.get("Average Response Time", "0")
            p95      = row.get("95%", "0")
            print(f"  {method:<8} {name:<45} {req:>6} {fail:>5} {float(avg):>8.0f} {float(p95):>8.0f}")

    # ── Pass/Fail thresholds ───────────────────────────────────────────────
    print(f"\n  PERFORMANCE THRESHOLDS")
    print(f"  ──────────────────────────────────")
    
    thresholds = [
        ("RPS >= 50 req/s",            avg_rps >= 50,       f"{avg_rps:.1f} req/s"),
        ("Average response < 500ms",   avg_resp < 500,      f"{avg_resp:.0f} ms"),
        ("95th pct < 1000ms",          p95_resp < 1000,     f"{p95_resp:.0f} ms"),
        ("Error rate < 5%",            failure_pct < 5,     f"{failure_pct:.2f}%"),
        ("Max response < 5000ms",      max_resp < 5000,     f"{max_resp:.0f} ms"),
    ]

    passed = 0
    for label, ok, value in thresholds:
        icon = "[PASS]" if ok else "[FAIL]"
        print(f"  {icon}  {label:<35} Actual: {value}")
        if ok:
            passed += 1

    overall = "PASS" if passed == len(thresholds) else ("WARN" if passed >= 3 else "FAIL")
    print(f"\n  Overall Result: {overall}  ({passed}/{len(thresholds)} thresholds met)")
    print("="*60)

    # ── Write summary text file ────────────────────────────────────────────
    with open(SUMMARY_FILE, "w", encoding="utf-8") as f:
        f.write("Smart Notice Board — Baseline Load Test Summary\n")
        f.write(f"Timestamp: {TIMESTAMP}\n")
        f.write(f"Target:    {BASE_URL}\n\n")
        f.write(f"THROUGHPUT\n")
        f.write(f"  RPS:               {avg_rps:.1f}\n")
        f.write(f"  Total Requests:    {total_requests}\n")
        f.write(f"  Total Failures:    {total_failures}\n")
        f.write(f"  Failure Rate:      {failure_pct:.2f}%\n\n")
        f.write(f"RESPONSE TIMES\n")
        f.write(f"  Average:           {avg_resp:.0f} ms\n")
        f.write(f"  Min:               {min_resp:.0f} ms\n")
        f.write(f"  Median:            {median_resp:.0f} ms\n")
        f.write(f"  95th pct:          {p95_resp:.0f} ms\n")
        f.write(f"  99th pct:          {p99_resp:.0f} ms\n")
        f.write(f"  Max:               {max_resp:.0f} ms\n\n")
        f.write(f"Overall: {overall} ({passed}/{len(thresholds)} thresholds)\n")
    
    print(f"\n  Reports saved to:  load-tests/reports/")
    print(f"  CSV (raw data):    load_test_{TIMESTAMP}_stats.csv")
    print(f"  Summary (text):    load_test_summary_{TIMESTAMP}.txt")

    return {
        "rps": avg_rps, "avg": avg_resp, "min": min_resp,
        "max": max_resp, "median": median_resp,
        "p95": p95_resp, "p99": p99_resp,
        "total": total_requests, "failures": total_failures,
        "failure_pct": failure_pct, "overall": overall
    }

# ─── Step 5: Generate Excel Report ────────────────────────────────────────
def generate_excel(rows, agg, metrics):
    try:
        import openpyxl
        from openpyxl.styles import (PatternFill, Font, Alignment,
                                     Border, Side)
        from openpyxl.chart import BarChart, Reference
        from openpyxl.utils import get_column_letter
    except ImportError:
        print("  [INFO] openpyxl not available — skipping Excel report")
        return

    if not metrics:
        return

    wb = openpyxl.Workbook()

    # ── Colors ─────────────────────────────────────────────────────────────
    DARK_BLUE  = "1F3864"
    GREEN_PASS = "D7F5D7"
    RED_FAIL   = "FFD7D7"
    YELLOW_WARN= "FFFBC0"
    HEADER_FG  = "FFFFFF"

    def hdr(cell, text, bg=DARK_BLUE):
        cell.value = text
        cell.font = Font(bold=True, color=HEADER_FG, size=10)
        cell.fill = PatternFill("solid", fgColor=bg)
        cell.alignment = Alignment(horizontal="center", vertical="center")

    def val(cell, v, bold=False):
        cell.value = v
        cell.alignment = Alignment(horizontal="center", vertical="center")
        if bold:
            cell.font = Font(bold=True)

    # ── Sheet 1: Executive Summary ─────────────────────────────────────────
    ws1 = wb.active
    ws1.title = "Summary"
    ws1.column_dimensions["A"].width = 38
    ws1.column_dimensions["B"].width = 22
    ws1.column_dimensions["C"].width = 18

    hdr(ws1["A1"], "Smart Notice Board — Baseline Load Test")
    ws1.merge_cells("A1:C1")
    ws1["A1"].font = Font(bold=True, color=HEADER_FG, size=13)
    ws1.row_dimensions[1].height = 30

    ws1["A2"] = f"Timestamp: {TIMESTAMP}"
    ws1["A3"] = f"Target: {BASE_URL}"
    ws1["A4"] = f"Users: 100 virtual | Duration: 1 minute | Mix: 65% Student / 25% Faculty / 10% Admin"

    summary_rows = [
        ("", "Metric", "Value", "Threshold"),
        ("THROUGHPUT", "Requests/sec (RPS)", f"{metrics['rps']:.1f} req/s", ">= 50"),
        ("", "Total Requests", f"{metrics['total']:,}", "—"),
        ("", "Total Failures", f"{metrics['failures']:,}", "—"),
        ("", "Failure Rate", f"{metrics['failure_pct']:.2f}%", "< 5%"),
        ("RESPONSE TIME", "Average", f"{metrics['avg']:.0f} ms", "< 500 ms"),
        ("", "Minimum", f"{metrics['min']:.0f} ms", "—"),
        ("", "Median (50th pct)", f"{metrics['median']:.0f} ms", "—"),
        ("", "95th Percentile", f"{metrics['p95']:.0f} ms", "< 1000 ms"),
        ("", "99th Percentile", f"{metrics['p99']:.0f} ms", "—"),
        ("", "Maximum", f"{metrics['max']:.0f} ms", "< 5000 ms"),
    ]

    start_row = 6
    for group_label, metric, value, threshold in summary_rows:
        r = start_row
        ws1.cell(r, 1, group_label).font = Font(bold=True)
        ws1.cell(r, 2, metric)
        cell_val = ws1.cell(r, 3, value)
        ws1.cell(r, 4, threshold)

        # Color-code pass/fail
        if "FAIL" in str(metrics.get("overall", "")):
            cell_val.fill = PatternFill("solid", fgColor=RED_FAIL)

        start_row += 1

    # Overall result
    start_row += 1
    overall_cell = ws1.cell(start_row, 2, f"OVERALL: {metrics['overall']}")
    overall_cell.font = Font(bold=True, size=12)
    if metrics["overall"] == "PASS":
        overall_cell.fill = PatternFill("solid", fgColor=GREEN_PASS)
    elif metrics["overall"] == "FAIL":
        overall_cell.fill = PatternFill("solid", fgColor=RED_FAIL)
    else:
        overall_cell.fill = PatternFill("solid", fgColor=YELLOW_WARN)

    # ── Sheet 2: Endpoint Breakdown ────────────────────────────────────────
    ws2 = wb.create_sheet("Endpoint Breakdown")
    cols = ["Type", "Endpoint", "Requests", "Failures", "RPS",
            "Avg (ms)", "Min (ms)", "Median (ms)", "95th (ms)", "99th (ms)", "Max (ms)"]
    for c, h in enumerate(cols, 1):
        hdr(ws2.cell(1, c), h)
        ws2.column_dimensions[get_column_letter(c)].width = 16

    ws2.column_dimensions["B"].width = 48

    endpoint_rows = [r for r in rows if r.get("Name") != "Aggregated"]
    for r_idx, row in enumerate(
            sorted(endpoint_rows, key=lambda r: -float(r.get("Requests/s", 0))), 2):
        data = [
            row.get("Method", ""),
            row.get("Name", ""),
            row.get("Request Count", ""),
            row.get("Failure Count", ""),
            f"{float(row.get('Requests/s', 0)):.1f}",
            f"{float(row.get('Average Response Time', 0)):.0f}",
            f"{float(row.get('Min Response Time', 0)):.0f}",
            f"{float(row.get('Median Response Time', 0)):.0f}",
            f"{float(row.get('95%', 0)):.0f}",
            f"{float(row.get('99%', 0)):.0f}",
            f"{float(row.get('Max Response Time', 0)):.0f}",
        ]
        for c_idx, v in enumerate(data, 1):
            cell = ws2.cell(r_idx, c_idx, v)
            cell.alignment = Alignment(horizontal="center")
            # Highlight failures
            if int(row.get("Failure Count", 0)) > 0:
                cell.fill = PatternFill("solid", fgColor=RED_FAIL)

    # Aggregated row at bottom
    if agg:
        agg_row = ws2.max_row + 2
        ws2.cell(agg_row, 1, "TOTAL").font = Font(bold=True)
        agg_data = [
            "Aggregated",
            agg.get("Request Count", ""),
            agg.get("Failure Count", ""),
            f"{float(agg.get('Requests/s', 0)):.1f}",
            f"{float(agg.get('Average Response Time', 0)):.0f}",
            f"{float(agg.get('Min Response Time', 0)):.0f}",
            f"{float(agg.get('Median Response Time', 0)):.0f}",
            f"{float(agg.get('95%', 0)):.0f}",
            f"{float(agg.get('99%', 0)):.0f}",
            f"{float(agg.get('Max Response Time', 0)):.0f}",
        ]
        for c_idx, v in enumerate(agg_data, 2):
            cell = ws2.cell(agg_row, c_idx, v)
            cell.font = Font(bold=True)
            cell.fill = PatternFill("solid", fgColor="D0D8FF")
            cell.alignment = Alignment(horizontal="center")

    # ── Sheet 3: Response Time Thresholds ─────────────────────────────────
    ws3 = wb.create_sheet("Thresholds")
    thresholds = [
        ("RPS", f"{metrics['rps']:.1f}", "50.0", metrics['rps'] >= 50),
        ("Avg Response Time (ms)", f"{metrics['avg']:.0f}", "500", metrics['avg'] < 500),
        ("95th Percentile (ms)", f"{metrics['p95']:.0f}", "1000", metrics['p95'] < 1000),
        ("Failure Rate (%)", f"{metrics['failure_pct']:.2f}", "5.00", metrics['failure_pct'] < 5),
        ("Max Response Time (ms)", f"{metrics['max']:.0f}", "5000", metrics['max'] < 5000),
    ]

    hdr(ws3.cell(1, 1), "Metric")
    hdr(ws3.cell(1, 2), "Actual Value")
    hdr(ws3.cell(1, 3), "Threshold")
    hdr(ws3.cell(1, 4), "Result")
    ws3.column_dimensions["A"].width = 30
    ws3.column_dimensions["B"].width = 18
    ws3.column_dimensions["C"].width = 18
    ws3.column_dimensions["D"].width = 12

    for r, (metric, actual, threshold, passed) in enumerate(thresholds, 2):
        ws3.cell(r, 1, metric)
        ws3.cell(r, 2, actual).alignment = Alignment(horizontal="center")
        ws3.cell(r, 3, threshold).alignment = Alignment(horizontal="center")
        result_cell = ws3.cell(r, 4, "PASS" if passed else "FAIL")
        result_cell.fill = PatternFill("solid", fgColor=GREEN_PASS if passed else RED_FAIL)
        result_cell.font = Font(bold=True)
        result_cell.alignment = Alignment(horizontal="center")

    excel_path = REPORT_DIR / f"load_test_report_{TIMESTAMP}.xlsx"
    wb.save(excel_path)
    print(f"  Excel report:      load_test_report_{TIMESTAMP}.xlsx")

def write_markdown_summary(stage_metrics_list):
    """Writes a GitHub Actions step summary markdown file."""
    md_file = REPORT_DIR / "load_test_summary.md"
    with open(md_file, "w", encoding="utf-8") as f:
        f.write("### 🚀 Backend REST API Load & Performance Test Results\n\n")
        f.write("| Virtual Users | Total Requests | RPS | Avg Latency (ms) | 95th Percentile (ms) | Failure Rate | Status |\n")
        f.write("| :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n")
        for m in stage_metrics_list:
            status = "✅ PASS" if m.get("failure_pct", 0) < 5.0 and m.get("p95", 0) < 1500 else "⚠️ REVIEW"
            f.write(
                f"| **{m.get('users')} Users** | {m.get('total')} | "
                f"{m.get('rps'):.1f} req/s | {m.get('avg'):.0f} ms | "
                f"{m.get('p95'):.0f} ms | {m.get('failure_pct'):.2f}% | "
                f"**{status}** |\n"
            )
        f.write("\n> *Tested using Locust against FastAPI endpoints: Auth, Notices, AI Chatbot, Attendance, Timetable, Voice Assistant.*")
    print(f"  GitHub Summary:    {md_file}")

# ─── Main ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Smart Notice Board Load Test Runner")
    parser.add_argument("--users", type=int, default=USERS, help="Concurrent virtual users")
    parser.add_argument("--spawn-rate", type=int, default=SPAWN_RATE, help="Spawn rate")
    parser.add_argument("--duration", type=str, default=DURATION, help="Test duration (e.g. 30s, 1m)")
    parser.add_argument("--host", type=str, default=BASE_URL, help="Target backend URL")
    parser.add_argument("--stages", action="store_true", help="Run 100, 300, and 500 virtual users stages")
    args = parser.parse_args()

    BASE_URL = args.host
    USERS = args.users
    SPAWN_RATE = args.spawn_rate
    DURATION = args.duration

    if not check_backend():
        sys.exit(1)

    stages = [100, 300, 500] if args.stages else [USERS]
    stage_summaries = []

    for stage_users in stages:
        spawn_rate = max(10, stage_users // 5)
        print(f"\n" + "="*60)
        print(f"  RUNNING LOAD STAGE: {stage_users} CONCURRENT USERS")
        print(f"="*60)
        
        CSV_PREFIX = str(REPORT_DIR / f"load_test_{stage_users}_users_{TIMESTAMP}")
        elapsed = run_locust(target_users=stage_users, target_spawn=spawn_rate, target_duration=DURATION)

        print(f"\n[3/4] Parsing results for {stage_users} users...")
        rows, agg = parse_results()

        print(f"\n[4/4] Generating reports for {stage_users} users...")
        if rows and agg:
            metrics = print_summary(rows, agg, elapsed)
            metrics["users"] = stage_users
            stage_summaries.append(metrics)
            generate_excel(rows, agg, metrics)

    if stage_summaries:
        write_markdown_summary(stage_summaries)

    print(f"\n  Done! All load test reports saved to load-tests/reports/\n")
