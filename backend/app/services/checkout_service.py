"""
Checkout domain logic.

All stock mutations and sale persistence happen in a single database transaction so the
database never ends up in a partially-updated state if something fails mid-flight.
"""

from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.schemas.checkout import CheckoutLineIn


def process_checkout(db: Session, lines: list[CheckoutLineIn]) -> Sale:
    """
    Validate stock, create `Sale` + `SaleItem` rows, and decrement inventory.

    Uses row-level locks (`FOR UPDATE`) to reduce race conditions when two checkouts
    touch the same SKU concurrently.
    """
    if not lines:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart cannot be empty",
        )

    # Consolidate duplicate product lines into a single quantity (client bug tolerance).
    merged: dict[int, int] = {}
    for line in lines:
        merged[line.product_id] = merged.get(line.product_id, 0) + line.quantity

    try:
        total = Decimal("0.00")
        sale = Sale(total_amount=Decimal("0.00"))
        db.add(sale)
        db.flush()  # assign sale.id without committing

        for product_id, qty in merged.items():
            stmt = select(Product).where(Product.id == product_id).with_for_update()
            product = db.execute(stmt).scalar_one_or_none()
            if product is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product {product_id} not found",
                )
            if qty < 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid quantity",
                )
            if product.stock < qty:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{product.name}' (requested {qty}, available {product.stock})",
                )

            line_total = (product.price * qty).quantize(Decimal("0.01"))
            total += line_total

            db.add(
                SaleItem(
                    sale_id=sale.id,
                    product_id=product.id,
                    quantity=qty,
                    price=product.price,
                )
            )
            product.stock -= qty

        sale.total_amount = total
        db.commit()
        db.refresh(sale)
        return sale
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise
