from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.database.connection import get_db
from backend.app.models.models import Category
from backend.app.schemas.schemas import Category as CategorySchema, CategoryCreate
from backend.app.auth import get_staff_or_admin_user

router = APIRouter(prefix="/api/categories", tags=["Categories"])

@router.get("", response_model=List[CategorySchema])
def get_categories(db: Session = Depends(get_db)):
    """Retrieves all categories in the store."""
    return db.query(Category).all()

@router.post("", response_model=CategorySchema, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_staff_or_admin_user)
):
    """Creates a new product category (Requires Admin or Staff role)."""
    db_category = Category(
        CategoryName=category_in.CategoryName,
        Status=category_in.Status
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/{category_id}", response_model=CategorySchema)
def update_category(
    category_id: int,
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_staff_or_admin_user)
):
    """Updates an existing category (Requires Admin or Staff role)."""
    db_category = db.query(Category).filter(Category.CategoryID == category_id).first()
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    db_category.CategoryName = category_in.CategoryName
    db_category.Status = category_in.Status
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/{category_id}", status_code=status.HTTP_200_OK)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_staff_or_admin_user)
):
    """Deletes a category (Requires Admin or Staff role)."""
    db_category = db.query(Category).filter(Category.CategoryID == category_id).first()
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    db.delete(db_category)
    db.commit()
    return {"message": "Category successfully deleted"}
