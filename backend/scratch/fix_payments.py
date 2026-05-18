# pyrefly: ignore [missing-import]
import stripe
import json
from app.database.session import SessionLocal
from app.models.payment import Payment
from app.models.product import Product
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.config.settings import get_settings

def fix_payments():
    settings = get_settings()
    stripe.api_key = settings.stripe_secret_key
    db = SessionLocal()
    
    payments = db.query(Payment).filter(Payment.status == 'pending').all()
    print(f"Checking {len(payments)} pending payments...")
    
    for p in payments:
        try:
            session = stripe.checkout.Session.retrieve(p.stripe_checkout_session_id)
            if session.payment_status == 'paid':
                p.status = 'confirmed'
                p.stripe_payment_id = session.payment_intent
                p.customer_email = session.customer_details.get('email')
                
                # Also fulfill stock if possible
                cart_items_str = session.metadata.get('cart_items')
                if cart_items_str:
                    cart_items = json.loads(cart_items_str)
                    user_id = int(session.metadata.get('user_id'))
                    
                    # Only create sale if it doesn't exist (avoid duplicates)
                    # For this script we just update the status to keep it simple
                    pass
                
                print(f"Updated Payment ID {p.id} to confirmed")
        except Exception as e:
            print(f"Error checking session {p.stripe_checkout_session_id}: {e}")
            
    db.commit()
    db.close()

if __name__ == "__main__":
    fix_payments()
