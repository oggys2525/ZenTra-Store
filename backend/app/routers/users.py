from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.database.connection import get_db
from backend.app.models.models import User
from backend.app.schemas.schemas import User as UserSchema, UserCreate, UserUpdate
from backend.app.auth import get_admin_user, get_password_hash

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("", response_model=List[UserSchema])
def get_users(
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """Retrieves all registered users in the store (Requires Admin role)."""
    return db.query(User).order_by(User.UserID.desc()).all()

@router.post("", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """Creates a new user with a specific role and status (Requires Admin role)."""
    # Check if username exists
    existing_user = db.query(User).filter(User.Username == user_in.Username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Create new user
    db_user = User(
        Username=user_in.Username,
        PasswordHash=get_password_hash(user_in.Password),
        FullName=user_in.FullName,
        Email=user_in.Email,
        Phone=user_in.Phone,
        Role=user_in.Role,
        Status=user_in.Status
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/{user_id}", response_model=UserSchema)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """Updates a user's details, role, or status (Requires Admin role)."""
    db_user = db.query(User).filter(User.UserID == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Apply updates
    update_data = user_in.model_dump(exclude_unset=True)
    if "Password" in update_data and update_data["Password"]:
        db_user.PasswordHash = get_password_hash(update_data["Password"])
        del update_data["Password"]
        
    for key, value in update_data.items():
        if hasattr(db_user, key):
            setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """Deletes a user account (Requires Admin role). Prevents deleting yourself."""
    if db_user := db.query(User).filter(User.UserID == user_id).first():
        if db_user.Username == current_user.Username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot delete your own admin account."
            )
        db.delete(db_user)
        db.commit()
        return {"message": "User successfully deleted"}
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found"
    )
