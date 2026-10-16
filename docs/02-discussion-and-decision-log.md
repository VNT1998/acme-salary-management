# ACME Salary Management System
## Discussion and Decision Log

**Document ID:** 02  
**Status:** Draft for review  
**Purpose:** Record the reasoning behind the product and engineering decisions made during brainstorming for the Incubyte Salary Management Assessment.

This document records decisions made so far. It distinguishes decisions agreed during discussion from requirements explicitly stated in the assessment brief. Any conflict with the assessment brief must be resolved in favor of the assessment requirement.

---

## 1. Product Context

### Problem
ACME is a fictional organization with 10,000 employees. Its HR Manager needs a web-based application to manage employee and salary information currently handled through spreadsheets, and to answer compensation questions through reliable reports and analytics.

### Product boundary
The application is an internal tool for ACME, not a commercial multi-tenant HR SaaS product. Multi-company tenancy and related complexity are therefore excluded from the initial scope.

**Reasoning:** The assessment describes one organization and its HR Manager. It does not ask for a product sold to multiple companies. Designing for multi-tenancy would add complexity without addressing the stated problem.

---

## 2. Decisions

### D-01 — Internal application for one fictional organization

- **Decision:** Build an internal salary management application for fictional company ACME.
- **Alternatives considered:** Build a multi-tenant HR product intended to be sold to other organizations.
- **Reasoning:** The assessment describes ACME's own HR team managing its 10,000 employees. Multi-tenant functionality is not requested.
- **Trade-off:** The design will not include organization-level tenant isolation. This keeps the scope focused and can be revisited if the product boundary changes.

### D-02 — Primary user

- **Decision:** The primary user is an HR Manager.
- **Reasoning:** This is the persona named in the assessment.
- **Implication:** The interface and workflows should prioritize employee lookup, salary changes, and compensation reporting rather than employee self-service.

### D-03 — USD-only salary scope

- **Decision:** Store and report salaries in USD only for the initial version.
- **Alternatives considered:** Support multiple currencies or convert all amounts using exchange rates.
- **Reasoning:** ACME is fictional, the assessment does not specify a real country or currency policy, and exchange-rate conversion would introduce additional requirements and potential inaccuracies.
- **Trade-off:** The application will not support local-currency salaries or currency conversion in this version. The USD-only limitation must be explicit in the requirements and UI where appropriate.

### D-04 — System-generated employee IDs

- **Decision:** Generate a unique employee identifier within the application, for example `EMP-1001`.
- **Alternatives considered:** Import IDs from an existing HR system.
- **Reasoning:** The assessment does not identify an existing source system or provide an employee-ID import requirement. The application needs to seed its own 10,000 employee records.
- **Trade-off:** Importing an external HR identifier is not supported in the initial version.

### D-05 — Employee fields and management

- **Decision:** Employee records include an internal database ID, human-readable employee ID, full name, email, department, job title, country, and current salary in USD.
- **Decision:** HR can create, view, search, filter, and edit employee details.
- **Decision:** Permanent employee deletion is not included in the initial version.
- **Reasoning:** These fields support the directory, filtering, and salary analytics. Employee details are edited through employee-management operations, while salary changes use a separate dedicated workflow.
- **Trade-off:** The first version will not include employee deletion or a soft-delete lifecycle. If deletion or deactivation becomes necessary, its data-retention and history behavior should be designed explicitly rather than added implicitly.

### D-06 — Separate employee and salary-history tables

- **Decision:** Use an `employees` table for employee details and current salary, and a `salary_history` table for salary events.
- **Alternatives considered:** Keep only the current salary, or build a more elaborate compensation-management model.
- **Reasoning:** The current salary is easy to retrieve from the employee record, while a separate history table preserves traceability without introducing unnecessary complexity.
- **Trade-off:** Current salary and history must be updated consistently in one database transaction.

### D-07 — Initial salary history entry

- **Decision:** Creating an employee also creates an initial salary-history entry.
- **Reasoning:** The first salary should be traceable; otherwise, history would begin only after the first salary change and would be incomplete.
- **Trade-off:** Employee creation must insert both the employee and initial history entry atomically.

