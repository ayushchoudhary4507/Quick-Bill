from sqlalchemy.orm import Session
from sqlalchemy import func, desc, select
from app.models.product import Product
from app.models.sale_item import SaleItem

def get_top_products(db: Session, limit: int = 5):
    """
    Returns top N best-selling products using:
    JOIN, GROUP BY, SUM, ORDER BY
    """
    stmt = (
        select(
            Product.name.label("product_name"),
            func.sum(SaleItem.quantity).label("total_sold")
        )
        .join(SaleItem, Product.id == SaleItem.product_id)
        .group_by(Product.name)
        .order_by(desc("total_sold"))
        .limit(limit)
    )
    
    results = db.execute(stmt).all()
    
    # Convert to list of dicts for JSON response
    return [{"product_name": r.product_name, "total_sold": int(r.total_sold)} for r in results]
