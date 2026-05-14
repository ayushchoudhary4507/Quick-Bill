import asyncio
# pyrefly: ignore [missing-import]
import httpx
import sys

BASE_URL = "http://localhost:8000/api/v1"

async def test_race_condition():
    print("\n--- Testing Race Condition ---")
    # 1. Login
    async with httpx.AsyncClient() as client:
        # Assuming admin/admin exists (created on first register)
        # We might need to register first if DB is fresh
        try:
            await client.post(f"{BASE_URL}/auth/register", json={"username": "admin", "password": "password123"})
        except:
            pass
        
        login_res = await client.post(f"{BASE_URL}/auth/login", data={"username": "admin", "password": "password123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create a product with 1 stock
        prod_res = await client.post(f"{BASE_URL}/products", json={
            "name": "Race Product",
            "price": 100.0,
            "stock": 1
        }, headers=headers)
        product_id = prod_res.json()["id"]
        print(f"Created product {product_id} with 1 stock.")

        # 3. Simulate two simultaneous checkouts
        payload = {"items": [{"product_id": product_id, "quantity": 1}]}
        
        async def do_checkout():
            return await client.post(f"{BASE_URL}/checkout/", json=payload, headers=headers)

        print("Triggering two simultaneous checkouts...")
        results = await asyncio.gather(do_checkout(), do_checkout())

        status_codes = [r.status_code for r in results]
        print(f"Results: {status_codes}")
        
        if status_codes.count(200) == 1:
            print("SUCCESS: Only one checkout succeeded (Race condition prevented).")
        else:
            print("FAILURE: Multiple checkouts succeeded or both failed unexpectedly.")

async def test_rollback():
    print("\n--- Testing Rollback ---")
    async with httpx.AsyncClient() as client:
        login_res = await client.post(f"{BASE_URL}/auth/login", data={"username": "admin", "password": "password123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create product
        prod_res = await client.post(f"{BASE_URL}/products", json={
            "name": "Rollback Test",
            "price": 50.0,
            "stock": 10
        }, headers=headers)
        product_id = prod_res.json()["id"]

        # Attempt checkout with an invalid product ID mixed in to trigger failure
        payload = {
            "items": [
                {"product_id": product_id, "quantity": 5},
                {"product_id": 99999, "quantity": 1} # Should fail
            ]
        }
        
        res = await client.post(f"{BASE_URL}/checkout/", json=payload, headers=headers)
        print(f"Checkout status (expected 404): {res.status_code}")

        # Check stock - should still be 10 if rollback worked
        prod_after = await client.get(f"{BASE_URL}/products", headers=headers)
        # Find our product
        p = next(item for item in prod_after.json() if item["id"] == product_id)
        print(f"Stock after failed transaction: {p['stock']}")
        if p['stock'] == 10:
            print("SUCCESS: Rollback worked. Stock preserved.")
        else:
            print("FAILURE: Stock was reduced despite transaction failure.")

if __name__ == "__main__":
    asyncio.run(test_race_condition())
    asyncio.run(test_rollback())
