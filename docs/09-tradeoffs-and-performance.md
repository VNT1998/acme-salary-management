# ACME Salary Management System
## Trade-offs and Performance Considerations

**Document ID:** 09

This document records the main trade-offs behind the proposed design and the limitations that should be acknowledged in the technical discussion.

## 1. SQLite vs. PostgreSQL

**Choice:** SQLite.

**Why:** The developer prefers a minimal setup and does not want to run Docker or manage a separate database server. SQLite is relational, supports transactions and constraints, and is adequate for a 10,000-employee assessment dataset.

**Trade-off:** SQLite has more limited concurrent-write throughput and operational features than PostgreSQL. A production deployment with many simultaneous HR users or high write volume may justify PostgreSQL.

**Mitigation:** Keep persistence logic behind clear boundaries, use transactions correctly, test concurrency behavior, and deploy on storage that persists the SQLite file.

## 2. One application vs. microservices

**Choice:** A single FastAPI application with separated modules/services.

**Why:** The scope is one internal application. Microservices would add deployment, network, observability, and consistency complexity without a demonstrated need.

**Trade-off:** Modules scale as one deployable unit. If future needs materially diverge, boundaries can be revisited based on evidence.

## 3. USD-only vs. multi-currency

**Choice:** USD-only.

**Why:** ACME is fictional and the assessment does not define a currency policy. Exchange-rate conversion adds policy, data freshness, and correctness concerns.

**Trade-off:** Local-currency salary records and converted consolidated reports are unsupported. This limitation must be visible in requirements and demo documentation.

## 4. Programmatic analytics vs. LLM

**Choice:** Deterministic programmatic analytics.

**Why:** Average, median, minimum, maximum, and department breakdowns are well-defined calculations. They are easier to validate and test than LLM-generated answers. The assessment requires use of AI tools during development, not necessarily an LLM embedded in the product.

**Trade-off:** HR cannot ask arbitrary free-text questions in the initial version.

## 5. Current salary plus append-only history

**Choice:** Keep current salary on the employee record and append salary events to a separate history table.

**Why:** Current salary reads remain straightforward while historical changes are traceable.

**Trade-off:** The two writes must remain atomic. More advanced effective-dated compensation modeling is intentionally excluded.

## 6. Integer cents for money

**Choice:** Store USD values as integer cents; expose decimal strings in API responses.

**Why:** Binary floating-point can introduce rounding errors. Integer cents provide exact representation for two-decimal USD amounts.

**Trade-off:** Conversions at API and UI boundaries must be consistent. The application must define rounding and reject unsupported precision.

## 7. Server-side filtering and pagination

**Choice:** Filter and paginate in the backend/database.

**Why:** The browser should not download all 10,000 employee rows just to show one page. Server-side filtering keeps API behavior consistent and limits payload size.

**Trade-off:** Query construction and filter validation require care. Sorting must use allowlisted fields and stable ordering.

## 8. Indexing

**Choice:** Index unique identity fields and common filter columns, then verify query plans.

**Why:** Indexes can accelerate lookup and filtering.

**Trade-off:** Indexes use storage and make writes slightly more expensive. Over-indexing without query evidence is unnecessary.

## 9. Authentication and session cookies

**Choice:** Simple email/password login with server-managed sessions in secure cookies.

**Why:** It avoids an external identity-provider dependency while restricting access to salary data.

**Trade-off:** The application must handle password hashing, session expiry, logout, CSRF, HTTPS, and initial account provisioning correctly. This is not enterprise SSO.

## 10. No permanent deletion

**Choice:** Do not implement employee deletion in the initial version.

**Why:** It avoids accidental loss of employee records and salary history while keeping scope focused.

**Trade-off:** There is no employee deactivation/archive workflow in the first version. Do not imply that soft deletion exists unless it is implemented and documented.

## 11. Deployment without Docker

**Choice:** Do not require Docker for local development.

**Why:** The developer prefers minimal setup.

**Trade-off:** Deployment still requires a host that can run the backend and frontend, use HTTPS, configure secrets, and persist SQLite storage. Local-only execution does not satisfy the assessment's deployed-software requirement.

## 12. Performance plan for 10,000 employees

Start with:
- Server-side pagination.
- Database-level filters where practical.
- Appropriate indexes based on query patterns.
- Efficient count and analytics queries.
- Deterministic analytics calculations.
- Representative tests with the full seeded dataset.

Do not add caching, queues, distributed services, or advanced infrastructure unless measurements show a need.

## 13. Measurements to Record

During implementation, record actual results for:
- Seed duration and record count.
- Employee-list response time with common filters.
- Analytics response time for the full dataset and filtered subsets.
- Test suite runtime.
- Query plans for common search/filter queries.

Do not claim performance targets were met unless measured on a documented environment. Performance numbers from a developer laptop should not be presented as production guarantees.
