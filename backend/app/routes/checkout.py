"""
Checkout route.

`POST /checkout` validates inventory and records a sale atomically.
"""
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.checkout import CheckoutRequest, CheckoutResponse
from app.services.checkout_service import process_checkout

router = APIRouter(prefix="/checkout", tags=["checkout"])


@router.post("", response_model=CheckoutResponse)
def checkout(payload: CheckoutRequest, db: Session = Depends(get_db)) -> CheckoutResponse:
    """
    Process a POS checkout.

    - Rejects empty carts
    - Validates quantities and stock
    - Writes sale + sale_items and updates product stock in one transaction
    """
    sale = process_checkout(db, payload.items)
    return CheckoutResponse(
        success=True,
        sale_id=sale.id,
        total_amount=sale.total_amount,
        total=float(sale.total_amount),
        message="Checkout successful",
    )
