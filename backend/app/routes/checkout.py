
from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.checkout import CheckoutRequest, CheckoutResponse
from app.services.checkout_service import process_checkout
from app.routes.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/checkout", tags=["checkout"])

@router.post("/", response_model=CheckoutResponse)
def checkout(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atomic checkout endpoint.
    Ensures stock is reserved and transaction is consistent.
    """
    try:
        sale = process_checkout(db, payload.items, current_user.id)
        return CheckoutResponse(
            message="Checkout successful",
            total=float(sale.total_amount),
            sale_id=sale.id,
            total_amount=sale.total_amount,
            success=True
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Checkout failed: {str(e)}"
        )
