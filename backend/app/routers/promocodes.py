from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from backend.app.database.connection import get_db
from backend.app.models.models import PromoCode
from backend.app.schemas.schemas import PromoCode as PromoCodeSchema, PromoCodeCreate, PromoCodeUpdate, PromoCodeValidate
from backend.app.auth import get_staff_or_admin_user

router = APIRouter(prefix="/api/promocodes", tags=["Promo Codes"])

@router.get("", response_model=List[PromoCodeSchema])
def get_promocodes(
    db: Session = Depends(get_db),
    current_user = Depends(get_staff_or_admin_user)
):
    """Retrieves list of all promo codes (Requires Staff or Admin)."""
    return db.query(PromoCode).all()

@router.post("", response_model=PromoCodeSchema, status_code=status.HTTP_201_CREATED)
def create_promocode(
    promo_in: PromoCodeCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_staff_or_admin_user)
):
    """Creates a new promo code (Requires Staff or Admin)."""
    # Check if code already exists
    exists = db.query(PromoCode).filter(PromoCode.Code == promo_in.Code.upper()).first()
    if exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Promo code already exists."
        )

    db_promo = PromoCode(
        Code=promo_in.Code.upper(),
        DiscountType=promo_in.DiscountType,
        DiscountValue=promo_in.DiscountValue,
        MinOrderAmount=promo_in.MinOrderAmount,
        ExpiryDate=promo_in.ExpiryDate,
        Status=promo_in.Status
    )
    db.add(db_promo)
    db.commit()
    db.refresh(db_promo)
    return db_promo

@router.put("/{promo_id}", response_model=PromoCodeSchema)
def update_promocode(
    promo_id: int,
    promo_in: PromoCodeUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_staff_or_admin_user)
):
    """Updates promo code details (Requires Staff or Admin)."""
    db_promo = db.query(PromoCode).filter(PromoCode.PromoID == promo_id).first()
    if not db_promo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promo code not found"
        )

    update_data = promo_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "Code":
            value = value.upper()
        setattr(db_promo, key, value)

    db.commit()
    db.refresh(db_promo)
    return db_promo

@router.delete("/{promo_id}", status_code=status.HTTP_200_OK)
def delete_promocode(
    promo_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_staff_or_admin_user)
):
    """Deletes a promo code permanently (Requires Staff or Admin)."""
    db_promo = db.query(PromoCode).filter(PromoCode.PromoID == promo_id).first()
    if not db_promo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promo code not found"
        )
    db.delete(db_promo)
    db.commit()
    return {"message": "Promo code deleted successfully"}

@router.post("/validate")
def validate_promocode(
    req: PromoCodeValidate,
    db: Session = Depends(get_db)
):
    """Validates a promo code and returns discount amount if valid."""
    promo = db.query(PromoCode).filter(PromoCode.Code == req.Code.upper()).first()
    if not promo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="រកមិនឃើញកូដបញ្ចុះតម្លៃនេះទេ / Promo code not found."
        )

    if promo.Status != "Active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="កូដបញ្ចុះតម្លៃនេះឈប់ដំណើរការហើយ / Promo code is inactive."
        )

    if promo.ExpiryDate and promo.ExpiryDate < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="កូដបញ្ចុះតម្លៃនេះបានហួសកំណត់ហើយ / Promo code has expired."
        )

    if req.OrderAmount < promo.MinOrderAmount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"តម្រូវឱ្យទិញយ៉ាងហោចណាស់ ${promo.MinOrderAmount:.2f} ដើម្បីប្រើកូដនេះ / Requires minimum order amount of ${promo.MinOrderAmount:.2f}."
        )

    # Calculate discount
    discount_amount = 0.0
    if promo.DiscountType == "Percentage":
        discount_amount = float(req.OrderAmount) * (float(promo.DiscountValue) / 100.0)
    elif promo.DiscountType == "Fixed":
        discount_amount = float(promo.DiscountValue)

    # Limit discount to not exceed order amount
    discount_amount = min(discount_amount, float(req.OrderAmount))

    return {
        "valid": True,
        "code": promo.Code,
        "discount_type": promo.DiscountType,
        "discount_value": float(promo.DiscountValue),
        "discount_amount": round(discount_amount, 2),
        "min_order_amount": float(promo.MinOrderAmount)
    }
