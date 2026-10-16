from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, employees, health, salaries
from app.core.config import get_settings
from app.core.errors import register_error_handlers
from app.db.connection import get_db_connection
from app.db.migrations import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema and tables exist on application startup
    settings = get_settings()
    with get_db_connection(settings.database_file_path) as conn:
        init_db(conn)
    yield


app = FastAPI(
    title="ACME Salary Management API",
    description="Internal HR Salary Management & Analytics API for ACME",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan
)

settings = get_settings()

# Setup CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register standard error handlers
register_error_handlers(app)

# Register routes with /api/v1 prefix
app.include_router(health.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(employees.router, prefix="/api/v1")
app.include_router(salaries.router, prefix="/api/v1")


