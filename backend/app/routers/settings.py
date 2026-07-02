from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.models.models import StoreSetting
from backend.app.schemas.schemas import StoreSetting as StoreSettingSchema, StoreSettingUpdate
from backend.app.auth import get_staff_or_admin_user

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("", response_model=StoreSettingSchema)
def get_settings(db: Session = Depends(get_db)):
    """Retrieves store settings. If none exist, initializes a default record."""
    settings = db.query(StoreSetting).first()
    if not settings:
        # Create default store settings if table is empty
        settings = StoreSetting(
            StoreName="ZenTra Store",
            Logo="/uploads/logo.png",
            Phone="012 345 678",
            Address="Phnom Penh, Cambodia",
            Facebook="https://facebook.com/zentra.store",
            Telegram="https://t.me/zentra_store"
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("", response_model=StoreSettingSchema)
def update_settings(
    settings_in: StoreSettingUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_staff_or_admin_user)
):
    """Updates store settings (Requires Admin or Staff role)."""
    settings = db.query(StoreSetting).first()
    if not settings:
        # If it doesn't exist, create it
        settings = StoreSetting(StoreName="ZenTra Store")
        db.add(settings)
        db.commit()
        db.refresh(settings)

    update_data = settings_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)
    return settings
