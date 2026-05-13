"""Request/response models for checkout."""

from decimal import Decimal
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, ConfigDict, Field, field_validator


class CheckoutLineIn(BaseModel):
    """One cart line submitted by the client."""

    product_id: int = Field(..., ge=1)
    quantity: int = Field(..., ge=1)

    @field_validator("quantity")
    @classmethod
    def quantity_sensible(cls, v: int) -> int:
        # Guard absurd values early; stock checks happen server-side with row locks.
        if v > 1_000_000:
            raise ValueError("quantity is too large")
        return v


class CheckoutRequest(BaseModel):
    """Checkout payload: only items are required for this POS."""

    items: list[CheckoutLineIn] = Field(..., min_length=1)


class CheckoutResponse(BaseModel):
    """Checkout response.

    `message` and `total` are the fields expected by the assignment.
    We also keep `sale_id`/`total_amount` for frontend compatibility.
    """

    message: str = "Checkout successful"
    total: float
    sale_id: int | None = None
    total_amount: Decimal | None = None
    success: bool = True
