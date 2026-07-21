from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
import uuid

from backend.app.database.connection import get_db
from backend.app.models.models import User
from backend.app.schemas.schemas import User as UserSchema, UserCreate, UserUpdate
from backend.app.auth import get_admin_user, get_password_hash, get_current_user

# Define profiles directory
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
PROFILES_DIR = os.path.join(UPLOAD_DIR, "profiles")
os.makedirs(PROFILES_DIR, exist_ok=True)

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
        Status=user_in.Status,
        ProfileImage=user_in.ProfileImage
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/me", response_model=UserSchema)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Retrieves the logged-in user's profile details."""
    db_user = db.query(User).filter(User.UserID == current_user.UserID).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return db_user

@router.put("/me", response_model=UserSchema)
def update_my_profile(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Allows any logged-in user to update their own profile details."""
    db_user = db.query(User).filter(User.UserID == current_user.UserID).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    update_data = user_in.model_dump(exclude_unset=True)
    
    # Do not allow updating Role or Status via this endpoint
    if "Role" in update_data:
        del update_data["Role"]
    if "Status" in update_data:
        del update_data["Status"]
        
    if "Password" in update_data and update_data["Password"]:
        db_user.PasswordHash = get_password_hash(update_data["Password"])
        del update_data["Password"]
        
    for key, value in update_data.items():
        if hasattr(db_user, key):
            setattr(db_user, key, value)

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

@router.post("/upload-profile-image", status_code=status.HTTP_201_CREATED)
def upload_profile_image(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """Uploads a user profile image and returns the relative path (Available to all logged in users)."""
    # Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files (.jpg, .jpeg, .png, .webp) are allowed."
        )

    # Generate a unique filename to prevent collisions
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(PROFILES_DIR, unique_filename)
    
    # Save the file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save profile image: {str(e)}"
        )

    # Return relative path for database storage and serving
    relative_path = f"/uploads/profiles/{unique_filename}"
    return {"image_path": relative_path}

