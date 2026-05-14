from __future__ import annotations
from datetime import datetime
# pyrefly: ignore [missing-import]
from sqlalchemy import Integer, String, DateTime, ForeignKey, func, Enum
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
import enum

class AuditAction(str, enum.Enum):
    ADD = "ADD"
    REMOVE = "REMOVE"

class InventoryAudit(Base):
    __tablename__ = "inventory_audits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    action_type: Mapped[AuditAction] = mapped_column(Enum(AuditAction), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(String(255), nullable=True)
    performed_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    product: Mapped["Product"] = relationship("Product", back_populates="inventory_audits")
    user: Mapped["User"] = relationship("User")
