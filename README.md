# ZenTra Store - Full-Stack Khmer E-Commerce Clothing Website

ZenTra Store is a premium, modern, and production-ready full-stack e-commerce clothing store designed with a Khmer shopping aesthetic. It features a responsive customer store, a complete role-based admin panel, real-time WebSocket alerts (new orders and stock changes), and secure JWT login credentials.

---

## 🚀 Tech Stack

### Frontend
- **Framework:** React.js (Vite template)
- **Styling:** Tailwind CSS & Custom CSS (Glassmorphism & micro-animations)
- **State Management:** React Context API (Cart & LocalStorage persistence)
- **Icons:** Lucide React
- **Charts:** Recharts (Sales dashboard analytics)
- **API Client:** Axios (automatic JWT token headers via interceptors)

### Backend
- **Framework:** Python FastAPI (REST API + WebSockets)
- **Database Engine:** SQLAlchemy ORM
  - **Primary:** SQL Server (via `pyodbc` driver)
  - **Fallback:** SQLite (automatically logs a warning and runs locally on `zentra_store.db` if SQL Server is unreachable, ensuring instant execution)
- **Security:** Bcrypt password hashing + JWT OAuth2 authentication
- **Image System:** Multi-file image uploading served static `/uploads`
- **Real-Time Engine:** FastAPI WebSockets (instant dashboard broadcasts)

---

## 📁 Project Structure

```text
ZenTra_Store/
│
├── database.sql             # SQL Server Database schema creation and seeding
├── README.md                # Installation and User Guide
│
├── backend/
│   ├── app/
│   │   ├── database/        # Database session and fallback management
│   │   │   └── connection.py
│   │   ├── models/          # SQLAlchemy Database models
│   │   │   ├── __init__.py
│   │   │   └── models.py
│   │   ├── schemas/         # Pydantic validation schemas
│   │   │   ├── __init__.py
│   │   │   └── schemas.py
│   │   ├── routers/         # API Endpoint controllers
│   │   │   ├── auth.py
│   │   │   ├── categories.py
│   │   │   ├── products.py
│   │   │   ├── orders.py
│   │   │   ├── users.py
│   │   │   └── settings.py
│   │   ├── auth.py          # JWT, passwords, and dependencies
│   │   ├── websocket.py     # Live WebSocket ConnectionManager
│   │   └── main.py          # FastAPI entrance, dashboard stats, database seeder
│   │
│   ├── uploads/             # Static file uploads (logo, products, etc.)
│   ├── .env                 # Backend configurations (JWT secrets, DB URLs)
│   └── requirements.txt     # Python libraries list
│
└── frontend/
    ├── src/
    │   ├── assets/          # Static local assets (logo)
    │   ├── components/      # Reusable UI widgets (Navbar, Footer, ProductCard)
    │   ├── context/         # Shopping Cart context provider
    │   ├── services/        # Axios API client functions
    │   ├── pages/           # Customer pages (Home, Products, Details, Cart, Checkout, Auth)
    │   ├── admin/           # Admin Dashboard layout and view pages
    │   ├── App.jsx          # Route mapping and core router
    │   └── main.jsx         # DOM bootstraper
    │
    ├── tailwind.config.js   # Tailwind style layouts & Khmer fonts settings
    ├── postcss.config.js    # PostCSS preprocessor config
    └── package.json         # React project dependencies
```

---

## 🛠️ Installation & Setup Guide

### 1. Database Setup (SQL Server)
1. Open **SQL Server Management Studio (SSMS)**.
2. Connect to your SQL Server instance.
3. Open and execute the [database.sql](file:///C:/Users/Chansokpheaktra_Phy/Desktop/ZenTra_Store/database.sql) script to create the tables (`Users`, `Products`, `Categories`, `Orders`, `OrderDetails`, `StoreSettings`) and seed default data.

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```powershell
   cd backend
   ```
2. Create and activate a Python virtual environment (recommended):
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install the dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
4. Verify/Modify the configuration details inside the [.env](file:///C:/Users/Chansokpheaktra_Phy/Desktop/ZenTra_Store/backend/.env) file:
   - For SQL Server Windows Authentication:
     `DATABASE_URL=mssql+pyodbc://@localhost/ZenTraDB?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes`
   - For SQL Server SQL Authentication:
     `DATABASE_URL=mssql+pyodbc://sa:YourPassword123@localhost/ZenTraDB?driver=ODBC+Driver+17+for+SQL+Server`
   - *Note: If SQL Server connection fails, the system automatically falls back to an SQLite file (`zentra_store.db`) to ensure immediate availability for development.*

5. Run the FastAPI development server:
   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```
   The backend API documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```powershell
   cd frontend
   ```
2. Install node packages:
   ```powershell
   npm install
   ```
3. Start the Vite React development server:
   ```powershell
   npm run dev
   ```
   Open your browser and navigate to: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Developer Test Credentials

Use these credentials to log in and test different user interfaces:

| Username | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| **admin** | `admin123` | **Admin** | Full management access, including Users page. |
| **staff** | `admin123` | **Staff** | Manage products, categories, settings, and orders. |
| **customer** | `admin123` | **Customer** | Basic retail shopper profile with order history. |

---

## 📡 API Documentation Summary

### 🔐 Authentication
* `POST /api/register` - Create customer credentials.
* `POST /api/login` - Verify password and retrieve JWT access token.

### 🛍️ Products
* `GET /api/products` - List products (filters: `search`, `category_id`, `min_price`, `max_price`).
* `GET /api/products/{id}` - Retrieve detailed info for a product.
* `POST /api/products` - Add a new product (Staff/Admin).
* `PUT /api/products/{id}` - Edit product info (Staff/Admin).
* `DELETE /api/products/{id}` - Soft delete a product (updates status to 'Inactive') (Staff/Admin).
* `POST /api/products/upload-image` - File upload handler for product images (Staff/Admin).

### 🏷️ Categories
* `GET /api/categories` - Fetch all categories.
* `POST /api/categories` - Create category (Staff/Admin).
* `PUT /api/categories/{id}` - Edit category details (Staff/Admin).
* `DELETE /api/categories/{id}` - Delete category (Staff/Admin).

### 📦 Orders
* `POST /api/orders` - Process checkout (deducts stock, sends WebSocket notification). Guest checkouts allowed.
* `GET /api/orders` - List orders. Customers see their own; Admins/Staff see all orders.
* `GET /api/orders/{id}` - Detailed order invoice.
* `PUT /api/orders/{id}` - Modify OrderStatus or PaymentStatus (Restores stock if set to `Cancelled`).

### 👥 Users
* `GET /api/users` - List users (Admin only).
* `POST /api/users` - Create user accounts (Admin only).
* `PUT /api/users/{id}` - Edit user details/roles (Admin only).
* `DELETE /api/users/{id}` - Delete user accounts (Admin only).

### ⚙️ Settings & Analytics
* `GET /api/settings` - Public store contacts.
* `PUT /api/settings` - Modify store name, contacts, and logo (Staff/Admin).
* `GET /api/dashboard/stats` - Income aggregates and chart dates (Staff/Admin).

---

## 🔔 Real-Time WebSocket Alerts
- **Endpoint:** `ws://localhost:8000/ws/notifications`
- **Events broadcasted:**
  - `new_order` - Instantly notifies admin panel of new customer checkouts.
  - `product_updated` - Notifies of catalog stock edits.
  - `product_created` - Notifies of new stock additions.
  - `product_deleted` - Notifies of catalog soft deletes.
  - `order_updated` - Notifies of order status updates.
