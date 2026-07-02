from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database.connection import Base

class Category(Base):
    __tablename__ = "Categories"

    CategoryID = Column(Integer, primary_key=True, index=True)
    CategoryName = Column(String(100), nullable=False)
    Status = Column(String(50), default="Active") # Active, Inactive

    products = relationship("Product", back_populates="category")

class User(Base):
    __tablename__ = "Users"

    UserID = Column(Integer, primary_key=True, index=True)
    Username = Column(String(50), unique=True, index=True, nullable=False)
    PasswordHash = Column(String(255), nullable=False)
    FullName = Column(String(150), nullable=False)
    Email = Column(String(100), nullable=True)
    Phone = Column(String(50), nullable=True)
    Role = Column(String(50), default="Customer") # Admin, Staff, Customer
    Status = Column(String(50), default="Active") # Active, Blocked
    CreatedDate = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="user")

class Product(Base):
    __tablename__ = "Products"

    ProductID = Column(Integer, primary_key=True, index=True)
    ProductName = Column(String(200), nullable=False, index=True)
    CategoryID = Column(Integer, ForeignKey("Categories.CategoryID", ondelete="SET NULL"), nullable=True)
    Description = Column(Text, nullable=True)
    Price = Column(Numeric(18, 2), nullable=False)
    DiscountPrice = Column(Numeric(18, 2), nullable=True)
    Stock = Column(Integer, default=0)
    Size = Column(String(100), nullable=True) # e.g., 'S,M,L'
    Color = Column(String(100), nullable=True) # e.g., 'Red,Blue'
    Image = Column(String(500), nullable=True)
    Status = Column(String(50), default="Active") # Active, Inactive
    CreatedDate = Column(DateTime, default=datetime.utcnow)
    UpdatedDate = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="products")
    order_details = relationship("OrderDetail", back_populates="product")

class Order(Base):
    __tablename__ = "Orders"

    OrderID = Column(Integer, primary_key=True, index=True)
    UserID = Column(Integer, ForeignKey("Users.UserID", ondelete="SET NULL"), nullable=True)
    CustomerName = Column(String(150), nullable=False)
    CustomerPhone = Column(String(50), nullable=False)
    CustomerAddress = Column(Text, nullable=False)
    PaymentMethod = Column(String(50), default="COD") # COD, KHQR
    TotalAmount = Column(Numeric(18, 2), nullable=False)
    OrderStatus = Column(String(50), default="Pending") # Pending, Confirmed, Shipping, Completed, Cancelled
    PaymentStatus = Column(String(50), default="Unpaid") # Unpaid, Paid
    CreatedDate = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    details = relationship("OrderDetail", back_populates="order", cascade="all, delete-orphan")

class OrderDetail(Base):
    __tablename__ = "OrderDetails"

    OrderDetailID = Column(Integer, primary_key=True, index=True)
    OrderID = Column(Integer, ForeignKey("Orders.OrderID", ondelete="CASCADE"), nullable=False)
    ProductID = Column(Integer, ForeignKey("Products.ProductID", ondelete="SET NULL"), nullable=True)
    Quantity = Column(Integer, nullable=False)
    Price = Column(Numeric(18, 2), nullable=False)

    order = relationship("Order", back_populates="details")
    product = relationship("Product", back_populates="order_details")

class StoreSetting(Base):
    __tablename__ = "StoreSettings"

    # Since it's a settings table with a single row, we can use StoreName as primary key
    StoreName = Column(String(100), primary_key=True)
    Logo = Column(String(500), nullable=True)
    Phone = Column(String(50), nullable=True)
    Address = Column(Text, nullable=True)
    Facebook = Column(String(200), nullable=True)
    Telegram = Column(String(200), nullable=True)
