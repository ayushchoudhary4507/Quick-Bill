# Quick Bill Backend

A modern FastAPI-based billing and inventory management system.

## 🏗️ Architecture

This backend follows a clean, scalable architecture with clear separation of concerns:

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config/              # Configuration management
│   │   └── settings.py      # Environment-based settings
│   ├── database/            # Database layer
│   │   ├── connection.py    # Database connection and session
│   │   └── base.py         # SQLAlchemy base model
│   ├── models/              # Database models
│   │   ├── product.py       # Product entity
│   │   ├── sale.py          # Sale entity
│   │   └── sale_item.py     # Sale item entity
│   ├── schemas/             # Pydantic schemas
│   │   ├── product_schema.py    # Product request/response models
│   │   ├── sale_schema.py       # Sale request/response models
│   │   └── checkout_schema.py   # Checkout request/response models
│   ├── routes/              # API endpoints
│   │   ├── product_routes.py    # Product CRUD operations
│   │   ├── checkout_routes.py   # Checkout process
│   │   └── sales_routes.py     # Sales analytics and management
│   ├── services/            # Business logic
│   │   └── checkout_service.py  # Checkout processing logic
│   └── utils/               # Utility functions
│       └── helpers.py       # Common helper functions
├── alembic/               # Database migrations
├── requirements.txt        # Python dependencies
└── README.md             # This file
```

## 🚀 Features

### Product Management
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Stock management and tracking
- ✅ Search and filtering capabilities
- ✅ Pagination support
- ✅ SKU uniqueness validation

### Checkout System
- ✅ Real-time stock validation
- ✅ Automatic tax calculation (10%)
- ✅ Invoice generation
- ✅ Payment processing workflow
- ✅ Customer information management

### Sales Management
- ✅ Sales history and analytics
- ✅ Daily sales statistics
- ✅ Revenue tracking
- ✅ Payment status management
- ✅ Invoice search by number

### Database Features
- ✅ SQLAlchemy ORM with Alembic migrations
- ✅ Support for SQLite (development) and PostgreSQL (production)
- ✅ Automatic table creation
- ✅ Relationship management

## 🛠️ Technology Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL (production) / SQLite (development)
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Validation**: Pydantic
- **Authentication**: JWT (ready for implementation)
- **Documentation**: Auto-generated Swagger/OpenAPI

## 📋 API Endpoints

### Products (`/api/v1/products`)
- `GET /` - List all products with pagination
- `POST /` - Create new product
- `GET /{id}` - Get specific product
- `PUT /{id}` - Update product
- `DELETE /{id}` - Soft delete product
- `POST /{id}/stock` - Update product stock

### Checkout (`/api/v1/checkout`)
- `POST /validate` - Validate checkout request
- `POST /` - Process checkout
- `GET /sales/{sale_id}` - Get sale details
- `GET /sales` - Get sales history

### Sales (`/api/v1/sales`)
- `GET /` - List all sales with pagination
- `GET /{sale_id}` - Get specific sale
- `GET /invoice/{invoice_number}` - Get sale by invoice
- `GET /stats/summary` - Sales summary statistics
- `GET /stats/daily` - Daily sales analytics

## 🗄️ Database Schema

### Products Table
- `id` - Primary key
- `name` - Product name
- `description` - Product description
- `price` - Product price (decimal)
- `sku` - Unique SKU
- `stock_quantity` - Available stock
- `is_active` - Active status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Sales Table
- `id` - Primary key
- `invoice_number` - Unique invoice number
- `customer_*` - Customer information
- `subtotal` - Order subtotal
- `tax_amount` - Tax amount
- `total_amount` - Total amount
- `payment_*` - Payment information
- `sale_date` - Sale date
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Sale Items Table
- `id` - Primary key
- `sale_id` - Foreign key to sales
- `product_id` - Foreign key to products
- `quantity` - Item quantity
- `unit_price` - Price per unit
- `total_price` - Total price for item

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- PostgreSQL (for production)
- Virtual environment

### Installation

1. **Clone and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Unix/MacOS
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   # Copy .env.example to .env and update values
   cp .env.example .env
   ```

5. **Run database migrations:**
   ```bash
   # For SQLite (development)
   alembic upgrade head
   
   # For PostgreSQL (production)
   # First update DATABASE_URL in .env
   alembic upgrade head
   ```

6. **Start the application:**
   ```bash
   uvicorn app.main:app --reload
   ```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Application
APP_NAME=Quick Bill API
APP_VERSION=1.0.0
DEBUG=true

# Database
DATABASE_URL=sqlite:///./quick_bill.db
# For PostgreSQL: postgresql://user:password@localhost:5432/dbname

# Security
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API
API_V1_PREFIX=/api/v1
```

## 🧪 Development

### Running Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app
```

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### API Documentation
Once running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

## 🔧 Configuration

### CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (React default)
- `http://127.0.0.1:5173`
- `http://127.0.0.1:3000`

### Database Configuration
- **Development**: SQLite database (`quick_bill.db`)
- **Production**: PostgreSQL database
- **Migrations**: Managed via Alembic

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:8000/health
```

### Application Logs
The application provides structured logging with levels:
- `INFO` - General application flow
- `WARNING` - Potential issues
- `ERROR` - Application errors

## 🚀 Deployment

### Production Considerations
1. **Database**: Use PostgreSQL with connection pooling
2. **Security**: Update `SECRET_KEY` and use HTTPS
3. **Environment**: Set `DEBUG=false`
4. **CORS**: Configure specific frontend domain
5. **Monitoring**: Set up proper logging and monitoring

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Create meaningful commit messages
5. Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License.
