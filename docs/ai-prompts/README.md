# AI Prompt & Implementation Log

This log documents the AI-assisted implementation sessions for the ACME Salary Management System, recording prompts, decisions, files modified, checks executed, and resolutions.

---

### Milestone M0: Planning & Repository Setup
- **Date / Milestone:** 2026-10-17 / M0
- **Tool / Agent:** Antigravity (Gemini 3.8 Flash)
- **Prompt / Task:** Review planning package (`docs/00` to `docs/13`), inspect repository, summarize constraints/ambiguities, and initialize clean Git repository with `.gitignore`.
- **Files Changed:**
  - `.gitignore` (excludes `*.db`, `.env`, `.venv`, `node_modules`, `dist/`)
  - `README.md` (project overview skeleton)
  - `docs/ai-prompts/README.md` (flattened from nested subfolder)
- **Tests / Checks Run:** `git status`, environment verification (`python 3.15`, `uv 0.9.26`, `node 26.12`, `npm 11.20`).
- **Issues Found & Resolution:** Git root was parent directory `/projects`; initialized standalone Git repo in `acme-salary-management-docs` to ensure clean commit history.

---

### Milestone M1: Backend Foundation & Database
- **Date / Milestone:** 2026-10-17 / M1
- **Tool / Agent:** Antigravity (Gemini 3.8 Flash)
- **Prompt / Task:** Initialize FastAPI project with `uv`, SQLite WAL mode, foreign keys enforcement, database migrations, money conversions (integer cents), and HR user bootstrap script.
- **Files Changed:**
  - `backend/pyproject.toml`
  - `backend/app/core/config.py`
  - `backend/app/core/errors.py`
  - `backend/app/core/security.py`
  - `backend/app/db/connection.py`
  - `backend/app/db/migrations.py`
  - `backend/app/repositories/hr_user_repo.py`
  - `backend/app/schemas/common.py`
  - `backend/scripts/create_hr_user.py`
  - `backend/tests/unit/test_foundations.py`
- **Tests / Checks Run:** `uv run pytest tests/unit/test_foundations.py` (5 passed in 0.29s). Tested `create_hr_user.py` CLI.
- **Issues Found & Resolution:** `executescript()` manages its own transaction; removed outer transaction wrapper in `init_db`. Ensured `:memory:` database strings never create physical disk folders.

---

### Milestone M2: Deterministic 10,000-Employee Seed Data
- **Date / Milestone:** 2026-10-17 / M2
- **Tool / Agent:** Antigravity (Gemini 3.8 Flash)
- **Prompt / Task:** Create high-performance deterministic seed script for 10,000 employees with initial salary history records and safe rerun/reset mechanisms.
- **Files Changed:**
  - `backend/scripts/seed.py`
  - `backend/tests/unit/test_seed.py`
- **Tests / Checks Run:**
  - `uv run pytest tests/unit/test_seed.py` (2 passed in 0.09s).
  - Benchmark seed: 10,000 records generated in 0.03s and inserted into SQLite in 0.16s. 100% unique codes and emails.

---

### Milestone M3: Authentication & Session Security
- **Date / Milestone:** 2026-10-17 / M3
- **Tool / Agent:** Antigravity (Gemini 3.8 Flash)
- **Prompt / Task:** Implement Argon2 password hashing, server-managed session cookies (`HttpOnly`, `SameSite`), CSRF token protection on state changes, and auth endpoints (`/login`, `/me`, `/logout`).
- **Files Changed:**
  - `backend/app/schemas/auth.py`
  - `backend/app/services/auth_service.py`
  - `backend/app/api/dependencies.py`
  - `backend/app/api/routes/auth.py`
  - `backend/app/api/routes/health.py`
  - `backend/app/main.py`
  - `backend/tests/integration/test_auth.py`
- **Tests / Checks Run:** `uv run pytest tests/integration/test_auth.py` (passed). Verified unauthenticated 401, invalid credentials 401, valid session creation, CSRF enforcement, and session invalidation on logout.

---

