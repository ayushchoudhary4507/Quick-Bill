from app.database.session import engine
# pyrefly: ignore [missing-import]
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        print("Adding created_at to products...")
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP"))
        
        # Also check sales table for created_by which might be missing if it was an older schema
        print("Ensuring sales table has created_by...")
        # (This is just a precaution based on what I saw in models)
        try:
            conn.execute(text("ALTER TABLE sales ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id)"))
        except Exception as e:
            print(f"Sales table migration note: {e}")
            
        conn.commit()
        print("Migration complete.")

if __name__ == "__main__":
    migrate()
