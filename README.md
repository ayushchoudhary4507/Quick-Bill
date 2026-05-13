# Quick-Bill POS

Full-stack POS (Point of Sale) built with:
* **Frontend:** React + Vite, **Tailwind CSS**, **Axios**, React Router
* **Backend:** **FastAPI**, **SQLAlchemy ORM**, **PostgreSQL** (psycopg2), **Pydantic**

The app supports:
* Product catalog (search + add to cart)
* Cart (add/remove, increase/decrease quantity)
* Checkout (server-side stock validation + transactional sale creation)
* Sales history
* Toast notifications + loading states

---

## Architecture (clean, interview-friendly)

### Backend (FastAPI)
* **Routes are thin**: only parse input and call services.
* **Services hold business logic**:
  * stock validation
  * sale + sale_items creation
  * transaction commit/rollback
* **Models are ORM tables**: `Product`, `Sale`, `SaleItem`
* **Schemas**:
  * validate request payloads
  * shape responses

### Frontend (React)
* **Components**: reusable UI (ProductCard, CartLine, Toast, Loader, Navbar)
* **Pages**:
  * `PosPage` (catalog + cart + checkout)
  * `SalesHistoryPage` (read-only transactions)
* **Services**: API client using Axios
* **Hooks/Context**:
  * `useCart` hook + `CartProvider` manage cart state

---

## Database model & relationships

### Tables
1. `products`
   * `id` (PK)
   * `name`
   * `price`
   * `stock`
2. `sales`
   * `id` (PK)
   * `total_amount`
   * `created_at`
3. `sale_items`
   * `id` (PK)
   * `sale_id` (FK -> `sales.id`)
   * `product_id` (FK -> `products.id`)
   * `quantity`
   * `price` (snapshot at checkout time)

### Why `SaleItem.price` exists
At checkout time, product prices can change. Storing `SaleItem.price` guarantees the receipt is accurate for that transaction.

---

## Backend setup (local)

### 1) PostgreSQL
Create a database:
```sql
CREATE DATABASE quickbill;
```

### 2) Environment variables
1. Copy env:
   ```bash
   cd backend
   copy .env.example .env
   ```
2. Ensure these are set in `backend/.env`:
   * `DATABASE_URL`
   * `CORS_ORIGINS`
   * `API_V1_PREFIX=/api/v1`

> Note: For development, you can enable:
> `RECREATE_TABLES_ON_STARTUP=true`
> if your DB schema is out of sync. This drops + recreates tables.

### 3) Install & run
```bash
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:
* `GET http://localhost:8000/health`

### 4) Seed sample products (optional)
```bash
python -m scripts.seed
```

---

## Frontend setup (local)

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

The frontend calls the backend at:
* `VITE_API_BASE_URL` (default: `http://localhost:8000/api/v1`)

---

## API reference (backend)

Base path: `/api/v1`

### `GET /products`
Query:
* `search` (optional): case-insensitive substring match on product name

Success (200):
```json
[
  { "id": 1, "name": "Espresso", "price": "3.50", "stock": 120 }
]
```

### `POST /products` (optional admin API)
Creates a product:
```json
{ "name": "Latte", "price": 5.25, "stock": 60 }
```

### `PUT /products/{id}` (optional admin API)
Updates product fields (any subset):
```json
{ "price": 5.50, "stock": 40 }
```

Error example (404):
```json
{ "detail": "Product not found" }
```

### `POST /checkout`
Validates stock and creates a sale atomically.

Request:
```json
{
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ]
}
```

Success (200):
```json
{
  "message": "Checkout successful",
  "total": 12.25,
  "sale_id": 12
}
```

Error examples:
* Empty cart / validation:
```json
{ "detail": "Cart cannot be empty" }
```
* Out of stock:
```json
{ "detail": "Insufficient stock for 'Latte' (requested 99, available 60)" }
```

Implementation detail (important for interviews):
* uses a DB transaction
* locks product rows using `SELECT ... FOR UPDATE`
* commits only after all items pass validation
* rollbacks on any exception

### `GET /sales`
Returns transaction history (newest first), including line items.

Success (200):
```json
[
  {
    "id": 12,
    "total_amount": "12.25",
    "created_at": "2026-05-13T10:15:30+00:00",
    "items": [
      { "id": 55, "product_id": 1, "quantity": 2, "price": "3.50", "product_name": "Espresso" }
    ]
  }
]
```

---

## Checkout flow (end-to-end explanation)

1. Frontend builds cart lines: `{ product_id, quantity }`
2. Frontend calls `POST /checkout`
3. Backend service:
   * rejects empty carts
   * merges duplicate product lines (server-side tolerance)
   * for each product:
     * locks the row (`FOR UPDATE`)
     * validates product exists
     * validates requested quantity <= stock
     * computes line total and adds `SaleItem(price snapshot)`
     * decrements `Product.stock`
4. On success:
   * sale total is set
   * transaction commits
5. On failure:
   * transaction rolls back
   * API returns `{ "detail": "...error..." }`

---

## Test scenarios (manual test checklist)

### Cart & UI
1. Checkout with an empty cart -> error toast ("Cart is empty" / "Cart cannot be empty")
2. Add an out-of-stock product -> should not allow add, shows toast error
3. Increase quantity beyond stock -> should block on UI and/or fail checkout with 400
4. Remove item -> totals should update instantly
5. Decrease quantity to 1 -> allowed; below 1 -> blocked

### Backend correctness
1. `GET /products` returns `stock` and correct ordering
2. `POST /checkout` reduces product stock
3. `POST /checkout` creates `sales` and `sale_items` rows
4. `POST /checkout` fails when stock is insufficient (no partial writes)
5. `GET /sales` shows newly created transaction

### Error handling
1. Unknown product id in checkout -> 400 with `detail`
2. Invalid quantity payload (0 or negative) -> 400 with validation detail

---

## Deployment

### Frontend (Vercel)
1. Push `frontend/` to a repo (or configure build command + root)
2. Set environment variable:
   * `VITE_API_BASE_URL=https://<your-backend-url>/api/v1`
3. Build/Deploy:
   * Build command: `npm run build`
   * Output directory: `dist`

### Backend (Render / Railway)
1. Deploy from `backend/`
2. Environment variables:
   * `DATABASE_URL` (Neon/Supabase connection string)
   * `CORS_ORIGINS` (your Vercel URL, e.g. `https://your-app.vercel.app`)
   * `API_V1_PREFIX=/api/v1`
3. Start command example:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### PostgreSQL (Neon / Supabase)
1. Create a Postgres database
2. Use provided connection string as `DATABASE_URL`
3. Keep migrations enabled in production (replace `create_all()` with Alembic)

> Production note:
> This repo currently uses `create_all()` for local/dev convenience.
> For production, you should use **Alembic migrations** and keep `RECREATE_TABLES_ON_STARTUP=false`.

---

## License
MIT (sample project).

