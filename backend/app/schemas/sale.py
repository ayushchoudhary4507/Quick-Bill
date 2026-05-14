"""Schemas for listing past sales (transaction history)."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class SaleItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    price: Decimal
    product_name: str | None = None


class SaleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    total_amount: Decimal
    created_at: datetime
    items: list[SaleItemRead] = []
