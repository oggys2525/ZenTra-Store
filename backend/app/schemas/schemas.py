from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

# ========================================================
# Token Schemas
# ========================================================
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    fullname: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# ========================================================
# Category Schemas
# ========================================================
class CategoryBase(BaseModel):
    CategoryName: str
    Status: str = "Active"

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    CategoryID: int

    model_config = ConfigDict(from_attributes=True)

# ========================================================
# Product Schemas
# ========================================================
class ProductBase(BaseModel):
    ProductName: str
    CategoryID: Optional[int] = None
    Description: Optional[str] = None
    Price: Decimal
    DiscountPrice: Optional[Decimal] = None
    Stock: int = 0
    Size: Optional[str] = None # Comma-separated sizes e.g., 'S,M,L'
    Color: Optional[str] = None # Comma-separated colors e.g., 'Red,Blue'
    Status: str = "Active"

class ProductCreate(ProductBase):
    Image: Optional[str] = None

class ProductUpdate(BaseModel):
    ProductName: Optional[str] = None
    CategoryID: Optional[int] = None
    Description: Optional[str] = None
    Price: Optional[Decimal] = None
    DiscountPrice: Optional[Decimal] = None
    Stock: Optional[int] = None
    Size: Optional[str] = None
    Color: Optional[str] = None
    Image: Optional[str] = None
    Status: Optional[str] = None

class Product(ProductBase):
    ProductID: int
    Image: Optional[str] = None
    CreatedDate: datetime
    UpdatedDate: datetime
    category: Optional[Category] = None

    model_config = ConfigDict(from_attributes=True)

# ========================================================
# User Schemas
# ========================================================
class UserBase(BaseModel):
    Username: str
    FullName: str
    Email: Optional[EmailStr] = None
    Phone: Optional[str] = None
    Role: str = "Customer" # Admin, Staff, Customer
    Status: str = "Active"

class UserCreate(UserBase):
    Password: str

class UserUpdate(BaseModel):
    FullName: Optional[str] = None
    Email: Optional[EmailStr] = None
    Phone: Optional[str] = None
    Role: Optional[str] = None
    Status: Optional[str] = None
    Password: Optional[str] = None

class User(UserBase):
    UserID: int
    CreatedDate: datetime

    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    Username: str
    Password: str

# ========================================================
# Order Schemas
# ========================================================
class OrderDetailBase(BaseModel):
    ProductID: int
    Quantity: int
    Price: Decimal

class OrderDetailCreate(OrderDetailBase):
    pass

class OrderDetail(OrderDetailBase):
    OrderDetailID: int
    OrderID: int
    product: Optional[Product] = None

    model_config = ConfigDict(from_attributes=True)

class OrderCreate(BaseModel):
    CustomerName: str
    CustomerPhone: str
    CustomerAddress: str
    PaymentMethod: str = "COD" # COD, KHQR
    Details: List[OrderDetailCreate]

class OrderStatusUpdate(BaseModel):
    OrderStatus: str # Pending, Confirmed, Shipping, Completed, Cancelled
    PaymentStatus: Optional[str] = None # Unpaid, Paid

class Order(BaseModel):
    OrderID: int
    UserID: Optional[int] = None
    CustomerName: str
    CustomerPhone: str
    CustomerAddress: str
    PaymentMethod: str
    TotalAmount: Decimal
    OrderStatus: str
    PaymentStatus: str
    CreatedDate: datetime
    details: List[OrderDetail] = []

    model_config = ConfigDict(from_attributes=True)

# ========================================================
# Store Settings Schemas
# ========================================================
class StoreSettingBase(BaseModel):
    StoreName: str
    Logo: Optional[str] = None
    Phone: Optional[str] = None
    Address: Optional[str] = None
    Facebook: Optional[str] = None
    Telegram: Optional[str] = None

class StoreSettingUpdate(BaseModel):
    StoreName: Optional[str] = None
    Logo: Optional[str] = None
    Phone: Optional[str] = None
    Address: Optional[str] = None
    Facebook: Optional[str] = None
    Telegram: Optional[str] = None

class StoreSetting(StoreSettingBase):
    model_config = ConfigDict(from_attributes=True)
