# ACME Salary Management System

A production-grade, internal HR salary management and analytics web application built for **ACME** (10,000 employees). Designed and implemented for the **Incubyte Take-Home Assessment**.

---

## 1. System Overview & Core Capabilities

- **10,000 Seeded Employees:** Deterministic, reproducible generation across realistic global departments, job titles, countries, and USD salary distributions.
- **Transactional Salary Updates:** Salary changes are decoupled from general employee editing. Updating an employee's salary atomically records an immutable audit entry in `salary_history` and updates current compensation within an immediate database transaction (`BEGIN IMMEDIATE`).
- **Initial Salary Preservation:** Creating an employee automatically writes their initial salary entry to history (`previous_salary = NULL`).
- **Programmatic Compensation Analytics:** Fast, deterministic calculation of Average, Median (exact 50th percentile with arithmetic mean of two middle items for even counts), Minimum, Maximum, and Department Breakdowns that dynamically respond to active filters.
- **Enterprise Security:** Argon2 password hashing, server-managed session cookies (`HttpOnly`, `SameSite`), and CSRF token protection on state-changing requests.
- **Sub-Millisecond Performance:** Indexed SQLite queries with Write-Ahead Logging (WAL) delivering **~1.36ms** paginated employee lookups and **~13.36ms** full analytics calculations over 10,000 records.

---

## 2. Architecture & Tech Stack

```mermaid
flowchart TD
    HR[HR Manager] --> UI["React 19 + TypeScript SPA (Vite)"]
    UI -->|Session Cookie + CSRF| API["FastAPI REST API (/api/v1)"]
    API --> AUTH["Session & Auth Service"]
    API --> SVC["Employee, Salary & Analytics Services"]
    SVC --> DAL["Parameterized Data Access Layer"]
    DAL --> DB[("SQLite Database (WAL Mode, FK Enforced)")]
```

