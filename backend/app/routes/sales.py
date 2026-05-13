"""
Sales history routes.

`GET /sales` returns prior transactions with nested line items.
"""

# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends
# pyrefly: ignore [missing-import]
from sqlalchemy import select
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session, selectinload

from app.database.session import get_db
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.schemas.sale import SaleItemRead, SaleRead

router = APIRouter(prefix="/sales", tags=["sales"])


def _sale_to_read(sale: Sale) -> SaleRead:
    """Map ORM graph to API schema (includes product name on each line)."""
    items: list[SaleItemRead] = []
    for it in sale.items:
        product_name = it.product.name if it.product is not None else None
        items.append(
            SaleItemRead(
                id=it.id,
                product_id=it.product_id,
                quantity=it.quantity,
                price=it.price,
                product_name=product_name,
            )
        )
    return SaleRead(
        id=sale.id,
        total_amount=sale.total_amount,
        created_at=sale.created_at,
        items=items,
    )


@router.get("", response_model=list[SaleRead])
def list_sales(db: Session = Depends(get_db)) -> list[SaleRead]:
    """Return recent sales newest-first, including line items."""
    stmt = (
        select(Sale)
        .options(selectinload(Sale.items).selectinload(SaleItem.product))
        .order_by(Sale.created_at.desc())
    )
    sales = list(db.execute(stmt).scalars().all())
    return [_sale_to_read(s) for s in sales]
