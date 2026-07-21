import os
import logging
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal

# Import database, models, and dependencies
from backend.app.database.connection import engine, Base, get_db, is_sqlite
from backend.app.models.models import Category, User, StoreSetting, Product, Order, PromoCode
from backend.app.auth import get_staff_or_admin_user, get_password_hash
from backend.app.websocket import manager

# Import routers
from backend.app.routers import auth, products, categories, orders, users, settings, promocodes

logger = logging.getLogger("main")

# Initialize FastAPI App
app = FastAPI(
    title="ZenTra Store API",
    description="Backend API for ZenTra Store - Khmer Clothing E-Commerce Website",
    version="1.0.0"
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production (e.g. ["http://localhost:5173"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists and mount it
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
if not os.path.isabs(UPLOAD_DIR):
    UPLOAD_DIR = os.path.abspath(UPLOAD_DIR)
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(orders.router)
app.include_router(users.router)
app.include_router(settings.router)
app.include_router(promocodes.router)

@app.get("/")
def read_root():
    return {
        "message": "ZenTra Store API is running successfully!",
        "status": "online",
        "docs_url": "/docs"
    }

# ========================================================
# Database Initialization & Seeding on Startup
# ========================================================
@app.on_event("startup")
def startup_event():
    """Initializes tables and seeds default data on startup."""
    logger.info("Initializing database tables...")
    try:
        # Create all tables if they don't exist
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified.")

        # Seed data using a temporary session
        db = Session(bind=engine)
        try:
            # 1. Seed Categories if empty
            if db.query(Category).count() == 0:
                logger.info("Seeding default categories...")
                categories_list = [
                    Category(CategoryName="Men", Status="Active"),
                    Category(CategoryName="Women", Status="Active"),
                    Category(CategoryName="Kids", Status="Active"),
                    Category(CategoryName="Shoes", Status="Active"),
                    Category(CategoryName="Accessories", Status="Active")
                ]
                db.add_all(categories_list)
                db.commit()

            # 2. Seed StoreSettings if empty
            if db.query(StoreSetting).count() == 0:
                logger.info("Seeding default store settings...")
                default_settings = StoreSetting(
                    StoreName="ZenTra Store",
                    Logo="/uploads/logo.png",
                    Phone="012 345 678",
                    Address="ផ្ទះលេខ ១២៣, ផ្លូវកម្ពុជាក្រោម, ភ្នំពេញ, ព្រះរាជាណាចក្រកម្ពុជា",
                    Facebook="https://facebook.com/zentra.store",
                    Telegram="https://t.me/zentra_store"
                )
                db.add(default_settings)
                db.commit()

            # 3. Seed Users if empty
            if db.query(User).count() == 0:
                logger.info("Seeding default users...")
                hashed_pwd = get_password_hash("admin123")
                admin_user = User(
                    Username="admin",
                    PasswordHash=hashed_pwd,
                    FullName="អ្នកគ្រប់គ្រងប្រព័ន្ធ",
                    Email="admin@zentra.com",
                    Phone="012345678",
                    Role="Admin",
                    Status="Active"
                )
                staff_user = User(
                    Username="staff",
                    PasswordHash=hashed_pwd,
                    FullName="បុគ្គលិកហាង",
                    Email="staff@zentra.com",
                    Phone="012345679",
                    Role="Staff",
                    Status="Active"
                )
                cust_user = User(
                    Username="customer",
                    PasswordHash=hashed_pwd,
                    FullName="អតិថិជន សាកល្បង",
                    Email="customer@gmail.com",
                    Phone="012345670",
                    Role="Customer",
                    Status="Active"
                )
                db.add_all([admin_user, staff_user, cust_user])
                db.commit()
                
            # 4. Seed sample products if empty (mostly for SQLite fallback)
            if db.query(Product).count() == 0:
                logger.info("Seeding default sample products...")
                sample_products = [
                    Product(
                        ProductName="អាវយឺតបុរស ម៉ូដទាន់សម័យ",
                        CategoryID=1,
                        Description="អាវយឺតដៃខ្លីសម្រាប់បុរស សាច់ក្រណាត់កប្បាស ១០០% ទន់ត្រជាក់ និងស្រួលពាក់។",
                        Price=Decimal("15.00"),
                        DiscountPrice=Decimal("12.00"),
                        Stock=50,
                        Size="M,L,XL,XXL",
                        Color="Black,White,Navy Blue",
                        Image="/uploads/products/mens_tshirt.jpg",
                        Status="Active"
                    ),
                    Product(
                        ProductName="រ៉ូបនារី ម៉ូដផ្កាស្អាតៗ",
                        CategoryID=2,
                        Description="រ៉ូបវែងម៉ូដផ្កាសម្រាប់នារី សមស្របសម្រាប់ដើរកម្សាន្ត ឬកម្មវិធីផ្សេងៗ។",
                        Price=Decimal("25.00"),
                        DiscountPrice=Decimal("20.00"),
                        Stock=30,
                        Size="S,M,L",
                        Color="Pink,Yellow",
                        Image="/uploads/products/women_dress.jpg",
                        Status="Active"
                    ),
                    Product(
                        ProductName="ស្បែកជើងប៉ាតាកីឡា ស្រាលស្រួលដើរ",
                        CategoryID=4,
                        Description="ស្បែកជើងប៉ាតាកីឡា ទម្ងន់ស្រាល ជួយការពារជើង និងធ្វើឱ្យងាយស្រួលរត់ ឬដើរ។",
                        Price=Decimal("45.00"),
                        DiscountPrice=Decimal("38.00"),
                        Stock=15,
                        Size="39,40,41,42,43",
                        Color="White,Black",
                        Image="/uploads/products/sports_shoes.jpg",
                        Status="Active"
                    )
                ]
                db.add_all(sample_products)
                db.commit()

            # 5. Seed Promo Codes if empty
            if db.query(PromoCode).count() == 0:
                logger.info("Seeding default promo codes...")
                default_promos = [
                    PromoCode(
                        Code="ZENTRA10",
                        DiscountType="Percentage",
                        DiscountValue=Decimal("10.00"),
                        MinOrderAmount=Decimal("10.00"),
                        ExpiryDate=datetime(2027, 12, 31, 23, 59, 59),
                        Status="Active"
                    ),
                    PromoCode(
                        Code="WELCOME5",
                        DiscountType="Fixed",
                        DiscountValue=Decimal("5.00"),
                        MinOrderAmount=Decimal("20.00"),
                        ExpiryDate=datetime(2027, 12, 31, 23, 59, 59),
                        Status="Active"
                    ),
                    PromoCode(
                        Code="KHMERNEWYEAR",
                        DiscountType="Percentage",
                        DiscountValue=Decimal("20.00"),
                        MinOrderAmount=Decimal("50.00"),
                        ExpiryDate=datetime(2027, 12, 31, 23, 59, 59),
                        Status="Active"
                    )
                ]
                db.add_all(default_promos)
                db.commit()

        except Exception as seed_err:
            db.rollback()
            logger.error(f"Error seeding database: {seed_err}")
        finally:
            db.close()
            
    except Exception as db_err:
        logger.error(f"Error initializing database: {db_err}")

# ========================================================
# Dashboard Analytics API
# ========================================================
@app.get("/api/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_staff_or_admin_user)
):
    """Calculates summary statistics and charts for the Admin Dashboard."""
    # 1. Total products
    total_products = db.query(Product).filter(Product.Status == "Active").count()
    
    # 2. Total orders
    total_orders = db.query(Order).count()
    
    # 3. Total customers (unique users or distinct names from orders)
    total_customers = db.query(User).filter(User.Role == "Customer").count()
    
    # 4. Total Income (Sum of Non-Cancelled orders)
    income_query = db.query(func.sum(Order.TotalAmount)).filter(Order.OrderStatus != "Cancelled").scalar()
    total_income = float(income_query) if income_query is not None else 0.0

    # 5. Sales Chart data (income over the last 7 days)
    # We group orders by date and sum TotalAmount
    chart_data = []
    today = datetime.utcnow().date()
    
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        start_time = datetime.combine(target_date, datetime.min.time())
        end_time = datetime.combine(target_date, datetime.max.time())
        
        # Query sum for this specific day
        day_income_query = db.query(func.sum(Order.TotalAmount))\
            .filter(Order.OrderStatus != "Cancelled")\
            .filter(Order.CreatedDate >= start_time)\
            .filter(Order.CreatedDate <= end_time)\
            .scalar()
            
        day_income = float(day_income_query) if day_income_query is not None else 0.0
        
        chart_data.append({
            "date": target_date.strftime("%d %b"),
            "income": day_income
        })

    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_customers": total_customers if total_customers > 0 else 1, # default mock fallback
        "total_income": total_income,
        "sales_chart": chart_data
    }

# ========================================================
# WebSocket Notification Router
# ========================================================
@app.websocket("/ws/notifications")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time order and stock updates.
    """
    await manager.connect(websocket)
    try:
        while True:
            # Keeps the socket connection open to listen for client events
            data = await websocket.receive_text()
            # Respond to client pings or queries if any
            await websocket.send_text(f"Message received: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
