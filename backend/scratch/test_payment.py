# pyrefly: ignore [missing-source-for-stubs]
import requests

def test_payment():
    url = "http://localhost:8000/api/v1/payments/create-checkout-session"
    
    # Mock token - I'll need a real one if auth is enabled
    # Actually, I'll try to login first if I can
    
    auth_url = "http://localhost:8000/api/v1/auth/login"
    login_data = {
        "username": "admin",
        "password": "adminpassword" # Assuming these exist from earlier tasks
    }
    
    try:
        # First try without auth to see if it even reaches validation
        payload = {
            "items": [{
                "product_name": "Test Product",
                "amount": 10.0,
                "quantity": 1
            }],
            "currency": "usd"
        }
        r = requests.post(url, json=payload)
        print(f"Status: {r.status_code}")
        print(f"Body: {r.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_payment()
