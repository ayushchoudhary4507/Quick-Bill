"""
SQLAlchemy declarative base for ORM models.

All model modules should inherit from `Base` so metadata is unified for table creation.
"""
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Declarative base class for Quick-Bill models."""

    pass
