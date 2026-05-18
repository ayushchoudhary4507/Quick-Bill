# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, Request, Header, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from typing import List
# pyrefly: ignore [missing-import]
import stripe

from app.database.session import get_db
from app.routes.deps import get_current_user, get_current_admin
from app.models.user import User
from app.models.payment import Payment
from app.schemas.payment import (
    CheckoutSessionCreate, 
    CheckoutSessionResponse, 
    PaymentRead, 
    PaymentHistory
)
from app.services.stripe_service import StripeService
from app.config.settings import get_settings

router = APIRouter()
settings = get_settings()

@router.post("/create-checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    data: CheckoutSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a Stripe Checkout session and return the URL.
    """
    try:
        from app.models.product import Product
        # Pre-checkout stock verification
        for item in data.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_name} not found")
            if product.stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for {item.product_name}. Available: {product.stock}")

        checkout_url, session_id, total_amount = StripeService.create_checkout_session(current_user.id, data)
        
        # Log the pending payment
        new_payment = Payment(
            user_id=current_user.id,
            stripe_checkout_session_id=session_id,
            amount=total_amount,
            currency=data.currency,
            status="pending"
        )
        db.add(new_payment)
        db.commit()
        
        return {"checkout_url": checkout_url}
    except Exception as e:
        print(f"DEBUG: Payment Error - {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Webhook endpoint to handle Stripe events (payment success, etc.)
    """
    payload = await request.body()
    print("DEBUG: Webhook received!")
    
    try:
        event = StripeService.verify_webhook_signature(payload.decode("utf-8"), stripe_signature)
    except Exception as e:
        print(f"DEBUG: Webhook Signature Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    # Handle the checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        session_dict = session.to_dict() # Safe conversion
        print(f"DEBUG: Payment success for session {session_dict.get('id')}")
        
        # Fulfillment Logic
        import json
        from app.models.product import Product
        from app.models.sale import Sale
        from app.models.sale_item import SaleItem

        stripe_session_id = session_dict.get('id')
        payment_intent_id = session_dict.get('payment_intent')
        customer_email = session_dict.get('customer_details', {}).get('email')
        
        # Find the pending payment record
        payment = db.query(Payment).filter(Payment.stripe_checkout_session_id == stripe_session_id).first()
        
        if payment and payment.status != "confirmed":
            try:
                # START TRANSACTION
                payment.status = "confirmed"
                payment.stripe_payment_id = payment_intent_id
                payment.customer_email = customer_email
                
                # Get metadata
                metadata = session_dict.get('metadata', {})
                cart_items_str = metadata.get('cart_items')
                if cart_items_str:
                    cart_items = json.loads(cart_items_str)
                    user_id = int(metadata.get('user_id', 0))
                    
                    print(f"DEBUG: Processing items for stock update: {cart_items}")
                    
                    # Create Sale Record
                    new_sale = Sale(total_amount=payment.amount, created_by=user_id)
                    db.add(new_sale)
                    db.flush() # Get sale ID
                    
                    for item in cart_items:
                        # Row locking for concurrency protection
                        product = db.query(Product).filter(Product.id == item['id']).with_for_update().first()
                        if product:
                            if product.stock >= item['qty']:
                                old_stock = product.stock
                                product.stock -= item['qty']
                                print(f"DEBUG: Webhook - Product '{product.name}' Stock Update:")
                                print(f"  - Stock Before: {old_stock}")
                                print(f"  - Quantity Purchased: {item['qty']}")
                                print(f"  - Stock After: {product.stock}")
                            else:
                                print(f"WARNING: Insufficient stock for {product.name}")
                            
                            # Add Sale Item
                            sale_item = SaleItem(
                                sale_id=new_sale.id,
                                product_id=product.id,
                                quantity=item['qty'],
                                price=product.price
                            )
                            db.add(sale_item)
                    
                    db.commit()
                    db.expire_all() # Clear SQLAlchemy session cache
                    
                    # Verify update with a fresh query
                    print(f"SUCCESS: Payment confirmed and Stock updated for session {stripe_session_id}")
                    for item in cart_items:
                        p_check = db.query(Product).filter(Product.id == item['id']).first()
                        if p_check:
                            print(f"VERIFY: Product '{p_check.name}' final stock in DB: {p_check.stock}")
                else:
                    db.commit()
                    print("WARNING: No cart_items found in metadata")
            except Exception as e:
                db.rollback()
                print(f"ERROR: Transaction failed, rolled back. {e}")
        else:
            print(f"DEBUG: Payment already processed or not found for {stripe_session_id}")
    
    return {"status": "success"}

@router.get("/verify-session/{session_id}")
async def verify_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Manually verify a session status (fallback for missing webhooks).
    """
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        if session.payment_status == "paid":
            print(f"DEBUG: Session {session_id} is PAID. Verifying...")
            payment = db.query(Payment).filter(Payment.stripe_checkout_session_id == session_id).first()
            if payment and payment.status != "confirmed":
                try:
                    # Convert Stripe object to plain dictionary for safe access
                    session_dict = session.to_dict()
                    payment.status = "confirmed"
                    payment.stripe_payment_id = session_dict.get('payment_intent')
                    
                    # Safely get customer email
                    cust_details = session_dict.get('customer_details', {})
                    if cust_details:
                        payment.customer_email = cust_details.get('email')
                    
                    import json
                    from app.models.product import Product
                    from app.models.sale import Sale
                    from app.models.sale_item import SaleItem
                    
                    metadata = session_dict.get('metadata', {})
                    cart_items_str = metadata.get('cart_items')
                    cart_items = []
                    
                    if cart_items_str:
                        cart_items = json.loads(cart_items_str)
                        user_id = int(metadata.get('user_id', 0))
                        
                        print(f"DEBUG: Manual verify: processing items {cart_items}")
                        
                        new_sale = Sale(total_amount=payment.amount, created_by=user_id)
                        db.add(new_sale)
                        db.flush()
                        
                        for item in cart_items:
                            product = db.query(Product).filter(Product.id == item['id']).with_for_update().first()
                            if product:
                                if product.stock >= item['qty']:
                                    old_stock = product.stock
                                    product.stock -= item['qty']
                                    print(f"DEBUG: Manual verify: Stock updated for {product.name}: {old_stock} -> {product.stock}")
                                
                                db.add(SaleItem(sale_id=new_sale.id, product_id=product.id, quantity=item['qty'], price=product.price))
                    
                    db.commit()
                    db.expire_all()
                    print(f"SUCCESS: Manual verify completed for {session_id}")
                    if cart_items: # Safe check
                        for item in cart_items:
                            p_check = db.query(Product).filter(Product.id == item['id']).first()
                            if p_check:
                                print(f"VERIFY: Manual - Product '{p_check.name}' final stock in DB: {p_check.stock}")
                    return {"status": "confirmed", "message": "Payment verified successfully"}
                except Exception as e:
                    db.rollback()
                    print(f"ERROR: Manual verify failed: {e}")
                    import traceback
                    traceback.print_exc()
                    raise e
            return {"status": payment.status if payment else "not_found"}
        return {"status": session.payment_status}
    except Exception as e:
        print(f"DEBUG: Session verification error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/history", response_model=PaymentHistory)
async def get_payment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the payment history and auto-verify pending ones.
    """
    payments = db.query(Payment).filter(Payment.user_id == current_user.id).order_by(Payment.created_at.desc()).all()
    
    # Auto-verify pending payments
    for p in payments:
        if p.status == "pending":
            try:
                session = stripe.checkout.Session.retrieve(p.stripe_checkout_session_id)
                if session.payment_status == "paid":
                    p.status = "confirmed"
                    p.stripe_payment_id = session.payment_intent
                    p.customer_email = session.customer_details.get('email')
                    
                    # Fulfill stock if not done
                    import json
                    from app.models.product import Product
                    from app.models.sale import Sale
                    from app.models.sale_item import SaleItem
                    
                    cart_items_str = session.metadata.get('cart_items')
                    if cart_items_str:
                        cart_items = json.loads(cart_items_str)
                        new_sale = Sale(total_amount=p.amount, created_by=current_user.id)
                        db.add(new_sale)
                        db.flush()
                        for item in cart_items:
                            product = db.query(Product).filter(Product.id == item['id']).with_for_update().first()
                            if product and product.stock >= item['qty']:
                                product.stock -= item['qty']
                                db.add(SaleItem(sale_id=new_sale.id, product_id=product.id, quantity=item['qty'], price=product.price))
                    db.commit()
            except:
                pass
                
    return {"payments": payments, "total_count": len(payments)}

@router.get("/admin/all", response_model=PaymentHistory)
async def get_all_payments(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Admin only: Get all payments in the system.
    """
    payments = db.query(Payment).order_by(Payment.created_at.desc()).all()
    return {"payments": payments, "total_count": len(payments)}
