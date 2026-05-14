from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.config.settings import get_settings
from app.database.session import get_db
from app.models.user import User, UserRole
from app.schemas.user import TokenData

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_v1_prefix}/auth/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        print(f"DEBUG deps: Decoding token: {token[:20]}...")
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        user_id: int = payload.get("id")
        print(f"DEBUG deps: Decoded payload - user={username}, role={role}, id={user_id}")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username, role=role)
    except JWTError as e:
        print(f"DEBUG deps: JWTError - {e}")
        raise credentials_exception
    
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        print(f"DEBUG deps: User '{token_data.username}' not found in DB")
        raise credentials_exception
    print(f"DEBUG deps: Authenticated user '{user.username}'")
    return user

def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user
