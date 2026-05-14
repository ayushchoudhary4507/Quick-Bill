from app.database.session import SessionLocal
from app.models.user import User
from app.services.auth_service import verify_password

def check_user():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Total users: {len(users)}")
        for u in users:
            print(f"- {u.username} (Role: {u.role})")
        
        user = db.query(User).filter(User.username == "admin").first()
        if user:
            print(f"User found: {user.username}, Role: {user.role}")
            is_valid = verify_password("admin123", user.hashed_password)
            print(f"Password 'admin123' valid: {is_valid}")
        else:
            print("User 'admin' not found.")
    finally:
        db.close()

if __name__ == "__main__":
    check_user()
