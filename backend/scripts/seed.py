"""
Seed the database with sample products for local development.

Run from the `backend` directory:

    python -m scripts.seed

Requires `DATABASE_URL` / `.env` to point at a reachable PostgreSQL instance.
"""

from __future__ import annotations

from decimal import Decimal

# pyrefly: ignore [missing-import]
from sqlalchemy import select

from app.config.settings import get_settings
from app.database.base import Base
from app.database.session import SessionLocal, engine
from app.models.product import Product


def seed() -> None:
    settings = get_settings()
    _ = settings  # settings loads .env; keeps parity with app startup

    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    try:
        existing = session.execute(select(Product.id).limit(1)).first()
        if existing is not None:
            print("Products already exist; skipping seed.")
            return

        samples = [
            Product(name="milk", price=Decimal("3.50"), stock=120),
            Product(name="bread", price=Decimal("4.75"), stock=80),
            Product(name="oil", price=Decimal("5.25"), stock=60),
            Product(name="tea", price=Decimal("3.25"), stock=40),
            Product(name="sugar", price=Decimal("2.95"), stock=100),
            Product(name="salt", price=Decimal("1.50"), stock=200),
        ]
        session.add_all(samples)
        session.commit()
        print(f"Seeded {len(samples)} products.")
    finally:
        session.close()


if __name__ == "__main__":
    seed()
