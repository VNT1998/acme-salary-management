# ACME Salary Management System
## Deployment and Submission Checklist

**Document ID:** 12  
**Important:** Incubyte explicitly requires deployed software and a video demo. Local execution alone is not the final deliverable.

## 1. Local Setup

- [ ] Document supported Python and Node.js versions.
- [ ] Install backend dependencies using `uv`.
- [ ] Install frontend dependencies using the selected Node package manager.
- [ ] Provide `.env.example` with placeholders only.
- [ ] Document the configurable SQLite database path.
- [ ] Provide a command to initialize schema/migrations.
- [ ] Provide a safe command to create/bootstrap the HR account.
- [ ] Document how to seed 10,000 employees.
- [ ] Document backend and frontend start commands.
- [ ] Verify a clean setup from the README instructions.

## 2. Seed and Data Verification

- [ ] Fresh seed creates exactly 10,000 employees.
- [ ] Each seeded employee has one initial salary-history entry.
- [ ] Employee IDs and emails are unique.
- [ ] Rerunning the seed script does not create duplicates.
- [ ] Seed script behavior is documented.
- [ ] Database and generated data files are excluded from Git.

## 3. Deployment Readiness

Choose a hosting target that supports:
- Python/FastAPI runtime.
- React frontend hosting or static-file delivery.
- HTTPS.
- Environment configuration and secrets.
- Persistent storage for the SQLite database file.
- Restart behavior that does not erase application data.

Before choosing a host, confirm these capabilities from current provider documentation. Do not assume an ephemeral filesystem will preserve SQLite data.

## 4. Production Configuration

- [ ] Configure secrets through the host's secret management/environment configuration.
- [ ] Configure a secure session secret or equivalent key.
- [ ] Configure allowed origins and cookie settings.
- [ ] Configure HTTPS and secure cookies.
- [ ] Create the initial HR account through the documented provisioning process.
- [ ] Ensure no default or test credentials remain enabled in the deployed instance.
- [ ] Configure the persistent database location and appropriate filesystem permissions.
- [ ] Ensure the health endpoint does not expose sensitive information.

## 5. Deployed Verification

- [ ] Application URL loads over HTTPS.
- [ ] Login succeeds with the provisioned HR account.
- [ ] Invalid credentials are rejected.
- [ ] Logout invalidates the session.
- [ ] Unauthenticated requests cannot access employee or salary endpoints.
- [ ] Employee list, search, filters, and pagination work.
- [ ] Employee creation creates initial salary history.
- [ ] Non-salary employee editing works.
- [ ] Salary update changes current salary and appends history.
- [ ] Analytics return correct metrics for known test data.
- [ ] Database data survives a service restart/redeploy test.
- [ ] Browser console and server logs contain no unresolved critical errors.

## 6. Video Demo Plan

Record a concise demo that shows the actual running application:
1. Open the deployed application and log in.
2. Show the employee directory and 10,000-record pagination/search.
3. Apply department/country/job-title/salary-range filters.
4. Create an employee and show the initial salary-history behavior.
5. Edit a non-salary employee field.
6. Update salary and show the appended history record.
7. Open analytics and demonstrate filtered metrics and department breakdown.
8. Log out and show that protected data is no longer accessible.

Use synthetic data only. Keep the video clear and focused; do not show secrets, real credentials, or private environment settings.

## 7. Repository Readiness

- [ ] All required documentation is committed.
- [ ] README includes project overview, architecture summary, setup, test, seed, and deployment instructions.
- [ ] `.gitignore` excludes secrets, `.env`, SQLite database files, logs, and build artifacts.
- [ ] No secrets or real personal data appear in Git history.
- [ ] Incremental commits reflect actual development.
- [ ] Automated tests and frontend checks pass, with actual results recorded.
- [ ] Known limitations are documented honestly.
- [ ] Deployment URL and video demo are available and verified.

## 8. Submission

- [ ] Push the final repository to the selected Git hosting service.
- [ ] Confirm the repository can be accessed by the assessment reviewers.
- [ ] Include required artifacts and any demo link.
- [ ] Reply to the same Incubyte assessment email with the repository link, as instructed in the assessment brief.
- [ ] Do not claim deployment or video completion until both are actually done.
