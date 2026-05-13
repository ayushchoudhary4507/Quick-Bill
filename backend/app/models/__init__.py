"""ORM models package (import side effects register mappers)."""

from app.models.product import Product
from app.models.sale import Sale
from app.models.sale_item import SaleItem

__all__ = ["Product", "Sale", "SaleItem"]
