# ACME Salary Management System
## AI Coding Agent Instructions and Prompt Log

**Document ID:** 10  
**Agent:** Antigravity  
**Purpose:** Provide one controlled implementation brief and preserve evidence of intentional AI use.

## 1. Master Implementation Prompt

Use the following as the main instruction to Antigravity after the planning documents have been reviewed.

---

You are the implementation agent for the ACME Salary Management System, a take-home assessment for Incubyte.

Before writing code:
1. Inspect the repository and read every approved document under `docs/`.
2. Read the original assessment constraints recorded in `01-requirements.md` and `02-discussion-and-decision-log.md`.
3. Summarize the architecture, requirements, milestones, and any conflicts or ambiguities.
4. Do not silently add product features or change approved decisions. Ask for clarification when a material ambiguity affects scope, security, or data integrity.

Product scope:
- Internal application for one fictional organization, ACME.
- Primary user: HR Manager.
- 10,000 seeded employees.
- USD-only salaries.
- Employee create, view, search, filter, pagination, and non-salary edit.
- Dedicated salary update workflow with effective date and append-only salary history.
- Initial salary history row created with each employee.
- Analytics: average, median, minimum, maximum, and department breakdown.
- Filters: department, country, job title, and salary range.
- Analytics are programmatic; do not add an in-product LLM or chatbot.
- No permanent employee deletion in the initial version.
- Simple email/password login with server-managed cookie sessions.
- SQLite; do not require Docker for local development.
- Professional, clean enterprise HR UI.
- Unit and integration tests.
- Deployment and video demo are required by the assessment.

Engineering constraints:
- Backend: Python and FastAPI.
- Python environment and dependency management: `uv`.
- Frontend: React and TypeScript.
- Database: SQLite with foreign-key enforcement, constraints, and transactions.
- Store USD money as integer cents; expose decimal amounts consistently at the API/UI boundary.
- Keep route handlers thin and separate business logic from persistence.
- Validate every request on the server and use parameterized SQL.
- Never store plaintext passwords or commit secrets.
- Protect cookie-authenticated state-changing requests against CSRF.
- Use server-side filtering and pagination.
- Make seed data deterministic and reruns safe.
- Keep the SQLite database in a configurable persistent location, not in source control.
- Do not introduce microservices, Kubernetes, Docker, LLM features, or other unrequested complexity.

Implementation workflow:
1. Work milestone by milestone according to `07-implementation-plan.md`.
2. Make small, meaningful Git commits. Do not create misleading commits or claim work that was not done.
3. After each milestone, run relevant tests and quality checks.
4. At each checkpoint, report files changed, design decisions implemented, actual commands and test results, known issues, and the proposed next step.
5. If tests fail, diagnose and fix them; do not claim success without evidence.
6. Keep OpenAPI contracts and documentation synchronized with the implementation.
7. Before deployment, verify persistent database storage, HTTPS, environment configuration, account provisioning, and the real deployed flows.
8. Record the actual prompts and meaningful AI-assisted changes in `docs/ai-prompts/` or the prompt log.

Required end state:
- Working frontend and backend.
- Database schema/migrations.
- Deterministic seed script for 10,000 employees.
- Authentication and protected endpoints.
- Employee management and transactional salary history.
- Filterable analytics.
- Unit and integration tests.
- Updated README and all required documentation.
- Deployed application and a recorded video demo.
- Incremental Git history showing actual development.

Do not fabricate deployment URLs, test results, performance results, screenshots, or video recordings. Flag anything that cannot be completed in the available environment.

---

## 2. Recommended Task Prompt Pattern

For each milestone, ask the agent to:
1. State its understanding of the milestone and relevant acceptance criteria.
2. Identify files it plans to create/change.
3. Implement only that milestone.
4. Run the relevant checks.
5. Summarize the actual outcome and any remaining issues.
6. Stop before proceeding to the next milestone until reviewed, unless the developer explicitly authorizes a larger batch.

Example:

> Implement Milestone M1 from `07-implementation-plan.md` only. Follow the database schema and architecture documents. First summarize your plan and the files you expect to change. Then implement it, run the relevant tests, and report the exact commands and results. Do not start M2 until I approve the checkpoint.

## 3. Review Prompts

### Code review
> Review the current diff against the approved requirements, architecture, API specification, and security notes. Identify correctness bugs, missing validation, data-integrity risks, security issues, unnecessary abstractions, and untested edge cases. Do not rewrite the whole project. Report findings by severity with file references and proposed fixes.

### Test-gap review
> Compare the implemented behavior with `08-testing-strategy.md`. List missing unit and integration tests, especially transaction rollback, authentication, filters, pagination, salary precision, duplicate email, and empty analytics results. Add only the highest-value missing tests, run them, and report actual results.

### Performance review
> Review the actual queries used by employee search, filtering, pagination, salary history, and analytics. Use query plans or measurements where available. Recommend indexes only when justified by evidence. Do not invent benchmark numbers.

### Security review
> Review authentication, session handling, cookie flags, CSRF protection, account provisioning, input validation, error responses, secret handling, and database access. Identify concrete risks and propose fixes. Do not claim a security audit or compliance certification.

## 4. Prompt and AI-Workflow Log

Maintain a log with:
- Date or milestone.
- Tool/agent used.
- Prompt or task summary.
- Files changed.
- Human review performed.
- Tests/checks actually run.
- Issues found and how they were resolved.
- Any accepted AI suggestion that changed an architectural decision.

Record real prompts and actual outcomes as the project progresses. Do not fabricate a retrospective prompt history.

## 5. Human Review Responsibilities

The developer remains responsible for:
- Confirming requirements and trade-offs.
- Reviewing code and generated dependencies.
- Running tests and inspecting failures.
- Verifying salary calculations and transaction behavior.
- Checking security-sensitive code.
- Confirming deployment and demo functionality.
- Being able to explain the final implementation in the interview.
