from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import analytics, auth, employees, health, salaries

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
app.include_router(analytics.router, prefix="/api/v1")

# Serve React frontend if built
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.is_dir():
    assets_dir = frontend_dist / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Exclude /api and /docs from SPA catch-all
        if full_path.startswith("api/") or full_path.startswith("docs"):
            return None
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")




