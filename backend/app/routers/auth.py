from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.models.models import User
from backend.app.schemas.schemas import UserCreate, UserLogin, Token, User as UserSchema
from backend.app.auth import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/api", tags=["Authentication"])

@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Registers a new Customer in the store."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.Username == user_in.Username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Hash password and create user
    hashed_pwd = get_password_hash(user_in.Password)
    db_user = User(
        Username=user_in.Username,
        PasswordHash=hashed_pwd,
        FullName=user_in.FullName,
        Email=user_in.Email,
        Phone=user_in.Phone,
        Role="Customer",  # Force Role as Customer for public registration
        Status="Active"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticates a user and issues a JWT access token."""
    user = db.query(User).filter(User.Username == login_data.Username).first()
    if not user or not verify_password(login_data.Password, user.PasswordHash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if user.Status != "Active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is blocked or inactive"
        )

    # Create access token containing username and role
    access_token = create_access_token(
        data={"sub": user.Username, "role": user.Role}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.Role,
        "fullname": user.FullName,
        "username": user.Username,
        "profile_image": user.ProfileImage,
        "userid": user.UserID
    }
