# ACME Salary Management System
## Code Structure and Engineering Standards

**Document ID:** 06  
**Purpose:** Define a maintainable project layout and practical coding standards for Antigravity implementation.

## 1. Repository Layout

```text
acme-salary-management/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   └── dependencies.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── sessions.py
│   │   ├── db/
│   │   │   ├── connection.py
│   │   │   └── migrations.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── main.py
│   ├── scripts/
│   │   ├── seed.py
│   │   └── create_hr_user.py
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── pyproject.toml
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── employees/
│   │   │   ├── salary/
│   │   │   └── analytics/
│   │   ├── lib/
│   │   ├── services/
│   │   ├── types/
│   │   └── styles/
│   ├── tests/
│   ├── package.json
│   └── ...
├── docs/
│   ├── 01-requirements.md
│   ├── 02-discussion-and-decision-log.md
│   ├── 03-system-architecture.md
│   └── ...
├── .gitignore
└── README.md
```

This is a guide, not a demand to create empty files or unnecessary abstractions. Keep modules only where they improve separation of concerns.

## 2. Backend Responsibilities

- **Routes:** HTTP concerns only: parse requests, call services, and return responses.
- **Schemas:** Request/response validation and serialization.
- **Services:** Business rules and transaction boundaries.
- **Repositories/data access:** Parameterized SQL and database persistence.
- **Core:** Configuration, password hashing, sessions, and security helpers.
- **Scripts:** Seed data and explicitly invoked account provisioning.
- **Tests:** Unit and integration tests, using isolated temporary databases.

Avoid putting all logic into route handlers. Avoid a repository abstraction that merely adds indirection without helping testing or maintainability.

## 3. Frontend Responsibilities

- **Pages/app:** Top-level navigation and page composition.
- **Features:** Employee management, salary updates, authentication, and analytics.
- **Components:** Reusable UI elements such as tables, filter controls, form fields, metric cards, dialogs, loading indicators, and error states.
- **Services:** Centralized API calls and consistent error handling.
- **Types:** Shared TypeScript request/response definitions.
- **Styles/design tokens:** Consistent colors, typography, spacing, borders, and focus states.

The frontend must not be the authority for salary calculations, authorization, or validation. It can provide immediate feedback, but the backend validates every request.

## 4. Coding Standards

### Python
- Use type hints for public functions and service boundaries.
- Use Pydantic schemas for API input/output.
- Use parameterized database queries; never build SQL by interpolating user input.
- Use `Decimal` or integer cents for money; do not use binary floating point for salary arithmetic.
- Use explicit transaction boundaries and rollback behavior.
- Keep configuration in environment variables with safe defaults only for non-secret development settings.
- Use `uv` for Python dependency and environment management.
- Add concise comments for non-obvious reasoning, not comments that merely restate code.

### TypeScript / React
- Use TypeScript strict mode where practical.
- Keep components focused and avoid large monolithic page components.
- Use controlled forms with clear validation and accessible labels.
- Represent loading, empty, success, and error states.
- Keep API calls out of deeply nested presentation components.
- Avoid unsafe HTML injection and never store session tokens in local storage when cookie-based sessions are used.

### General
- Use consistent naming and formatting.
- Keep functions small enough to reason about.
- Prefer explicit business rules over clever abstractions.
- Do not add dependencies without a clear reason.
- Keep generated data, SQLite database files, environment files, credentials, and build artifacts out of Git.
- Update documentation when a contract or approved decision changes.

## 5. Quality Gates

Before a milestone is considered complete:
1. Relevant automated tests pass.
2. Lint/format/type checks pass where configured.
3. No credentials or populated database files are committed.
4. API and UI behavior match the documented contracts.
5. The code and documentation are committed in a small, meaningful Git commit.
