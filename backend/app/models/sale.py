"""
Sale (transaction header) model.

`total_amount` is the sum of line totals at checkout time.
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal

# pyrefly: ignore [missing-import]
from sqlalchemy import DateTime, Numeric, func, ForeignKey
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Sale(Base):
    __tablename__ = "sales"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    user: Mapped["User"] = relationship("User")


    items: Mapped[list["SaleItem"]] = relationship(
        "SaleItem",
        back_populates="sale",
        cascade="all, delete-orphan",
    )
