# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends   
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.analytics_service import get_top_products

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/top-products")
def top_products(db: Session = Depends(get_db)):
    """
    Return top 5 best-selling products
    """
    return get_top_products(db, limit=5)
