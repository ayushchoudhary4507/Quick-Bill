# pyrefly: ignore [missing-import]
from sqlalchemy import inspect
from app.database.session import engine

def inspect_db():
    inspector = inspect(engine)
    columns = inspector.get_columns("products")
    print("Columns in 'products' table:")
    for col in columns:
        print(f"- {col['name']} ({col['type']})")

if __name__ == "__main__":
    inspect_db()
