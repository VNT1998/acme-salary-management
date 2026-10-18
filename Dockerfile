# Multi-stage Docker build for ACME Salary Management System
# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend & Production Runtime
FROM python:3.12-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DATABASE_PATH=/data/acme.db \
    ENVIRONMENT=production \
    PORT=8000 \
    HR_EMAIL=hr@acme.test \
    HR_PASSWORD=hr@123456

# Install uv for fast Python dependency management
RUN pip install --no-cache-dir uv

# Create persistent storage directory for SQLite
RUN mkdir -p /data

# Copy backend dependencies
COPY backend/pyproject.toml backend/uv.lock /app/backend/
WORKDIR /app/backend
RUN uv sync --frozen --no-dev

# Copy backend code
COPY backend/ /app/backend/

# Copy built frontend assets from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Pre-seed 10,000 employees and bootstrap HR manager (password: hr@123456) at build time
RUN uv run python scripts/create_hr_user.py --email hr@acme.test --password hr@123456 && \
    uv run python scripts/seed.py --count 10000

# Copy and setup runtime entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 8000

# Run entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
