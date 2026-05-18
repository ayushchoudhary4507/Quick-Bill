from __future__ import annotations
# pyrefly: ignore [missing-import]
from sqlalchemy import Integer, String, Float, DateTime, ForeignKey
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column
# pyrefly: ignore [missing-import]
from sqlalchemy.sql import func
from app.database.base import Base
import datetime

class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    stripe_payment_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=True)
    stripe_checkout_session_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="usd")
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, completed, failed
    customer_email: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
