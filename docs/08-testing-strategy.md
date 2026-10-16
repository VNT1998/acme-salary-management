# ACME Salary Management System
## Testing Strategy

**Document ID:** 08  
**Goal:** Demonstrate correctness and maintainability through fast, deterministic tests.

## 1. Testing Principles

- Test behavior and business rules, not private implementation details.
- Use isolated temporary SQLite databases for tests.
- Do not depend on live services, real employee data, or network access.
- Use deterministic fixtures and explicit expected results.
- Keep unit tests fast; use integration tests for database/API interactions.
- Test failure paths as deliberately as success paths.

## 2. Unit Tests

### Validation and money
- Accept valid USD amounts with zero, one, or two decimal places.
- Reject negative, malformed, non-finite, or more-than-two-decimal values.
- Verify conversion between decimal USD and integer cents.
- Verify formatting and rounding rules.

### Employee rules
- Required fields cannot be blank.
- Email normalization is consistent.
- Employee-code generation is unique.
- Duplicate email is rejected.
- Unsupported salary fields cannot be changed through employee-detail updates.

### Salary history rules
- Initial history uses a null previous salary and the initial current salary as the new salary.
- Later history records capture the exact previous and new salary.
- Existing history records are not overwritten during normal updates.
- Effective dates are parsed and validated according to the documented policy.

### Analytics
Use small known datasets to verify:
- Average.
- Median for odd and even record counts.
- Minimum and maximum.
- Department grouping and counts.
- Filter combinations.
- Empty result behavior.
- Two-decimal output rounding.

## 3. Integration Tests

Run the API against a temporary SQLite database.

### Authentication
- Valid login creates a session.
- Invalid login returns a generic authentication error.
- Unauthenticated API requests are rejected.
- Logout invalidates the session.
- Expired sessions are rejected.
- CSRF protections are enforced for relevant state-changing requests.

### Employee management
- Create an employee and verify both employee and initial history records exist.
- Duplicate email returns a conflict response.
- Read employee detail.
- Search and filter employees.
- Pagination returns stable pages and correct total counts.
- Edit non-salary fields.
- Attempt to change salary through the employee PATCH endpoint and verify it is rejected or ignored according to the explicit contract (preferred behavior: reject unsupported fields).

### Salary updates
- Successful update changes current salary and appends history.
- Missing employee returns not found.
- Invalid salary/date is rejected.
- Simulate a history insert failure and verify current salary rolls back.
- Verify concurrent/stale update protection if implemented.
- Verify salary history ordering and initial entry behavior.

### Analytics API
- Verify response metrics against a known fixture.
- Verify department, country, job title, and salary-range filters.
- Verify filters are applied consistently to department breakdowns.
- Verify empty results return null metrics and an empty breakdown.

## 4. Frontend Tests

Prioritize high-value user flows:
- Login form validation and error feedback.
- Employee table loading, empty, and error states.
- Search/filter/pagination interactions.
- Employee create/edit form validation.
- Salary update form and success/error handling.
- Analytics filter behavior and empty-result presentation.

Use component tests for predictable behavior and a small number of end-to-end checks if the chosen toolchain supports them without excessive setup.

## 5. Seed Script Tests

- Fresh seed creates exactly 10,000 employees.
- Every seeded employee has an initial history record.
- Employee codes and emails are unique.
- A repeated run does not create duplicates.
- Deterministic generation produces the same logical data from the same configuration.
- A reset option, if included, refuses to run against a non-test/non-development database unless an explicit safety confirmation is provided.

## 6. Quality Gates

Before merging or marking a milestone complete:
- Run backend unit and integration tests.
- Run frontend tests and build/type checks.
- Run lint/format checks configured by the project.
- Record actual command output and failures; do not report a passing result if checks were skipped.
- Fix failures or document why a known limitation is accepted.

## 7. Performance Checks

With 10,000 seeded employees:
- Verify server-side pagination does not return all records.
- Exercise common filter combinations.
- Inspect SQL query plans for high-traffic queries.
- Check analytics correctness and acceptable response time on the target environment.
- Add indexes only where justified by query plans and usage.

Performance testing should remain proportionate to the assessment; do not invent enterprise-scale load claims without measurements.
