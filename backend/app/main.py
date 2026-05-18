"""
FastAPI application entrypoint.

Wires routers, CORS, and (in development) ensures database tables exist.
"""

from contextlib import asynccontextmanager
# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from sqlalchemy import inspect as sqlalchemy_inspect

from app.config.settings import get_settings
from app.database.base import Base
from app.database.session import engine
# Routers are imported below to avoid circular dependencies or for better organization

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    """
    Application lifespan hook.

    For a quick local setup, create tables automatically. In production, prefer migrations
    (Alembic) instead of implicit schema creation.
    """
    # For local development, protect against "table exists but schema is older".
    # `create_all()` only creates missing tables; it won't add missing columns.
    settings = get_settings()
    print(f"Connecting to database: {settings.database_url}")
    inspector = sqlalchemy_inspect(engine)
    table_names = set(inspector.get_table_names())

    products_missing = "products" not in table_names
    products_have_stock = False
    if not products_missing:
        try:
            cols = inspector.get_columns("products")
            products_have_stock = any(c.get("name") == "stock" for c in cols)
        except Exception:
            # If inspection fails, handle below via recreate flag / error.
            products_have_stock = False

    if settings.recreate_tables_on_startup:
        # Force drop and recreate for development
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
    elif products_missing or not products_have_stock:
        if settings.recreate_tables_on_startup: # This branch is now redundant but kept for logic safety
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)
        else:
            raise RuntimeError(
                "Database schema is out of date: expected `products.stock` column but it was not found. "
                "Fix options:\n"
                "1) Set `RECREATE_TABLES_ON_STARTUP=true` in backend/.env and restart (local dev only), OR\n"
                "2) Manually migrate / drop & recreate tables in PostgreSQL.\n"
            )
    else:
        Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Quick-Bill POS API",
    version="1.0.0",
    lifespan=lifespan,
    separate_input_output_schemas=False,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routes import checkout, products, sales, auth, analytics, payment

app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(products.router, prefix=settings.api_v1_prefix)
app.include_router(checkout.router, prefix=settings.api_v1_prefix)
app.include_router(sales.router, prefix=settings.api_v1_prefix)
app.include_router(analytics.router, prefix=settings.api_v1_prefix)
app.include_router(payment.router, prefix=f"{settings.api_v1_prefix}/payments", tags=["payments"])
app.include_router(payment.router, prefix="/stripe", tags=["stripe-webhook"])



@app.get("/health")
def health() -> dict[str, str]:
    """Simple readiness probe for local/dev checks."""
    return {"status": "ok"}
