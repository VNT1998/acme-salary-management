#!/bin/sh
set -e

# Ensure persistent data directory exists
mkdir -p /data

# Change to backend directory
cd /app/backend

# Bootstrap HR user with hr@123456 (idempotent)
uv run python scripts/create_hr_user.py --email "${HR_EMAIL:-hr@acme.test}" --password "${HR_PASSWORD:-hr@123456}"

# Seed 10,000 employees (idempotent, skips if already present)
uv run python scripts/seed.py --count 10000

# Start FastAPI production server
PORT="${PORT:-8000}"
echo "Starting ACME HRMS on 0.0.0.0:${PORT}..."
exec uv run uvicorn app.main:app --host 0.0.0.0 --port "${PORT}"
