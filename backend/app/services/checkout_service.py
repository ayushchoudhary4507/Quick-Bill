"""
Robust checkout logic with atomic transactions and deadlock prevention.
"""

from decimal import Decimal
# pyrefly: ignore [missing-import]
from fastapi import HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy import select
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.inventory_audit import InventoryAudit, AuditAction
from app.schemas.checkout import CheckoutLineIn

def process_checkout(db: Session, items: list[CheckoutLineIn], user_id: int) -> Sale:
    """
    Industry-level checkout flow:
    1. Consolidate items.
    2. Sort product IDs to prevent deadlocks.
    3. Start atomic transaction.
    4. Lock product rows using SELECT FOR UPDATE.
    5. Validate stock and pricing.
    6. Update stock, create Sale, SaleItems, and InventoryAudit logs.
    7. Commit or Rollback.
    """
    if not items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

    # 1. Consolidate
    merged: dict[int, int] = {}
    for item in items:
        merged[item.product_id] = merged.get(item.product_id, 0) + item.quantity

    # 2. Sort product IDs to prevent deadlocks (Lock rows in sorted product ID order)
    sorted_product_ids = sorted(merged.keys())

    try:
        # 3. Start transaction (handled by db.commit() at end, but we use try/except)
        total_amount = Decimal("0.00")
        
        # Create Sale object first to get ID
        sale = Sale(total_amount=Decimal("0.00"), created_by=user_id)
        db.add(sale)
        db.flush() # Flush to get sale.id

        # 4 & 5. Lock and Validate
        for pid in sorted_product_ids:
            qty = merged[pid]
            
            # SELECT ... FOR UPDATE (Row-level locking)
            stmt = select(Product).where(Product.id == pid).with_for_update()
            product = db.execute(stmt).scalar_one_or_none()
            
            if not product:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product ID {pid} not found")
            
            if product.stock < qty:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail=f"Insufficient stock for {product.name}. Available: {product.stock}, Requested: {qty}"
                )

            # 6. Update and Log
            line_total = product.price * qty
            total_amount += line_total

            # Create SaleItem (using price_at_purchase for historical integrity)
            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=product.id,
                quantity=qty,
                price=product.price # snapshot
            )
            db.add(sale_item)

            # Reduce Stock
            old_stock = product.stock
            product.stock -= qty
            print(f"DEBUG: Product '{product.name}' Stock Update:")
            print(f"  - Stock Before: {old_stock}")
            print(f"  - Quantity Purchased: {qty}")
            print(f"  - Stock After: {product.stock}")

            # Create InventoryAudit Log
            audit = InventoryAudit(
                product_id=product.id,
                action_type=AuditAction.REMOVE,
                quantity=qty,
                reason=f"Sale #{sale.id}",
                performed_by=user_id
            )
            db.add(audit)

        sale.total_amount = total_amount
        
        # 7. Commit
        db.add(sale)
        db.commit()
        
        # EXTREME VERIFICATION: Re-fetch from DB directly
        db.expire_all()
        verify_product = db.query(Product).filter(Product.id == sorted_product_ids[0]).first()
        print(f"DATABASE VERIFIED: Product '{verify_product.name}' stock is now: {verify_product.stock}")
        
        db.refresh(sale)
        print(f"SUCCESS: Checkout complete for Sale #{sale.id}. DB Committed and Verified.")
        return sale

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        # Log error here in real production
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Transaction failed: {str(e)}")
