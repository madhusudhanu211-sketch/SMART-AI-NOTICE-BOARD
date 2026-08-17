# Load Testing — Smart Notice Board
## Baseline / Load Test with 100 Virtual Users

---

## What This Tests

| Setting | Value |
|---------|-------|
| **Tool** | Locust 2.46+ |
| **Virtual Users** | 100 concurrent |
| **Ramp-up** | 10 users/second → 100 in ~10s |
| **Duration** | 1 minute continuous |
| **Target** | `http://localhost:8000` |
| **User Mix** | 65% Student · 25% Faculty · 10% Admin |

---

## Metrics You Will See

### Requests per Second (RPS)
How many HTTP requests the backend handles every second across all 100 users.

```
Example:
  120 req/s   → API is handling 120 requests per second
   50 req/s   → Minimum acceptable threshold
```

### Response Times
```
Average:          250 ms    ← typical response time
Min:               50 ms    ← fastest response seen
Median (50th):    200 ms    ← half of requests faster than this
95th percentile:  800 ms    ← 95% of requests faster than this
99th percentile: 1200 ms    ← 99% of requests faster than this
Max:             1500 ms    ← slowest response seen
```

### Pass/Fail Thresholds

| Metric | Threshold | Meaning |
|--------|-----------|---------|
| RPS | >= 50 req/s | Backend must handle at least 50 requests/second |
| Average response | < 500 ms | Typical response must stay under 0.5 seconds |
| 95th percentile | < 1000 ms | 95% of requests must finish in under 1 second |
| Failure rate | < 5% | Less than 5% of requests may error |
| Max response | < 5000 ms | No response takes longer than 5 seconds |

---

## Quick Start

### Step 1 — Start the Backend

Open a terminal and run:
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

Wait until you see:
```
[OK] Database initialized and seed records verified.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 2 — Run the Load Test

Open a **second** terminal:
```bash
# Option A: Automated (recommended)
python load-tests/run_load_test.py

# Option B: Windows batch file
load-tests\start_load_test.bat

# Option C: Interactive web UI (browser dashboard)
locust -f load-tests/locustfile.py --host http://localhost:8000
# Then open: http://localhost:8089
```

### Step 3 — View Reports

After the test completes (about 70 seconds):
```
load-tests/reports/
├── load_test_YYYYMMDD_HHMMSS_stats.csv       ← raw per-endpoint data
├── load_test_YYYYMMDD_HHMMSS_stats_history.csv ← per-second timeline
├── load_test_report_YYYYMMDD_HHMMSS.xlsx     ← Excel report (3 sheets)
└── load_test_summary_YYYYMMDD_HHMMSS.txt     ← text summary
```

---

## Endpoints Tested

| Category | Endpoints |
|----------|-----------|
| Health | `GET /health` |
| Auth | `POST /api/auth/login` |
| Notices | `GET /api/notices`, `GET /api/notices?category=X`, `GET /api/notices/{id}` |
| Timetable | `GET /api/timetable` |
| Attendance | `GET /api/attendance`, `GET /api/attendance/summary`, `GET /api/attendance/students` |
| Results | `GET /api/results` |
| Events | `GET /api/events` |
| Placements | `GET /api/placements` |
| Assignments | `GET /api/assignments` |
| AI Chat | `POST /api/ai/chat` |
| Voice | `POST /api/voice/process` |
| Analytics | `GET /api/analytics/summary` |
| Reports | `GET /api/reports/notices/excel`, `GET /api/reports/attendance/excel` |
| Users | `GET /api/users/` (Admin only) |
| Departments | `GET /api/departments/` |
| Notifications | `GET /api/alerts/` |
| Profile | `GET /api/auth/me` |

---

## User Scenarios

### Student User (65% of traffic)
Simulates a student browsing notices, checking attendance, viewing results, using the AI chatbot.

### Faculty User (25% of traffic)
Simulates a faculty member checking enrolled students, reviewing attendance records, viewing analytics.

### Admin User (10% of traffic)
Simulates an admin viewing the dashboard, listing users, exporting reports.

---

## Understanding Results

### SQLite Limitation
The backend uses SQLite which is single-write-threaded. Under 100 concurrent users you may see:
- Higher-than-expected response times for write operations
- This is expected with SQLite — switch to PostgreSQL for production

### Expected Baseline (SQLite, local machine)
```
RPS:          30–120 req/s       (depends on CPU)
Avg response: 50–300 ms          (mostly fast GET requests)
95th pct:     200–800 ms
Failure rate: 0–2%
```

### Good Production Target (PostgreSQL)
```
RPS:          200+ req/s
Avg response: < 100 ms
95th pct:     < 300 ms
Failure rate: < 0.1%
```

---

## Interpreting Failure Rates

| Failure % | Meaning |
|-----------|---------|
| 0% | Perfect |
| < 1% | Excellent |
| 1–5% | Acceptable for baseline |
| > 5% | Backend struggling — needs investigation |
| > 10% | Critical — backend may be crashing |

---

## Files

| File | Purpose |
|------|---------|
| `locustfile.py` | Load test scenarios (Student/Faculty/Admin) |
| `run_load_test.py` | Automated runner with reporting |
| `start_load_test.bat` | Windows one-click launcher |
| `reports/` | Generated test reports |
