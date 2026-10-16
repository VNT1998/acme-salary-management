# ACME Salary Management System — Planning Package

This folder contains the planning and engineering documents for the Incubyte Salary Management Assessment.

## Documents

1. `docs/01-requirements.md` — one-page product requirements.
2. `docs/02-discussion-and-decision-log.md` — brainstorming decisions, alternatives, reasoning, and trade-offs.
3. `docs/03-system-architecture.md` — architecture, components, and request flows.
4. `docs/04-database-design.md` — tables, constraints, transactions, indexes, and seed data.
5. `docs/05-api-specification.md` — REST API contracts.
6. `docs/06-code-structure-and-standards.md` — repository structure and coding standards.
7. `docs/07-implementation-plan.md` — milestones, acceptance criteria, and commit guidance.
8. `docs/08-testing-strategy.md` — unit, integration, frontend, seed, and performance checks.
9. `docs/09-tradeoffs-and-performance.md` — engineering trade-offs and performance considerations.
10. `docs/10-ai-agent-instructions.md` — Antigravity master prompt and review prompts.
11. `docs/11-security-and-data-integrity.md` — security and integrity safeguards.
12. `docs/12-deployment-and-submission.md` — deployment, demo, and submission checklist.
13. `docs/13-ui-ux-design-guidelines.md` — interface design direction and acceptance criteria.
14. `docs/diagrams/` — standalone architecture and data-flow diagrams.
15. `docs/ai-prompts/` — prompts and AI workflow log template.

## Source of truth

The supplied Incubyte assessment brief is the source of truth for required deliverables. Where the brief is explicit, it takes priority over assumptions in these design documents. The brief requires a one-page requirements document, end-to-end backend and UI, a relational database, a 10,000-employee seed script, deployed software, a video demo, meaningful tests, incremental commits, supporting artifacts, and repository submission by replying to the assessment email.

## Important decisions

- Internal application for fictional ACME and its HR Manager.
- Python/FastAPI backend, React/TypeScript frontend, SQLite database.
- USD-only salary scope.
- System-generated employee IDs.
- Separate current employee salary and append-only salary history.
- Initial history row on employee creation.
- Programmatic analytics; no in-product LLM.
- Simple email/password login with server-managed cookie sessions.
- No permanent employee deletion in the initial scope.
- No Docker requirement for local development, but deployment is required by the assessment.

## Review before implementation

These documents are a proposed implementation specification, not evidence that the software has been built or deployed. Review and approve them before giving the master prompt to Antigravity. Record any approved changes in the decision log and keep all affected documents synchronized.
