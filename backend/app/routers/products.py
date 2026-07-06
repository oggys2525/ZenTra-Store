import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal
import uuid

from backend.app.database.connection import get_db
from backend.app.models.models import Product, Category
from backend.app.schemas.schemas import Product as ProductSchema, ProductCreate, ProductUpdate
from backend.app.auth import get_staff_or_admin_user
from backend.app.websocket import manager

router = APIRouter(prefix="/api/products", tags=["Products"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
PRODUCTS_DIR = os.path.join(UPLOAD_DIR, "products")

# Ensure the upload directory exists
os.makedirs(PRODUCTS_DIR, exist_ok=True)

@router.get("", response_model=List[ProductSchema])
def get_products(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Search by product name"),
    category_id: Optional[int] = Query(None, description="Filter by category"),
    min_price: Optional[Decimal] = Query(None, description="Minimum price filter"),
    max_price: Optional[Decimal] = Query(None, description="Maximum price filter"),
    status: Optional[str] = Query(None, description="Filter by product status (e.g. Active, Inactive)")
):
    """Retrieves list of products with search and filtering capabilities."""
    query = db.query(Product)

    if search:
        from sqlalchemy import or_
        query = query.join(Category, Product.CategoryID == Category.CategoryID, isouter=True).filter(
            or_(
                Product.ProductName.ilike(f"%{search}%"),
                Category.CategoryName.ilike(f"%{search}%")
            )
        )
        
    if category_id is not None:
        query = query.filter(Product.CategoryID == category_id)
        
    if min_price is not None:
        query = query.filter(Product.Price >= min_price)
        
    if max_price is not None:
        query = query.filter(Product.Price <= max_price)
        
    if status:
        query = query.filter(Product.Status == status)
    else:
        # Default to Active products for normal users, staff can explicitly query all
        query = query.filter(Product.Status == "Active")

    return query.order_by(Product.ProductID.desc()).all()

@router.get("/{product_id}", response_model=ProductSchema)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Retrieves a single product by ID."""
    product = db.query(Product).filter(Product.ProductID == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@router.post("", response_model=ProductSchema, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_staff_or_admin_user)
):
    """Creates a new product (Requires Admin or Staff role)."""
    # Verify category exists if provided
    if product_in.CategoryID:
        category = db.query(Category).filter(Category.CategoryID == product_in.CategoryID).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with ID {product_in.CategoryID} does not exist"
            )

    db_product = Product(
        ProductName=product_in.ProductName,
        CategoryID=product_in.CategoryID,
        Description=product_in.Description,
        Price=product_in.Price,
        DiscountPrice=product_in.DiscountPrice,
        Stock=product_in.Stock,
        Size=product_in.Size,
        Color=product_in.Color,
        Image=product_in.Image,
        Status=product_in.Status
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    # Broadcast notification about new product creation
    await manager.broadcast({
        "type": "product_created",
        "message": f"Product '{db_product.ProductName}' has been added.",
        "data": {
            "product_id": db_product.ProductID,
            "product_name": db_product.ProductName,
            "stock": db_product.Stock
        }
    })

    return db_product

@router.put("/{product_id}", response_model=ProductSchema)
async def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_staff_or_admin_user)
):
    """Updates product information (Requires Admin or Staff role)."""
    db_product = db.query(Product).filter(Product.ProductID == product_id).first()
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Verify category exists if being changed
    if product_in.CategoryID is not None:
        category = db.query(Category).filter(Category.CategoryID == product_in.CategoryID).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with ID {product_in.CategoryID} does not exist"
            )

    # Update fields
    update_data = product_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)

    db.commit()
    db.refresh(db_product)

    # Broadcast stock update or product update notification
    await manager.broadcast({
        "type": "product_updated",
        "message": f"Product '{db_product.ProductName}' has been updated.",
        "data": {
            "product_id": db_product.ProductID,
            "product_name": db_product.ProductName,
            "stock": db_product.Stock
        }
    })

    return db_product

@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_staff_or_admin_user)
):
    """Performs a SOFT delete by changing product status to Inactive (Requires Admin or Staff role)."""
    db_product = db.query(Product).filter(Product.ProductID == product_id).first()
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    db_product.Status = "Inactive"
    db.commit()
    
    # Broadcast deletion update
    await manager.broadcast({
        "type": "product_deleted",
        "message": f"Product '{db_product.ProductName}' was set to Inactive (Soft Deleted).",
        "data": {"product_id": product_id}
    })

    return {"message": "Product set to inactive (soft deleted)"}

@router.post("/upload-image", status_code=status.HTTP_201_CREATED)
def upload_image(
    file: UploadFile = File(...),
    current_user = Depends(get_staff_or_admin_user)
):
    """Uploads a product image and returns the relative path (Requires Admin or Staff role)."""
    # Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files (.jpg, .jpeg, .png, .webp) are allowed."
        )

    # Generate a unique filename to prevent collisions
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(PRODUCTS_DIR, unique_filename)
    
    # Save the file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save image: {str(e)}"
        )

    # Return relative path for database storage and serving
    relative_path = f"/uploads/products/{unique_filename}"
    return {"image_path": relative_path}
