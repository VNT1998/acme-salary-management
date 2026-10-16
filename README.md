# ACME Salary Management System

A web-based internal HR portal for ACME to manage employee details, conduct transactional salary updates with immutable history, and perform compensation analytics over 10,000 employees. Built for the Incubyte assessment.

## Architecture & Technology Stack

- **Backend:** FastAPI (Python 3.12+), managed with `uv`.
- **Database:** SQLite with strict Foreign Keys, write-ahead logging (WAL), and integer-cents money precision.
- **Frontend:** React + TypeScript + Vite, modern enterprise HR UI.
- **Security:** Argon2 password hashing, HTTP-only SameSite session cookies, CSRF protection, and server-side validation.
- **Seed Data:** Deterministic 10,000 employee records with initial salary history.

## Documentation Index

Comprehensive engineering and product documentation is located in the [`docs/`](./docs) directory:
- [01 - Requirements Document](./docs/01-requirements.md)
- [02 - Discussion and Decision Log](./docs/02-discussion-and-decision-log.md)
- [03 - System Architecture](./docs/03-system-architecture.md)
- [04 - Database Design](./docs/04-database-design.md)
- [05 - API Specification](./docs/05-api-specification.md)
- [06 - Code Structure and Standards](./docs/06-code-structure-and-standards.md)
- [07 - Implementation Plan](./docs/07-implementation-plan.md)
- [08 - Testing Strategy](./docs/08-testing-strategy.md)
- [09 - Trade-offs and Performance](./docs/09-tradeoffs-and-performance.md)
- [10 - AI Agent Instructions](./docs/10-ai-agent-instructions.md)
- [11 - Security and Data Integrity](./docs/11-security-and-data-integrity.md)
- [12 - Deployment and Submission](./docs/12-deployment-and-submission.md)
- [13 - UI/UX Design Guidelines](./docs/13-ui-ux-design-guidelines.md)
- [AI Prompts Log](./docs/ai-prompts/README.md)
