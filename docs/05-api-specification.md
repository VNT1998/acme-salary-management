# ACME Salary Management System
## API Specification

**Document ID:** 05  
**Base path:** `/api/v1`  
**Format:** JSON over HTTP  
**Authentication:** Server-managed session cookie

This specification describes the initial API contract. Endpoint names may be adjusted during implementation only if the frontend, tests, and documentation are updated together.

## 1. General Conventions

- All employee and salary endpoints require an authenticated HR session.
- Use JSON request and response bodies unless otherwise stated.
- Validate input on the server.
- Return consistent error responses.
- Salary API amounts are decimal USD values with at most two fractional digits; the backend converts to integer cents for storage.
- Dates use ISO format `YYYY-MM-DD`; timestamps use UTC ISO 8601.
- List endpoints are paginated on the server.
- The API does not accept arbitrary SQL, dynamic field names, or unbounded page sizes.

### Standard error shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "details": {
      "email": "A valid email address is required."
    }
  }
}
```

`details` may be omitted when not applicable. Do not return stack traces, SQL statements, password hashes, session tokens, or secrets.

## 2. Authentication

### `POST /api/v1/auth/login`

Request:
```json
{
  "email": "hr@example.test",
  "password": "provided-by-local-setup"
}
```

Success: `200 OK`, sets an `HttpOnly` session cookie with appropriate `Secure` and `SameSite` settings.

```json
{
  "user": {
    "id": 1,
    "email": "hr@example.test"
  }
}
```

Invalid credentials: `401 Unauthorized` with a generic message that does not reveal whether the email exists.

### `GET /api/v1/auth/me`

Returns the current authenticated HR user, or `401 Unauthorized`.

### `POST /api/v1/auth/logout`

Invalidates the server-side session and clears the cookie. Return `204 No Content` or a documented success response.

State-changing cookie-authenticated requests must use the CSRF protection selected in the security design.

## 3. Employee Endpoints

### `GET /api/v1/employees`

Supported query parameters:

| Parameter | Meaning |
|---|---|
| `page` | 1-based page number; default `1` |
| `page_size` | Items per page; default `25`, maximum `100` |
| `search` | Optional search over employee code, name, and email |
| `department` | Exact department filter |
| `country` | Exact country filter |
| `job_title` | Exact job-title filter |
| `min_salary` | Minimum USD salary, inclusive |
| `max_salary` | Maximum USD salary, inclusive |
| `sort_by` | Allowlisted sort field |
| `sort_order` | `asc` or `desc`; default documented by implementation |

If both salary bounds are provided, `min_salary` must not exceed `max_salary`. Filtering and pagination happen on the server.

Success response:
```json
{
  "items": [
    {
      "id": 1,
      "employee_code": "EMP-1001",
      "full_name": "Rahul Sharma",
      "email": "rahul.sharma@example.test",
      "department": "Engineering",
      "job_title": "AI Engineer",
      "country": "United States",
      "current_salary": "120000.00",
      "currency": "USD"
    }
  ],
  "page": 1,
  "page_size": 25,
  "total_items": 10000,
  "total_pages": 400
}
```

The example data is illustrative. Do not hardcode sample values into production responses.

### `POST /api/v1/employees`

Creates an employee and the initial salary-history record in one transaction.

Request:
```json
{
  "full_name": "Rahul Sharma",
  "email": "rahul.sharma@example.test",
  "department": "Engineering",
  "job_title": "AI Engineer",
  "country": "United States",
  "initial_salary": "120000.00"
}
```

Success: `201 Created`, returns the created employee including generated `employee_code`.

Expected errors include:
- `400 Bad Request` for malformed or invalid values.
- `409 Conflict` for duplicate email or employee-code conflicts.
- `401 Unauthorized` if not authenticated.

### `GET /api/v1/employees/{employee_id}`

Returns employee details by internal numeric ID. Return `404 Not Found` when absent.

### `PATCH /api/v1/employees/{employee_id}`

Updates non-salary employee details only. Supported fields: `full_name`, `email`, `department`, `job_title`, and `country`. Salary must not be accepted by this endpoint.

Request example:
```json
{
  "department": "Applied AI",
  "job_title": "Senior AI Engineer"
}
```

Success: `200 OK`. Duplicate email: `409 Conflict`. Missing employee: `404 Not Found`.

## 4. Salary Endpoints

### `POST /api/v1/employees/{employee_id}/salary-updates`

Request:
```json
{
  "new_salary": "135000.00",
  "effective_date": "2026-10-17"
}
```

The backend fetches the current salary; clients must not submit the previous salary. Current salary and history are updated atomically.

Success: `200 OK`:
```json
{
  "employee_id": 1,
  "previous_salary": "120000.00",
  "current_salary": "135000.00",
  "currency": "USD",
  "effective_date": "2026-10-17",
  "recorded_at": "2026-10-17T00:00:00Z"
}
```

The timestamp is illustrative. The server must return the actual recorded timestamp.

Expected errors:
- `400 Bad Request`: invalid salary or date.
- `401 Unauthorized`: missing/invalid session.
- `404 Not Found`: employee does not exist.
- `409 Conflict`: stale/concurrent update conflict, if detected.

### `GET /api/v1/employees/{employee_id}/salary-history`

Returns salary-history records for one employee in a documented order, preferably effective date descending with a deterministic tie-breaker. Each item includes the previous salary (nullable for the initial record), new salary, effective date, and recorded timestamp.

## 5. Analytics Endpoint

### `GET /api/v1/analytics/salaries`

Accepts the same applicable filters as the employee list: `department`, `country`, `job_title`, `min_salary`, and `max_salary`.

Response:
```json
{
  "currency": "USD",
  "employee_count": 42,
  "average_salary": "118450.25",
  "median_salary": "117500.00",
  "minimum_salary": "72000.00",
  "maximum_salary": "180000.00",
  "department_breakdown": [
    {
      "department": "Engineering",
      "employee_count": 20,
      "average_salary": "125000.00",
      "median_salary": "123000.00",
      "minimum_salary": "90000.00",
      "maximum_salary": "180000.00"
    }
  ]
}
```

The figures are illustrative. For an even number of salaries, median is the arithmetic mean of the two middle values, using exact decimal/integer-cent arithmetic. Define and test rounding to two decimal places. An empty filtered result should return `employee_count: 0`, null metric values, and an empty breakdown rather than fabricated zeros.

Department breakdowns must use the same selected filters. Document whether the department grouping is computed after all filters are applied; the intended behavior is yes.

## 6. Health Endpoint

### `GET /api/v1/health`

Returns a minimal health status suitable for deployment checks. It must not expose environment variables, database credentials, or internal diagnostics.

## 7. API Contract Rules

- Use allowlisted sort fields and stable ordering.
- Never expose password hashes or session identifiers.
- Return `401` for unauthenticated requests and a consistent authorization error for authenticated users without permission, if roles are added later.
- Use transactions for employee creation and salary updates.
- Add API tests for success cases, validation failures, conflicts, not-found responses, authentication, and rollback behavior.
- Keep OpenAPI documentation generated by FastAPI aligned with this contract.
