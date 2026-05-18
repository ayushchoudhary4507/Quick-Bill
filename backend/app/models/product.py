"""
Product inventory model.

`stock` is decremented atomically during checkout inside a DB transaction.
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
# pyrefly: ignore [missing-import]
from sqlalchemy import Integer, Numeric, String, Text, DateTime, func
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    image_url: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    sale_items: Mapped[list["SaleItem"]] = relationship(
        "SaleItem",
        back_populates="product",
    )
    inventory_audits: Mapped[list["InventoryAudit"]] = relationship(
        "InventoryAudit",
        back_populates="product",
    )