### Milestone M4: Employee Management API
- **Date / Milestone:** 2026-10-17 / M4
- **Tool / Agent:** Antigravity (Gemini 3.8 Flash)
- **Prompt / Task:** Implement employee endpoints (`GET /employees`, `POST /employees`, `GET /employees/{id}`, `PATCH /employees/{id}`) with server-side searching, filtering, pagination, and non-salary editing.
- **Files Changed:**
  - `backend/app/schemas/employee.py`
  - `backend/app/services/employee_service.py`
  - `backend/app/api/routes/employees.py`
  - `backend/tests/integration/test_employees.py`
- **Tests / Checks Run:** `uv run pytest tests/integration/test_employees.py` (passed). Verified atomic creation of initial history record, email conflict rejection (409), and rejection of salary modifications on PATCH endpoint (400).

---

### Milestone M5: Transactional Salary Updates & History
- **Date / Milestone:** 2026-10-17 / M5
- **Tool / Agent:** Antigravity (Gemini 3.8 Flash)
- **Prompt / Task:** Implement dedicated salary update endpoint (`POST /employees/{id}/salary-updates`) and history retrieval (`GET /employees/{id}/salary-history`) using immediate database transactions and integer cents.
- **Files Changed:**
  - `backend/app/schemas/salary.py`
  - `backend/app/services/salary_service.py`
  - `backend/app/api/routes/salaries.py`
  - `backend/tests/integration/test_salaries.py`
- **Tests / Checks Run:** `uv run pytest tests/integration/test_salaries.py` (2 passed in 0.45s). Verified previous salary automatic capture, descending chronological ordering, and transaction rollback on failure.

---

### Milestone M6: Programmatic Salary Analytics
- **Date / Milestone:** 2026-10-17 / M6
- **Tool / Agent:** Antigravity (Gemini 3.8 Flash)
- **Prompt / Task:** Implement programmatic statistical analytics endpoint (`GET /analytics/salaries`) computing average, median (arithmetic mean of two middle items for even counts), min, max, and department breakdowns respecting active filters.
- **Files Changed:**
  - `backend/app/schemas/analytics.py`
  - `backend/app/services/analytics_service.py`
  - `backend/app/api/routes/analytics.py`
  - `backend/tests/integration/test_analytics.py`
- **Tests / Checks Run:** `uv run pytest tests/integration/test_analytics.py` (passed). Verified known statistical dataset: even median, odd median, department grouping, filtered counts, and documented null/empty behavior for empty filter matches.

---

### Milestone M7: Frontend Enterprise HR Portal
- **Date / Milestone:** 2026-10-17 / M7
- **Tool / Agent:** Antigravity (Gemini 3.8 Flash)
- **Prompt / Task:** Build React + TypeScript web application with restrained enterprise design system, separate Employees and Analytics views, accessible forms, modals for create/edit/salary/history, KPI cards, and department breakdown charts.
- **Files Changed:**
  - `frontend/src/types/index.ts`
  - `frontend/src/services/api.ts`
  - `frontend/src/styles/theme.css`
  - `frontend/src/components/Navbar.tsx`
  - `frontend/src/components/LoginView.tsx`
  - `frontend/src/components/KPICard.tsx`
  - `frontend/src/components/EmployeeModal.tsx`
  - `frontend/src/components/SalaryUpdateModal.tsx`
  - `frontend/src/components/SalaryHistoryModal.tsx`
  - `frontend/src/pages/EmployeesPage.tsx`
  - `frontend/src/pages/AnalyticsPage.tsx`
  - `frontend/src/App.tsx`
  - `frontend/vite.config.ts`
- **Tests / Checks Run:** `npm run build` completed cleanly (`built in 319ms`). Fixed `verbatimModuleSyntax` type-only imports and unused variables.

---

### Milestone M8: Performance Checks & Query Plans
- **Date / Milestone:** 2026-10-17 / M8
- **Tool / Agent:** Antigravity (Gemini 3.8 Flash)
- **Prompt / Task:** Run performance benchmarks and verify SQL query plans (`EXPLAIN QUERY PLAN`) with full 10,000 seeded dataset.
- **Files Changed:**
  - `backend/tests/integration/test_performance.py`
- **Tests / Checks Run:**
  - `EXPLAIN QUERY PLAN`: Verified index usage for code, email, department, and salary history.
  - Performance Results on 10,000 employees:
    - Paginated & filtered list: **1.36ms**
    - Full statistical analytics computation over 10,000 records: **13.36ms**
  - Full backend test suite: **14 tests passed in 1.02s**.

