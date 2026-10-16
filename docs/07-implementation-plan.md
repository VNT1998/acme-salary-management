# ACME Salary Management System
## Implementation Plan and Action Items

**Document ID:** 07  
**Execution tool:** Antigravity  
**Rule:** Do not begin full implementation until the planning documents are reviewed and approved.

## 1. Execution Strategy

Build in small, testable milestones. The agent should inspect the repository before changing files, follow the approved documents, run checks after each milestone, and stop to ask about material conflicts rather than silently changing scope.

## 2. Milestones

### M0 — Repository and planning setup
**Tasks**
- Review all approved documents.
- Create the repository structure and `.gitignore`.
- Initialize Git and add a README skeleton.
- Confirm Python/`uv` and Node package manager versions.
- Record a baseline commit.

**Acceptance**
- Clean repository; no secrets or database files committed.
- Folder structure is documented and proportionate.

### M1 — Backend foundation and database
**Tasks**
- Configure FastAPI and SQLite.
- Implement schema creation/migrations and foreign-key enforcement.
- Implement employee, salary-history, HR-user, and session persistence.
- Add validation and database constraints.
- Add account-provisioning command without hardcoded credentials.

**Acceptance**
- App starts from documented commands.
- Schema can be created from a clean database.
- Unit tests cover money/date validation and constraints.

### M2 — Deterministic seed data
**Tasks**
- Create a seed script for 10,000 employees and initial salary-history records.
- Use deterministic values and unique employee codes/emails.
- Make reruns safe and document reset behavior.

**Acceptance**
- Exactly 10,000 employee records after a fresh seed.
- Each employee has an initial history record.
- Re-running does not create duplicates.
- Script reports success/failure clearly.

### M3 — Authentication and session security
**Tasks**
- Implement password hashing and verification.
- Implement login, current-user, logout, session expiry, and protected endpoints.
- Configure cookie flags and CSRF protection for state-changing requests.
- Add tests for invalid credentials, expired sessions, and unauthorized access.

**Acceptance**
- Protected endpoints reject unauthenticated requests.
- Logout invalidates the session.
- No plaintext passwords or tokens are stored or logged.

### M4 — Employee API
**Tasks**
- Implement create, detail, list/search, filtering, pagination, sorting, and non-salary edit endpoints.
- Ensure generated IDs and unique email behavior.
- Return consistent validation/conflict/not-found errors.

**Acceptance**
- API contracts and OpenAPI docs match `05-api-specification.md`.
- Integration tests cover CRUD-like supported flows and edge cases.
- Employee creation and initial history insert are atomic.

### M5 — Salary management
**Tasks**
- Implement dedicated salary update and history retrieval endpoints.
- Use integer cents internally.
- Add transaction handling and concurrent-update protection.
- Ensure history rows are appended rather than overwritten.

**Acceptance**
- Every successful salary change has one corresponding history record.
- A failed history insert rolls back the current salary update.
- Salary precision, dates, and conflicts are tested.

### M6 — Analytics
**Tasks**
- Implement average, median, minimum, maximum, and department breakdown.
- Apply employee filters consistently to analytics.
- Define exact rounding and empty-result behavior.
- Add tests using small known datasets.

**Acceptance**
- Analytics results match independently calculated expected values.
- Empty filters return documented null/empty values.
- No LLM is used for calculations.

### M7 — Frontend
**Tasks**
- Implement login/logout.
- Build professional HR navigation with separate Employees and Analytics views.
- Implement server-side search, filters, pagination, employee creation/editing, salary update, and history display.
- Implement metric cards and department breakdown charts/tables.
- Add accessible forms, loading, empty, success, and error states.

**Acceptance**
- UI uses the API rather than mock data for the finished flow.
- All required features work end to end.
- Layout is responsive and keyboard-accessible for core workflows.

### M8 — Integration, quality, and performance checks
**Tasks**
- Run unit and integration tests.
- Run frontend checks and production build.
- Exercise the app with the seeded 10,000 employees.
- Inspect query plans and adjust justified indexes.
- Review security, error handling, and data consistency.
- Fix defects and document any accepted limitations.

**Acceptance**
- Test suite passes reproducibly.
- Main list/filter/analytics flows remain responsive with 10,000 records.
- No critical security or data-integrity issue remains.

### M9 — Deployment and demo
**Tasks**
- Select a host that supports the backend, frontend, HTTPS, environment configuration, and persistent SQLite storage.
- Configure production secrets and bootstrap the HR account securely.
- Deploy and test the actual hosted application.
- Record a concise demo using seeded sample data.
- Finalize README and submission checklist.

**Acceptance**
- Deployed URL is functional after restart/redeployment.
- Database persistence is verified.
- Video demo shows the key user flows.
- Repository link and required artifacts are ready for email submission.

## 3. Git Commit Guidance

Use small commits that explain intent. Example sequence:
1. `docs: add requirements and decision log`
2. `chore: initialize backend and frontend structure`
3. `feat: add SQLite schema and migrations`
4. `feat: add deterministic employee seed script`
5. `feat: add HR session authentication`
6. `feat: add employee APIs and filters`
7. `feat: add transactional salary history`
8. `feat: add salary analytics`
9. `feat: build employee management UI`
10. `feat: build analytics dashboard`
11. `test: cover salary and API integration flows`
12. `docs: add deployment and demo instructions`

Adapt commits to actual work; do not create misleading commits for work that did not occur.

## 4. Agent Checkpoint Rules

At the end of each milestone, Antigravity should report:
- Files changed.
- Decisions implemented.
- Tests/checks run and their actual results.
- Known issues or deviations.
- Proposed next milestone.

Do not claim tests, deployment, or video recording are complete unless they have actually been performed and verified.
