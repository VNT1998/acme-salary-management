# ACME Salary Management System
## Security and Data Integrity Notes

**Document ID:** 11  
**Scope:** Practical safeguards for an assessment application handling sensitive salary information. This document is not a claim of formal security certification.

## 1. Authentication and Access

- Require authentication for all employee, salary, history, and analytics endpoints.
- Use email/password login with a proven password-hashing library and appropriate parameters.
- Never store or log plaintext passwords.
- Use a secure account-provisioning process; do not hardcode a production HR password.
- Return generic invalid-login errors to reduce account enumeration.
- Apply rate limiting or sensible login-attempt controls where supported by the deployment environment.
- Invalidate server-side sessions on logout and expiry.
- Protect against session fixation by rotating session identifiers after successful login.

## 2. Cookie and Request Security

- Set session cookies `HttpOnly`.
- Set `Secure` in HTTPS deployments.
- Set an appropriate `SameSite` policy.
- Implement CSRF protection for state-changing requests when using cookie-based authentication.
- Use HTTPS for deployed access.
- Do not put session identifiers in URLs or local storage.
- Restrict CORS to the intended frontend origin if frontend and backend use separate origins. Prefer same-origin deployment where practical.

## 3. Input Validation

Validate all inputs on the backend:
- Required text fields are non-empty after trimming.
- Email addresses are normalized consistently.
- Employee IDs and emails remain unique.
- Salary values are finite, non-negative, and have at most two decimal places.
- Effective dates are valid ISO dates.
- Pagination values are bounded.
- Sorting fields are allowlisted.
- Filter values are treated as data, not SQL fragments.

Use parameterized SQL. Do not concatenate user-provided values into SQL statements.

## 4. Salary Data Integrity

- Store USD values as integer cents.
- Keep current salary in the employee record.
- Append a history record for every salary update.
- Create the initial history record at employee creation.
- Update current salary and insert history in one transaction.
- Roll back both operations if either fails.
- Protect against stale or concurrent updates.
- Do not allow salary changes through the generic employee-detail update endpoint.
- Never silently edit or delete history records as part of an ordinary update.

## 5. Database and Session Safety

- Enable SQLite foreign-key enforcement on every database connection.
- Keep the database file outside the source-controlled project artifacts or explicitly ignored by Git.
- Use a persistent path in deployment and verify data survives restart/redeploy.
- Restrict filesystem permissions for the database and backups.
- Clean up expired sessions safely.
- Avoid exposing internal exception text, SQL, or database paths to clients.

## 6. Secrets and Configuration

- Read production secrets from environment configuration or the hosting platform's secret store.
- Commit only a `.env.example` with placeholder values.
- Ignore `.env`, populated databases, logs, generated secrets, and build artifacts.
- Fail clearly when required production configuration is missing.
- Never use a default production password or secret.
- Document the HR bootstrap process without including real credentials.

## 7. Frontend Considerations

- Treat frontend validation as usability support, not a security boundary.
- Display safe, useful error messages.
- Do not expose password hashes, session IDs, or internal database identifiers unnecessarily.
- Avoid unsafe HTML rendering.
- Ensure core login and salary workflows are keyboard accessible and labels are associated with inputs.

## 8. Logging and Privacy

- Log operational events and failures without logging passwords, session tokens, or unnecessary salary details.
- Avoid collecting personal data beyond the fields required by the assessment.
- Use synthetic seed data only; do not populate the demo with real employee information.
- Define a practical approach to log retention for the deployment environment.

## 9. Known Limitations

The initial version uses a single HR user model and SQLite. It does not implement enterprise SSO, complex role-based access, multi-tenant isolation, or a formal compliance program. These limitations must not be misrepresented in the README or interview.