### D-08 — Append-only salary history

- **Decision:** Each salary change creates a new history record with the previous salary, new salary, effective date, and record timestamp. Existing history records are not overwritten.
- **Alternatives considered:** Store only the latest salary or build a full compensation-management history with promotion reasons and advanced future-effective-date behavior.
- **Reasoning:** The user prioritized being able to trace salary changes, while keeping the first version simple and maintainable.
- **Trade-off:** Advanced compensation workflows, promotion reasons, and scheduled future salary changes are out of scope.

### D-09 — Dedicated salary-update workflow and transaction

- **Decision:** HR submits the new salary and effective date; the backend retrieves the existing salary, updates the current salary, and inserts a history record in the same transaction.
- **Failure behavior:** If either database operation fails, the transaction rolls back so the current salary and history cannot diverge.
- **Reasoning:** HR should not manually supply the previous salary, because that could create inaccurate history.
- **Trade-off:** The backend must handle transaction failures and consider concurrent updates to the same employee.

### D-10 — Programmatic analytics, no in-product LLM

- **Decision:** Calculate analytics programmatically using database queries and/or backend code. Do not add a chatbot or LLM-based natural-language interface.
- **Alternatives considered:** Add a natural-language question interface for HR.
- **Reasoning:** The assessment asks the application to help HR answer compensation questions, but does not explicitly require a chatbot. Standard analytics can answer the agreed questions more predictably and can be tested deterministically.
- **Metrics:** Average, median, minimum, maximum, and department-wise compensation breakdown.
- **Filters:** Department, country, job title, and salary range. Applicable filters should affect both employee results and analytics consistently.
- **Trade-off:** Users cannot ask arbitrary free-text questions in the initial version.

### D-11 — SQLite database

- **Decision:** Use SQLite rather than PostgreSQL for the assessment implementation.
- **Alternatives considered:** PostgreSQL, which would require additional local database setup if not containerized.
- **Reasoning:** The user prefers a minimal local setup and does not want to run Docker just to operate the database. SQLite supports a relational schema, constraints, transactions, and a 10,000-employee assessment dataset.
- **Trade-off:** SQLite has more limited concurrent-write behavior than PostgreSQL and is not the default choice for a heavily concurrent production HR system. Keep database access behind a clear data-access layer so a different database could be adopted later if needed.
- **Operational requirement:** Ensure the database file persists across application restarts and is not accidentally committed if it contains sensitive or generated data.

### D-12 — Simple email/password login with cookie-based sessions

- **Decision:** Provide a simple login using email and password, with server-managed sessions carried in secure cookies.
- **Security direction:** Never store plaintext passwords. Use an established password-hashing algorithm; configure cookies with appropriate `HttpOnly`, `Secure` (in HTTPS deployments), and `SameSite` attributes. Protect state-changing requests against CSRF as appropriate for the chosen session design.
- **Reasoning:** Salary data is sensitive, and the application should restrict access to authenticated HR users without introducing an unnecessary external identity-provider dependency.
- **Trade-off:** This is a simple single-application authentication approach, not enterprise SSO. Production deployment still requires secure secret management, HTTPS, and a deliberate user/account provisioning strategy.

### D-13 — Indexes based on query patterns

- **Decision:** Add indexes for frequently used identity lookups and filters, including employee ID, email, department, country, and job title where supported by the final schema and queries.
- **Decision:** Consider salary-related indexes only when the actual salary-range query patterns justify them.
- **Reasoning:** Indexes can improve common lookups and filters, but each index adds storage and write overhead.
- **Trade-off:** Do not index every column automatically. Confirm the final set against the implemented queries and representative tests.

### D-14 — Unit and integration tests

- **Decision:** Include both unit tests and integration tests.
- **Unit-test focus:** Salary validation, calculation logic, filtering rules, and other isolated business rules.
- **Integration-test focus:** API behavior with the database, employee creation, initial history creation, salary updates, transaction rollback, authentication, and important validation/error paths.
- **Reasoning:** Unit tests alone do not prove that API and database operations work together correctly.
- **Quality bar:** Tests should be fast, deterministic, readable, and independent of production data or external services.

