"""
Database engine and session factory.

`get_db` is the FastAPI dependency that yields a request-scoped session and ensures
the session is closed after the request completes.
"""

from collections.abc import Generator


from sqlalchemy import create_engine

from sqlalchemy.orm import Session, sessionmaker

from app.config.settings import get_settings

settings = get_settings()

# `future=True` is default in SQLAlchemy 2; pool_pre_ping avoids stale connections.
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    class_=Session,
)


def get_db() -> Generator[Session, None, None]:
    """
    Yield a database session for a single request.

    Commits/rollbacks are handled explicitly in services (e.g. checkout) where transactions matter.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