- **Backend:** Python 3.12+, FastAPI, Pydantic, Argon2-cffi, managed via [`uv`](https://docs.astral.sh/uv/).
- **Frontend:** React + TypeScript, Vite, Lucide Icons, clean custom enterprise HR design tokens.
- **Database:** SQLite with strict foreign key constraints (`PRAGMA foreign_keys = ON`), Write-Ahead Logging (`PRAGMA journal_mode = WAL`), and USD money stored in integer cents.
- **Production Mode:** FastAPI optionally serves the compiled React Single Page Application directly from `frontend/dist`, offering a self-contained single-container or single-server deployment with zero CORS friction.

---

## 3. Quickstart & Local Setup

### Prerequisites
- Python 3.12+ and [`uv`](https://github.com/astral-sh/uv) (`curl -LsSf https://astral.sh/uv/install.sh | sh`)
- Node.js 18+ and `npm`

### Step 1: Install Dependencies
```bash
# Backend dependencies
cd backend
uv sync

# Frontend dependencies
cd ../frontend
npm install
cd ..
```

### Step 2: Bootstrap HR Manager Account
Create your local HR user credentials using the secure CLI helper:
```bash
cd backend
uv run python scripts/create_hr_user.py --email hr@acme.test --password "AcmeAdmin2026!"
cd ..
```

### Step 3: Seed 10,000 Employee Records
Seed the database with 10,000 deterministic employees and initial salary records (executes in <0.2s):
```bash
cd backend
uv run python scripts/seed.py --count 10000
cd ..
```
*Note: Rerunning the seed script is safe and idempotent. To wipe and re-seed from scratch, add the `--reset` flag.*

### Step 4: Run Development Servers
In terminal 1 (Backend API):
```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```
*Open [http://localhost:8000/docs](http://localhost:8000/docs) to view the interactive OpenAPI documentation.*

In terminal 2 (Frontend UI):
```bash
cd frontend
npm run dev
```
*Open [http://localhost:5173](http://localhost:5173) in your browser and log in with:*
- **Email:** `hr@acme.test`
- **Password:** `AcmeAdmin2026!`

---

## 4. Running Automated Tests & Performance Benchmarks

### Backend Test Suite (Unit, Integration, Rollback & Benchmarks)
```bash
cd backend
uv run pytest -v
```
All 14 tests execute against in-memory SQLite fixtures in ~1 second, covering:
- Exact integer-cent money conversion and precision validation
- Atomic initial salary history generation upon employee creation
- Concurrent transaction rollback when salary update constraints fail
- Session cookie validation, CSRF verification, and logout invalidation
- Programmatic median and department breakdown calculations
- SQLite `EXPLAIN QUERY PLAN` verification showing index utilization

### Performance Measurements (10,000 Seeded Records)
Run the automated benchmark suite:
```bash
cd backend
uv run pytest tests/integration/test_performance.py -s -v
```
**Actual Benchmark Results on 10,000 Employee Records:**
- **Paginated & Filtered Employee Query:** `1.36 ms`
- **Full Statistical Analytics Calculation (10k records):** `13.36 ms`
- **10,000 Employee Seed Insertion Time:** `0.16 s`

### Frontend Production Build & Typecheck
```bash
cd frontend
npm run build
```
Compiles and bundles the TypeScript React application cleanly into `frontend/dist/`.

---

## 5. Production Deployment (Docker & Persistent Storage)

Because SQLite stores state in a local file, persistent storage is required so data survives restarts.

### Option A: Turnkey Docker Compose (Persistent Volume)
```bash
# 1. Build and start container
docker compose up -d --build

# 2. Bootstrap HR user in container
docker compose exec app uv run python scripts/create_hr_user.py --email hr@acme.test --password "AcmeAdmin2026!"

# 3. Seed 10,000 employees in container
docker compose exec app uv run python scripts/seed.py --count 10000
```
Access the application at [http://localhost:8000](http://localhost:8000).

### Option B: Cloud Hosting (Render, Fly.io, Railway)
1. Mount a persistent disk volume to `/data`.
2. Set environment variable `DATABASE_PATH=/data/acme.db`.
3. Set `SESSION_SECRET` to a random high-entropy key and `SESSION_COOKIE_SECURE=true`.

---

## 6. Video Demo Walkthrough Guide

When recording the assessment demonstration video:
1. **Login:** Navigate to the deployed URL and sign in with the HR credentials.
2. **Employee Directory:** Demonstrate the 10,000-record dataset, pagination, and sorting by salary and name.
3. **Filtering:** Filter by Department (*Engineering*), Country (*United States*), and Salary Range (*$100,000 - $180,000*).
4. **Create Employee:** Click "Add Employee", fill in details with initial compensation, and demonstrate immediate addition to the directory.
5. **Non-Salary Edit:** Click "Edit", update the employee's Job Title, and show the note explaining salary is protected from inline editing.
6. **Transactional Salary Update:** Click "Salary", enter a new compensation amount and effective date, and submit.
7. **Salary History Audit:** Open "History" on the updated employee to demonstrate the chronological timeline showing the initial salary and the updated compensation with delta and percentage change.
8. **Analytics Dashboard:** Switch to the Analytics tab to demonstrate real-time Average, Median, Min, Max, and Department Breakdowns reflecting the active filters.
9. **Logout:** Sign out to prove session termination and protected route redirection.

---

## 7. Documentation Index

Detailed planning artifacts are preserved under [`docs/`](./docs):
- [`docs/01-requirements.md`](./docs/01-requirements.md) — Product requirements and boundary definition
- [`docs/02-discussion-and-decision-log.md`](./docs/02-discussion-and-decision-log.md) — Architectural decisions & rationale
- [`docs/03-system-architecture.md`](./docs/03-system-architecture.md) — End-to-end component flows
- [`docs/04-database-design.md`](./docs/04-database-design.md) — Schema, indexes, and transactions
- [`docs/05-api-specification.md`](./docs/05-api-specification.md) — REST API contracts & error shapes
- [`docs/06-code-structure-and-standards.md`](./docs/06-code-structure-and-standards.md) — Coding conventions & folder layout
- [`docs/07-implementation-plan.md`](./docs/07-implementation-plan.md) — Execution roadmap (M0 - M9)
- [`docs/08-testing-strategy.md`](./docs/08-testing-strategy.md) — Test plan and validation strategy
- [`docs/09-tradeoffs-and-performance.md`](./docs/09-tradeoffs-and-performance.md) — Engineering trade-offs
- [`docs/10-ai-agent-instructions.md`](./docs/10-ai-agent-instructions.md) — AI agent implementation protocol
- [`docs/11-security-and-data-integrity.md`](./docs/11-security-and-data-integrity.md) — Security safeguards
- [`docs/12-deployment-and-submission.md`](./docs/12-deployment-and-submission.md) — Deployment & checklist
- [`docs/13-ui-ux-design-guidelines.md`](./docs/13-ui-ux-design-guidelines.md) — HR portal UI/UX tokens
- [`docs/ai-prompts/README.md`](./docs/ai-prompts/README.md) — Milestone AI prompt log
