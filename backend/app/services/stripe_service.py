# pyrefly: ignore [missing-import]
import stripe
from app.config.settings import get_settings
from app.schemas.payment import CheckoutSessionCreate

settings = get_settings()
stripe.api_key = settings.stripe_secret_key

class StripeService:
    @staticmethod
    def create_checkout_session(user_id: int, data: CheckoutSessionCreate):
        """
        Creates a Stripe Checkout Session for multiple items.
        """
        if not stripe.api_key:
            stripe.api_key = settings.stripe_secret_key
            
        if not stripe.api_key:
            raise Exception("Stripe API key is not configured. Please check your .env file.")
            
        try:
            line_items = []
            total_amount = 0
            for item in data.items:
                line_items.append({
                    'price_data': {
                        'currency': data.currency,
                        'product_data': {
                            'name': item.product_name,
                        },
                        'unit_amount': int(item.amount * 100),
                    },
                    'quantity': item.quantity,
                })
                total_amount += item.amount * item.quantity

            import json
            cart_data = [{"id": item.product_id, "qty": item.quantity} for item in data.items]

            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                success_url=f"{settings.frontend_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.frontend_url}/payment/cancel",
                client_reference_id=str(user_id),
                metadata={
                    "user_id": str(user_id),
                    "cart_items": json.dumps(cart_data)
                }
            )
            return session.url, session.id, total_amount
        except Exception as e:
            raise Exception(f"Stripe Session Error: {str(e)}")

    @staticmethod
    def verify_webhook_signature(payload: str, sig_header: str):
        """
        Verifies the Stripe webhook signature.
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.stripe_webhook_secret
            )
            return event
        except ValueError:
            # Invalid payload
            raise Exception("Invalid payload")
        except stripe.error.SignatureVerificationError:
            # Invalid signature
            raise Exception("Invalid signature")
        except Exception as e:
            raise Exception(f"Webhook Error: {str(e)}")
