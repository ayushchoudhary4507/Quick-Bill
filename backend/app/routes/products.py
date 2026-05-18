"""
Product routes.

Endpoints:
- GET  /products?search=...  -> list products (optional server-side search)
- POST /products              -> create product
- PUT  /products/{id}        -> update product
"""

from typing import Optional
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, Query, status
# pyrefly: ignore [missing-import]
from sqlalchemy import select
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductRead])
def list_products(
    search: Optional[str] = Query(
        None,
        description="Optional case-insensitive substring match on product name",
    ),
    db: Session = Depends(get_db),
) -> list[Product]:
    """Return all products ordered by name for stable UI."""
    print("DEBUG: Fetching products from database...")
    try:
        if search and search.strip():
            term = f"%{search.strip()}%"
            products = db.query(Product).filter(Product.name.ilike(term)).order_by(Product.name.asc()).all()
        else:
            products = db.query(Product).order_by(Product.name.asc()).all()
            
        print(f"DEBUG: Fetched {len(products)} products: {[p.name for p in products]}")
        return products
    except Exception as e:
        import traceback
        print("ERROR: Failed to fetch products")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)) -> Product:
    """
    Create a product.

    Validates that a product with the same name doesn't already exist.
    """
    existing_product = db.execute(
        select(Product).where(Product.name.ilike(payload.name))
    ).scalars().first()
    
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A product with this name already exists."
        )

    product = Product(
        name=payload.name, 
        price=payload.price, 
        stock=payload.stock,
        image_url=payload.image_url
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
) -> Product:
    """Update product fields by id."""
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    # Only overwrite fields explicitly provided in the payload.
    if payload.name is not None:
        product.name = payload.name
    if payload.price is not None:
        product.price = payload.price
    if payload.stock is not None:
        product.stock = payload.stock
    if payload.image_url is not None:
        product.image_url = payload.image_url

    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product by id."""
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    try:
        db.delete(product)
        db.commit()
    except Exception as e:
        db.rollback()
        # Usually an IntegrityError if product is linked to SaleItems
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Cannot delete product because it has sales history. Try updating its stock to 0 instead."
        )
    return None