### D-15 — Clean, professional HR portal UI

- **Decision:** Use a clean, sleek, professional enterprise HR interface with consistent design rules.
- **Proposed navigation:** Separate Employee Management and Analytics views, with shared visual styling and predictable navigation.
- **Reasoning:** Employee operations and analytics are equally important, and the UI should make both easy to find without looking like a basic demo project.
- **Trade-off:** Prioritize clarity, accessibility, and consistency over decorative animation or unnecessary visual complexity.

### D-16 — Antigravity as the coding agent

- **Decision:** Use Antigravity to implement the application after planning and documentation are approved.
- **Working method:** Discuss and finalize requirements, architecture, and trade-offs first; then provide the coding agent with a consolidated instruction package.
- **Reasoning:** This keeps architectural ownership and decisions with the developer rather than allowing the agent to invent scope while coding.
- **Expected workflow:** Small implementation steps, reviewable changes, tests, and incremental Git commits.

---

## 3. Assessment Requirements That Must Not Be Lost

The assessment brief explicitly requires:

1. A one-page requirements document created before implementation.
2. End-to-end software with a backend and UI.
3. A relational database of choice; SQLite is explicitly given as an example.
4. A seed script containing 10,000 employees.
5. Fully functional deployed software.
6. A video demo.
7. Meaningful unit tests and readable, maintainable code.
8. Incremental Git commits that show how the solution evolved.
9. Supporting artifacts such as planning notes, architecture diagrams, AI prompts, trade-off explanations, and performance considerations.
10. Submission of the Git repository link by replying to the assessment email.

**Important deployment note:** Although local execution is useful during development, the brief explicitly asks for deployed software. A local-only run should not be treated as satisfying that requirement. The deployment approach must therefore include a practical deployment target and verification, even though Docker is not planned as a requirement.

---

## 4. Cross-Cutting Engineering Principles

- **Correctness before complexity:** Keep business rules explicit and testable.
- **One source of truth:** The employee record holds current salary; the history table records changes.
- **Atomic updates:** Employee creation and salary changes must preserve consistency between current data and history.
- **Server-side validation:** Do not rely only on frontend validation.
- **Consistent filtering:** Employee listings and analytics must apply the same filter definitions.
- **Reproducible seed data:** The seed process should generate 10,000 employees deterministically and avoid duplicates on repeated runs.
- **Incremental delivery:** Make small, meaningful Git commits and run relevant tests as the implementation progresses.
- **Document decisions honestly:** Record the real prompts, changes, tests, and trade-offs used during implementation rather than fabricating an AI-workflow history.

---

## 5. Items to Resolve During Detailed Design

The high-level decisions above are agreed, but the following implementation details still need to be specified in the relevant design documents:

- Exact employee and salary-history columns, data types, and constraints.
- Salary precision and whether zero salary is allowed.
- Whether an effective date can be in the past or future, and how historical corrections are handled.
- The exact meaning of department-wise salary breakdowns and the denominator used for each metric.
- Pagination defaults, maximum page size, and sorting behavior.
- Session expiry, logout behavior, CSRF protection, and initial HR account provisioning.
- Exact index definitions based on the final API query patterns.
- Hosting target, persistent SQLite storage, HTTPS, and deployment configuration.
- Final frontend component library and design tokens.

These are detailed-design questions, not permission to add new product features silently. They should be resolved and documented before the coding agent makes implementation assumptions.

---

## 6. Decision Change Policy

If implementation reveals a conflict, missing requirement, or material technical issue:

1. The coding agent must describe the issue and its impact.
2. The proposed change and alternatives must be documented.
3. The developer must approve the change before it alters the agreed scope or architecture.
4. The relevant decision log and design documents must be updated.
5. Tests and acceptance criteria must be updated where necessary.

This process keeps the implementation aligned with the assessment brief and makes the reasoning explainable during the technical discussion.
