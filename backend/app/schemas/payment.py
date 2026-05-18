# pyrefly: ignore [missing-import]
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class CartItem(BaseModel):
    product_id: int
    product_name: str
    amount: float
    quantity: int = 1

class CheckoutSessionCreate(BaseModel):
    items: List[CartItem]
    currency: str = "usd"

class CheckoutSessionResponse(BaseModel):
    checkout_url: str

class PaymentBase(BaseModel):
    amount: float
    currency: str
    status: str
    customer_email: Optional[EmailStr] = None
    stripe_payment_id: Optional[str] = None

class PaymentCreate(PaymentBase):
    user_id: int
    stripe_checkout_session_id: Optional[str] = None

class PaymentRead(PaymentBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PaymentHistory(BaseModel):
    payments: List[PaymentRead]
    total_count: int