---

### Milestone M9: Deployment Readiness & Documentation
- **Date / Milestone:** 2026-10-17 / M9
- **Tool / Agent:** Antigravity (Gemini 3.8 Flash)
- **Prompt / Task:** Provide multi-stage Docker build, production SPA serving from FastAPI, docker-compose with persistent SQLite volume, and comprehensive root README.
- **Files Changed:**
  - `Dockerfile`
  - `docker-compose.yml`
  - `backend/app/main.py`
  - `README.md`
  - `docs/ai-prompts/README.md`

---

### Milestone M10: Enterprise Visual Design Overhaul & Browser Verification
- **Date / Milestone:** 2026-10-17 / M10
- **Tool / Agent:** Antigravity (Gemini 3.8 Flash)
- **Prompt / Task:** Address feedback that the UI looked "too AI-ish and not up to the mark". Elevate aesthetics to top-tier enterprise B2B SaaS standards (Linear/Stripe/Rippling): typography, pastel avatars, department badges, segmented controls, colored KPI cards, relative scale progress bars, and high-res Playwright browser screenshot verification.
- **Files Changed:**
  - `frontend/src/styles/theme.css` (imported Plus Jakarta Sans & JetBrains Mono, color system, department badges, tabular numbers)
  - `frontend/src/components/Navbar.tsx` (glassmorphism header, brand pill, segmented switcher, live record indicator, HR user badge)
  - `frontend/src/components/KPICard.tsx` (accent top borders, soft icon badge, mono values, cohort subtitle chips)
  - `frontend/src/pages/EmployeesPage.tsx` (pastel hashed initials avatars, department color chips, mono salary, action groups, `⌘K` badge, CSV export)
  - `frontend/src/pages/AnalyticsPage.tsx` (accent KPI cards, department breakdown with relative scale gradient bars, currency tags)
  - `screenshot-employees.png` & `screenshot-analytics.png` (updated high-res Playwright captures)
- **Tests / Checks Run:**
  - `npm run build` completed in 187ms with zero errors.
  - Full Playwright browser automation test: logged in with `hr@acme.test`, inspected live pages, captured full-page screenshots.
  - Backend test suite: `uv run pytest` (14/14 passed in 1.06s).

---

### Milestone M11: Mobile & Responsive Layout Optimization
- **Date / Milestone:** 2026-10-17 / M11
- **Tool / Agent:** Antigravity (Gemini 3.8 Flash)
- **Prompt / Task:** Optimize application across all mobile viewports (e.g. 390x844 iPhone, tablets): responsive two-row mobile navbar, touch-accessible full-width segmented tab switcher, responsive employee card list on mobile (hiding wide table headers), stacked filter controls with keyboard shortcut chips, mobile-responsive KPI cards, bottom-sheet responsive modals, and verified Playwright mobile screenshots.
- **Files Changed:**
  - `frontend/src/styles/theme.css` (mobile padding, media queries, visibility helpers `.mobile-only` / `.desktop-only`, `.employee-mobile-card`, `.pagination-bar`, `.form-row`)
  - `frontend/src/components/Navbar.tsx` (dedicated mobile double-row header with brand, HR avatar, logout, and full-width segmented tabs)
  - `frontend/src/pages/EmployeesPage.tsx` (responsive header layout, stacked filter grid, dedicated mobile card list with action triggers, responsive pagination)
  - `frontend/src/pages/AnalyticsPage.tsx` (responsive page header, auto-fit filter grid, 1/2-column mobile KPI grid)
  - `frontend/src/components/EmployeeModal.tsx` (`.form-row` responsive multi-column layouts)
  - `frontend/src/components/SalaryUpdateModal.tsx` (responsive employee banner with `flexWrap: wrap`)
  - `frontend/src/components/SalaryHistoryModal.tsx` (responsive employee banner with `flexWrap: wrap`)
  - `screenshot-mobile-employees.png` & `screenshot-mobile-analytics.png` (verified mobile viewport screenshots)
- **Tests / Checks Run:**
  - `npm run build` compiled in 206ms with 0 errors.
  - Playwright mobile test run at 390x844: verified responsive navigation, employee cards, analytics cards, and captured screenshots.
  - Backend test suite: `uv run pytest` (14/14 passed in 1.07s).
