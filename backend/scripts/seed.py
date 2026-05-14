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
        # Seed Admin User
        from app.models.user import User, UserRole
        from app.services.auth_service import get_password_hash

        admin_exists = session.execute(select(User).where(User.username == "admin")).scalar_one_or_none()
        if not admin_exists:
            admin_user = User(
                username="admin",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN
            )
            session.add(admin_user)
            session.commit()
            print("Seeded admin user (admin / admin123)")
        else:
            print("Admin user already exists.")

        # Seed Products
        existing = session.execute(select(Product.id).limit(1)).first()
        if existing is not None:
            print("Products already exist; skipping product seed.")
        else:
            samples = [
                Product(name="Laptop", price=Decimal("1200.00"), stock=10),
                Product(name="Mouse", price=Decimal("25.00"), stock=50),
                Product(name="Keyboard", price=Decimal("45.00"), stock=30),
                Product(name="Monitor", price=Decimal("150.00"), stock=15),
                Product(name="USB Cable", price=Decimal("10.00"), stock=100),
                Product(name="Desk Lamp", price=Decimal("35.00"), stock=5),
            ]
            session.add_all(samples)
            session.commit()
            print(f"Seeded {len(samples)} products.")

    finally:
        session.close()


if __name__ == "__main__":
    seed()
