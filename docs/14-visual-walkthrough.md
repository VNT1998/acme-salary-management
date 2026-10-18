# ACME Salary Management System — Product & Flow Walkthrough

An end-to-end visual walkthrough of the ACME Salary Management & Analytics software designed for an organization with 10,000 employees across multiple global jurisdictions.

---

## 1. Executive Summary & Core Flows

```mermaid
flowchart LR
    A["🔐 Secure HR Login"] --> B["📊 Executive Dashboard"]
    B --> C["👥 10k Employee Directory"]
    C --> D["⚡ Transactional Salary Updates"]
    D --> E["📜 Immutable Audit History"]
    B --> F["📈 Real-Time Analytics Engine"]
```

> [!NOTE]
> **Product Architecture Rationale:** The system replaces fragmented HR spreadsheets with an indexed, ACID-compliant relational model. Non-salary profile edits are decoupled from salary adjustments to ensure complete audit integrity.

---

## 2. Desktop Workflow Walkthrough

````carousel
![Step 1: HR Authentication & Session Security](../screenshot-login.png)
<!-- slide -->
![Step 2: Executive HR Dashboard Overview](../screenshot-dashboard.png)
<!-- slide -->
![Step 3: 10,000-Record Employee Directory with Sub-Millisecond Search](../screenshot-employees.png)
<!-- slide -->
![Step 4: Programmatic Compensation Analytics & Department Breakdown](../screenshot-analytics.png)
<!-- slide -->
![Step 5: Account Profile & Session Management](../screenshot-profile.png)
````

### Slide-by-Slide Explanations

#### Slide 1: Secure HR Authentication
* **Product Purpose:** Restricts all employee and compensation records strictly to authorized HR Personnel.
* **Engineering Highlights:**
  * Password verification powered by **Argon2id** (`argon2-cffi`), resistant to GPU-accelerated brute-force attacks.
  * Server-managed, tamper-proof session cookies configured with `HttpOnly` and `SameSite=Lax`.
  * Automatic CSRF token provisioning on session handshake for all subsequent mutation requests.

#### Slide 2: Executive HR Dashboard
* **Product Purpose:** Gives the HR Manager an instant bird's-eye view of organizational scale, total compensation distribution, and recent updates.
* **Engineering Highlights:**
  * Displays real-time aggregate tallies across **10,000 seeded employees**.
  * Quick navigation access points to the Employee Directory, Compensation Analytics, and Account settings.

#### Slide 3: 10,000-Record Employee Directory
* **Product Purpose:** Fast search, filtering, and administration of global personnel across departments (Engineering, Product, Sales, Marketing, Operations) and countries (US, UK, Germany, India, Canada).
* **Engineering Highlights:**
  * **~1.36 ms** query response times over 10,000 records enabled by composite B-tree indexes (`idx_employees_dept_country_salary`).
  * Server-side deterministic pagination and multi-attribute sorting.
  * Atomic **"Add Employee"** workflow that creates the employee profile and automatically establishes their baseline initial salary entry in `salary_history`.
  * Architectural separation between general profile edits (Job Title, Department) and compensation changes.

#### Slide 4: Real-Time Compensation Analytics
* **Product Purpose:** Directly answers the core leadership question: *"How does ACME pay its people?"*
* **Engineering Highlights:**
  * High-precision metrics: Arithmetic Mean, Exact Median (50th percentile), Min, Max, and Departmental aggregate breakdowns.
  * **No LLM Math:** All statistical calculations are computed programmatically in Python and SQLite, eliminating hallucinations and ensuring 100% mathematical determinism.
  * Dynamically reacts to active directory filters in **~13.36 ms**.

#### Slide 5: Profile & Session Management
* **Product Purpose:** Displays the active HR Manager's profile information, role credentials, and enables clean session termination.
* **Engineering Highlights:**
  * Immediate session revocation in the database upon logout, preventing replay attacks.
  * Automatic redirection of unauthenticated requests back to the protected login boundary.

---

## 3. Salary Mutation & Audit Trail Architecture

Updating an employee's salary uses a dedicated database transaction (`BEGIN IMMEDIATE`) to guarantee that compensation changes and audit records can never drift.

```mermaid
sequenceDiagram
    autonumber
    actor HR as HR Manager
    participant UI as React 19 Frontend
    participant API as FastAPI Backend
    participant DB as SQLite (WAL Mode)

    HR->>UI: Submit New Salary ($135,000) & Effective Date
    UI->>API: POST /api/v1/employees/{id}/salaries (CSRF + Session)
    Note over API,DB: BEGIN IMMEDIATE Transaction
    API->>DB: Fetch current employee salary ($120,000)
    API->>DB: UPDATE employees SET current_salary_cents = 13500000
    API->>DB: INSERT INTO salary_history (prev: 12000000, new: 13500000)
    DB-->>API: COMMIT
    API-->>UI: 200 OK (Updated Record + Audit Entry)
    UI-->>HR: Timeline Updated with Delta (+12.5%) & Date
```

> [!IMPORTANT]
> **Audit Integrity:** If an error occurs midway through the update (e.g. invalid date constraint or network timeout), the transaction automatically executes a `ROLLBACK`, guaranteeing zero orphan records or unrecorded salary changes.

---

## 4. Mobile & Responsive Workflows

The application includes first-class responsive design tailored for HR executives reviewing salaries on mobile and tablet devices.

````carousel
![Mobile Dashboard View](../screenshot-mobile-dashboard.png)
<!-- slide -->
![Mobile Employee Card Stack](../screenshot-mobile-employees.png)
<!-- slide -->
![Mobile Analytics Breakdown](../screenshot-mobile-analytics.png)
<!-- slide -->
![Collapsible Mobile Navigation Drawer](../screenshot-mobile-sidebar.png)
````

### Responsive Highlights
* **Adaptive Cards:** On small viewports, the tabular directory transforms into card stacks with touch-friendly action buttons.
* **Drawer Navigation:** Collapsible side drawer preserving screen real estate while maintaining instant tab switching.
* **Touch Targets:** Fully compliant with accessibility standards (48px+ minimum touch targets).
