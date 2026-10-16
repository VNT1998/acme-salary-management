# ACME Salary Management System
## Requirements Document

### 1. Problem Statement
ACME is a fictional organization with 10,000 employees across multiple countries. Employee salary information is currently managed using spreadsheets, making it difficult to maintain accurate records, track salary changes, and analyze compensation. The goal is to build a web-based application that simplifies salary management and provides reliable compensation analytics.

### 2. Target User
**Primary user:** HR Manager responsible for managing employee information, updating salaries, and analyzing compensation.

### 3. Project Goals
- Centralize employee and salary information.
- Enable efficient employee management and salary updates.
- Maintain traceable salary history.
- Provide accurate, filterable salary analytics.
- Demonstrate maintainable architecture, sound engineering decisions, and meaningful automated tests.

### 4. Functional Requirements

**Employee Management**
- Create employees with automatically generated unique employee IDs.
- View employee records and search by relevant employee details.
- Filter employees by department, country, job title, and salary range.
- Support pagination for large employee lists.
- Update employee information where applicable.
- Permanent employee deletion is excluded from the initial version.

**Salary Management**
- Store each employee's current salary in USD.
- Allow HR to update an employee's salary with an effective date.
- Automatically capture the previous salary and new salary in a separate salary history table.
- Record the initial salary when an employee is created.
- Ensure salary updates and corresponding history entries succeed or fail together.

**Salary Analytics**
- Display average, median, minimum, and maximum salary.
- Provide department-wise compensation breakdowns.
- Support applicable employee filters in analytics.
- Perform calculations programmatically through backend and database operations, without an LLM.

### 5. Scope and Deliberate Exclusions

The initial version will support USD-denominated salaries only. Multi-currency storage, currency conversion, exchange-rate integration, payroll processing, tax calculations, advanced approval workflows, and LLM-based natural-language queries are excluded to keep the implementation focused and reliable.

The application will include a seed script that generates 10,000 employees for development, testing, and demonstration.

### 6. Non-Functional Requirements
- Maintain readable, modular, and maintainable code.
- Enforce data validation, unique employee IDs and emails, and valid salary values.
- Preserve salary history and transactional data consistency.
- Support efficient filtering, pagination, and analytics for 10,000 employees.
- Include fast, deterministic automated tests for core functionality.
- Provide a deployed application and a video demonstration.

### 7. Acceptance Criteria
- HR can create, view, search, filter, and update employee records.
- Salary changes preserve accurate historical records and effective dates.
- Analytics return correct results for the selected filters.
- The database can be populated with 10,000 employees without duplicate records when the seed process is rerun.
- Core automated tests pass.
- The application is deployed and its functionality can be demonstrated.

### 8. Engineering Approach
The solution will use Python with FastAPI for the backend, React for the frontend, and a relational database. Development will use an AI coding agent, with architecture decisions, trade-offs, incremental commits, and testing documented throughout the process.
