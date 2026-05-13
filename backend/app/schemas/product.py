"""Pydantic schemas for product API responses and internal use."""

from decimal import Decimal
from typing import Optional
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, examples=["Espresso"])
    price: Decimal = Field(..., ge=0, examples=[3.50])
    stock: int = Field(..., ge=0, examples=[100])
    image_url: Optional[str] = Field(
        None,
        description="URL of the product image",
        examples=["https://example.com/espresso.jpg"],
    )


class ProductRead(ProductBase):
    """Shape returned by GET /products."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., examples=[1])


class ProductCreate(ProductBase):
    """Payload for creating a product (POST /products)."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Espresso",
                "price": 3.50,
                "stock": 100,
                "image_url": "https://example.com/espresso.jpg"
            }
        }
    )


class ProductUpdate(BaseModel):
    """Payload for updating a product (PUT /products/{id})."""

    name: Optional[str] = Field(None, min_length=1, max_length=255, examples=["Latte"])
    price: Optional[Decimal] = Field(None, ge=0, examples=[4.50])
    stock: Optional[int] = Field(None, ge=0, examples=[50])
    image_url: Optional[str] = Field(
        None,
        description="URL of the product image",
        examples=["https://example.com/latte.jpg"],
    )

    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "example": {
                "name": "Latte",
                "price": 4.50,
                "stock": 50,
                "image_url": "https://example.com/latte.jpg"
            }
        }
    )
