from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from jose import jwt, JWTError
import os

from backend.app.database.connection import get_db
from backend.app.models.models import Order, OrderDetail, Product, User
from backend.app.schemas.schemas import Order as OrderSchema, OrderCreate, OrderStatusUpdate
from backend.app.auth import get_staff_or_admin_user, oauth2_scheme, SECRET_KEY, ALGORITHM
from backend.app.websocket import manager

router = APIRouter(prefix="/api/orders", tags=["Orders"])

def get_optional_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    """Helper to retrieve the current user if authenticated, otherwise returns None."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username:
            return db.query(User).filter(User.Username == username).first()
    except JWTError:
        pass
    return None

@router.post("", response_model=OrderSchema, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Creates a new order (Supports both logged-in users and guests).
    Deducts stock from products and broadcasts a real-time WebSocket event to the admin panel.
    """
    if not order_in.Details:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item."
        )

    # 1. Create Order record first
    db_order = Order(
        UserID=current_user.UserID if current_user else None,
        CustomerName=order_in.CustomerName,
        CustomerPhone=order_in.CustomerPhone,
        CustomerAddress=order_in.CustomerAddress,
        PaymentMethod=order_in.PaymentMethod,
        TotalAmount=0,  # Will calculate below
        OrderStatus="Pending",
        PaymentStatus="Unpaid"
    )
    db.add(db_order)
    db.flush()  # Flushes so db_order gets an OrderID

    total_amount = 0
    
    # 2. Process Order details and adjust stock
    for item in order_in.Details:
        # Check if product exists
        product = db.query(Product).filter(Product.ProductID == item.ProductID).first()
        if not product:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.ProductID} not found."
            )
            
        # Verify status
        if product.Status != "Active":
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{product.ProductName}' is no longer active."
            )

        # Check stock
        if product.Stock < item.Quantity:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.ProductName}'. Available: {product.Stock}, Requested: {item.Quantity}"
            )

        # Deduct stock
        product.Stock -= item.Quantity
        
        # Calculate line total (use DiscountPrice if available)
        price_to_charge = product.DiscountPrice if product.DiscountPrice is not None else product.Price
        line_total = price_to_charge * item.Quantity
        total_amount += line_total

        # Create OrderDetail row
        db_detail = OrderDetail(
            OrderID=db_order.OrderID,
            ProductID=product.ProductID,
            Quantity=item.Quantity,
            Price=price_to_charge
        )
        db.add(db_detail)

    # Update order total
    db_order.TotalAmount = total_amount
    db.commit()
    db.refresh(db_order)

    # 3. Broadcast real-time order notification to active WS connections (Admin Panel)
    await manager.broadcast({
        "type": "new_order",
        "message": f"New order #{db_order.OrderID} created by {db_order.CustomerName} ($ {db_order.TotalAmount:.2f})",
        "data": {
            "order_id": db_order.OrderID,
            "customer_name": db_order.CustomerName,
            "total_amount": float(db_order.TotalAmount),
            "payment_method": db_order.PaymentMethod,
            "created_date": db_order.CreatedDate.isoformat()
        }
    })

    return db_order

@router.get("", response_model=List[OrderSchema])
def get_orders(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """
    Retrieves orders.
    - If customer, retrieves only their orders.
    - If admin or staff, retrieves all orders.
    """
    # Extract user manually to handle roles
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required"
        )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    user = db.query(User).filter(User.Username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.Role in ["Admin", "Staff"]:
        # Staff/Admin can view all orders
        return db.query(Order).order_by(Order.OrderID.desc()).all()
    else:
        # Customer can view only their own orders
        return db.query(Order).filter(Order.UserID == user.UserID).order_by(Order.OrderID.desc()).all()

@router.get("/{order_id}", response_model=OrderSchema)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """Retrieves full details of a specific order by ID."""
    db_order = db.query(Order).filter(Order.OrderID == order_id).first()
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    # Check authorization (only owner or staff/admin can view)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user = db.query(User).filter(User.Username == username).first()
        if not user:
            raise Exception()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized to view this order"
        )

    if user.Role not in ["Admin", "Staff"] and db_order.UserID != user.UserID:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this order"
        )

    return db_order

@router.put("/{order_id}", response_model=OrderSchema)
async def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_staff_or_admin_user)
):
    """
    Updates order and/or payment status (Requires Admin or Staff role).
    If order is updated to Cancelled, restores product stock.
    """
    db_order = db.query(Order).filter(Order.OrderID == order_id).first()
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    old_status = db_order.OrderStatus
    new_status = status_update.OrderStatus

    # Update statuses
    db_order.OrderStatus = new_status
    if status_update.PaymentStatus:
        db_order.PaymentStatus = status_update.PaymentStatus

    # Restore stock if transition is from non-cancelled to Cancelled
    if old_status != "Cancelled" and new_status == "Cancelled":
        for detail in db_order.details:
            if detail.ProductID:
                product = db.query(Product).filter(Product.ProductID == detail.ProductID).first()
                if product:
                    product.Stock += detail.Quantity

    db.commit()
    db.refresh(db_order)

    # Broadcast notification to admin dashboard about order status update
    await manager.broadcast({
        "type": "order_updated",
        "message": f"Order #{db_order.OrderID} status changed from '{old_status}' to '{new_status}'",
        "data": {
            "order_id": db_order.OrderID,
            "old_status": old_status,
            "new_status": new_status,
            "payment_status": db_order.PaymentStatus
        }
    })

    return db_order
