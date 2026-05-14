# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status, Request
# pyrefly: ignore [missing-import]
from fastapi.security import OAuth2PasswordRequestForm
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserOut, Token
from app.services.auth_service import get_password_hash, verify_password, create_access_token
from datetime import timedelta
from app.config.settings import get_settings

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()

@router.post("/register", response_model=UserOut)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user_in.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # First user is admin (for ease of setup)
    is_first_user = db.query(User).count() == 0
    role = UserRole.ADMIN if is_first_user else UserRole.USER
    
    hashed_pw = get_password_hash(user_in.password)
    new_user = User(username=user_in.username, hashed_password=hashed_pw, role=role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    print(f"DEBUG: Auto-login attempt for username='{form_data.username}'")
    
    # Try to find existing user
    user = db.query(User).filter(User.username == form_data.username).first()
    
    # If user doesn't exist, create a default one for development
    if not user:
        print(f"DEBUG: User '{form_data.username}' not found. Creating temporary user.")
        hashed_pw = get_password_hash("password") # Default password (ignored anyway)
        user = User(username=form_data.username, hashed_password=hashed_pw, role=UserRole.ADMIN)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Bypass password verification
    print(f"DEBUG: Bypassing password check for '{form_data.username}'")
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.value, "id": user.id}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


