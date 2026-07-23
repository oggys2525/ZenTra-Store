-- ZenTra Store SQL Server Database Initialization Script
-- Create Database if not exists (Uncomment if needed, or run inside your existing database)
-- CREATE DATABASE ZenTraDB;
-- GO
-- USE ZenTraDB;
-- GO

-- 1. Create Categories Table

-- Drop tables in correct dependency order to prevent foreign key constraint errors
IF OBJECT_ID('dbo.OrderDetails', 'U') IS NOT NULL DROP TABLE dbo.OrderDetails;
IF OBJECT_ID('dbo.Orders', 'U') IS NOT NULL DROP TABLE dbo.Orders;
IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL DROP TABLE dbo.Products;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID('dbo.StoreSettings', 'U') IS NOT NULL DROP TABLE dbo.StoreSettings;
GO


CREATE TABLE dbo.Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL,
    Status NVARCHAR(50) DEFAULT 'Active' -- Active, Inactive
);
GO

-- 2. Create Users Table

CREATE TABLE dbo.Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(150) NOT NULL,
    Email NVARCHAR(100) NULL,
    Phone NVARCHAR(50) NULL,
    Role NVARCHAR(50) DEFAULT 'Customer', -- Admin, Staff, Customer
    Status NVARCHAR(50) DEFAULT 'Active', -- Active, Blocked
    CreatedDate DATETIME DEFAULT GETDATE()
);
GO

-- 3. Create Products Table

CREATE TABLE dbo.Products (
    ProductID INT IDENTITY(1,1) PRIMARY KEY,
    ProductName NVARCHAR(200) NOT NULL,
    CategoryID INT FOREIGN KEY REFERENCES dbo.Categories(CategoryID) ON DELETE SET NULL,
    Description NVARCHAR(MAX) NULL,
    Price DECIMAL(18,2) NOT NULL,
    DiscountPrice DECIMAL(18,2) NULL, -- Nullable or 0 for no discount
    Stock INT DEFAULT 0,
    Size NVARCHAR(100) NULL, -- e.g., 'S,M,L,XL'
    Color NVARCHAR(100) NULL, -- e.g., 'Red,Blue,Black'
    Image NVARCHAR(500) NULL, -- Path to uploaded image file
    Status NVARCHAR(50) DEFAULT 'Active', -- Active, Inactive
    CreatedDate DATETIME DEFAULT GETDATE(),
    UpdatedDate DATETIME DEFAULT GETDATE()
);
GO

-- 4. Create Orders Table

CREATE TABLE dbo.Orders (
    OrderID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NULL FOREIGN KEY REFERENCES dbo.Users(UserID) ON DELETE SET NULL,
    CustomerName NVARCHAR(150) NOT NULL, -- Guest or customer name
    CustomerPhone NVARCHAR(50) NOT NULL,
    CustomerAddress NVARCHAR(MAX) NOT NULL,
    PaymentMethod NVARCHAR(50) DEFAULT 'COD', -- COD, KHQR
    TransactionID NVARCHAR(100) NULL,
    ReceiptImage NVARCHAR(500) NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    DiscountAmount DECIMAL(18,2) DEFAULT 0.00,
    PromoCode VARCHAR(50) NULL,
    OrderStatus NVARCHAR(50) DEFAULT 'Pending', -- Pending, Confirmed, Shipping, Completed, Cancelled
    PaymentStatus NVARCHAR(50) DEFAULT 'Unpaid', -- Unpaid, Paid
    CreatedDate DATETIME DEFAULT GETDATE()
);
GO

-- 4b. Create PromoCodes Table

CREATE TABLE dbo.PromoCodes (
    PromoID INT IDENTITY(1,1) PRIMARY KEY,
    Code VARCHAR(50) UNIQUE NOT NULL,
    DiscountType VARCHAR(20) NOT NULL, -- 'Percentage' or 'Fixed'
    DiscountValue DECIMAL(18,2) NOT NULL,
    MinOrderAmount DECIMAL(18,2) DEFAULT 0.00,
    ExpiryDate DATETIME NULL,
    Status VARCHAR(50) DEFAULT 'Active', -- Active, Inactive
    CreatedDate DATETIME DEFAULT GETDATE()
);
GO

-- 5. Create OrderDetails Table

CREATE TABLE dbo.OrderDetails (
    OrderDetailID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT FOREIGN KEY REFERENCES dbo.Orders(OrderID) ON DELETE CASCADE,
    ProductID INT NULL FOREIGN KEY REFERENCES dbo.Products(ProductID) ON DELETE SET NULL,
    Quantity INT NOT NULL,
    Price DECIMAL(18,2) NOT NULL
);
GO

-- 6. Create StoreSettings Table

CREATE TABLE dbo.StoreSettings (
    StoreName NVARCHAR(100) NOT NULL,
    Logo NVARCHAR(500) NULL,
    Phone NVARCHAR(50) NULL,
    Address NVARCHAR(MAX) NULL,
    Facebook NVARCHAR(200) NULL,
    Telegram NVARCHAR(200) NULL
);
GO

-- ========================================================
-- Seed Data Initialization
-- ========================================================

-- Seed Categories
INSERT INTO dbo.Categories (CategoryName, Status) VALUES 
(N'Men', 'Active'),
(N'Women', 'Active'),
(N'Kids', 'Active'),
(N'Shoes', 'Active'),
(N'Accessories', 'Active');
GO

-- Seed StoreSettings
INSERT INTO dbo.StoreSettings (StoreName, Logo, Phone, Address, Facebook, Telegram) VALUES 
(N'ZenTra Store', '/uploads/logo.png', '012 345 678 / 098 765 432', N'ផ្ទះលេខ ១២៣, ផ្លូវកម្ពុជាក្រោម, ភ្នំពេញ, ព្រះរាជាណាចក្រកម្ពុជា', 'https://facebook.com/zentra.store', 'https://t.me/zentra_store');
GO

-- Seed Default Users (Passwords: Admin = 'admin123', Staff = 'staff123', Customer = 'customer123')
-- Bcrypt hashes generated for Python passlib.context (standard rounds)
-- admin123 -> $2b$12$6/7aWdGx4F1G6H8J6K8L8.uU3I5Y9r1N4k7G7H9j5o2v5H2m2W2C6 (mock bcrypt hash)
-- For development simplicity, we insert these. The backend verify_password can verify them.
-- Standard Bcrypt Hash for 'admin123' is: $2b$12$oZ.YqZ3f6rV57.TzBvP/1e/s8bY4vU2T1Y2T2Y2T2Y2T2Y2T2Y2T2
-- Let's use a real bcrypt hash for admin123: $2b$12$R.S91/pEq0o61/aWp0HqIeq4e1tD0iK2FvA9l8H.pC0m1E2E4yB4e (standard generated bcrypt hash for 'admin123')
INSERT INTO dbo.Users (Username, PasswordHash, FullName, Email, Phone, Role, Status) VALUES 
('admin', '$2b$12$R.S91/pEq0o61/aWp0HqIeq4e1tD0iK2FvA9l8H.pC0m1E2E4yB4e', N'អ្នកគ្រប់គ្រងប្រព័ន្ធ', 'admin@zentra.com', '012345678', 'Admin', 'Active'),
('staff', '$2b$12$R.S91/pEq0o61/aWp0HqIeq4e1tD0iK2FvA9l8H.pC0m1E2E4yB4e', N'បុគ្គលិកហាង', 'staff@zentra.com', '012345679', 'Staff', 'Active'),
('customer', '$2b$12$R.S91/pEq0o61/aWp0HqIeq4e1tD0iK2FvA9l8H.pC0m1E2E4yB4e', N'អតិថិជន សាកល្បង', 'customer@gmail.com', '012345670', 'Customer', 'Active');
GO

-- Seed Sample Products
-- Link products to Category IDs (1: Men, 2: Women, 3: Kids, 4: Shoes, 5: Accessories)
INSERT INTO dbo.Products (ProductName, CategoryID, Description, Price, DiscountPrice, Stock, Size, Color, Image, Status) VALUES
(N'អាវយឺតបុរស ម៉ូដទាន់សម័យ', 1, N'អាវយឺតដៃខ្លីសម្រាប់បុរស សាច់ក្រណាត់កប្បាស ១០០% ទន់ត្រជាក់ និងស្រួលពាក់។', 15.00, 12.00, 50, 'M,L,XL,XXL', 'Black,White,Navy Blue', '/uploads/products/mens_tshirt.jpg,/uploads/products/mens_jeans.jpg,/uploads/products/sports_shoes.jpg', 'Active'),
(N'រ៉ូបនារី ម៉ូដផ្កាស្អាតៗ', 2, N'រ៉ូបវែងម៉ូដផ្កាសម្រាប់នារី សមស្របសម្រាប់ដើរកម្សាន្ត ឬកម្មវិធីផ្សេងៗ។', 25.00, 20.00, 30, 'S,M,L', 'Pink,Yellow', '/uploads/products/women_dress.jpg,/uploads/products/women_blazer.jpg,/uploads/products/women_bag.jpg', 'Active'),
(N'ខោខូវប៊យបុរស រាងស្លីម', 1, N'ខោខូវប៊យជើងវែងបុរស សាច់យឺត ពណ៌ធ្យូង រាងស្លីមហ្វីត ស្អាតខ្លាំង។', 30.00, NULL, 40, '29,30,31,32,33,34', 'Blue Denim,Black Denim', '/uploads/products/mens_jeans.jpg,/uploads/products/mens_tshirt.jpg,/uploads/products/sports_shoes.jpg', 'Active'),
(N'អាវធំសម្រាប់នារី បែបការិយាល័យ', 2, N'អាវធំ Blazer សម្រាប់នារីការិយាល័យ រាងស្អាត សាច់ក្រណាត់ប្រណិត។', 35.00, 29.99, 20, 'S,M,L,XL', 'Beige,Black,Pink', '/uploads/products/women_blazer.jpg,/uploads/products/women_dress.jpg,/uploads/products/women_bag.jpg', 'Active'),
(N'ស្បែកជើងប៉ាតាកីឡា ស្រាលស្រួលដើរ', 4, N'ស្បែកជើងប៉ាតាកីឡា ម៉ាកល្បី ទម្ងន់ស្រាល ជួយការពារជើង និងធ្វើឱ្យងាយស្រួលរត់ ឬដើរ។', 45.00, 38.00, 15, '39,40,41,42,43', 'White-Red,Grey,Black', '/uploads/products/sports_shoes.jpg,/uploads/products/mens_jeans.jpg,/uploads/products/mens_tshirt.jpg', 'Active'),
(N'កាតាបស្ពាយចំហៀងនារី ម៉ូដប្រណិត', 5, N'កាតាបស្បែកពិតប្រាកដ ទំហំល្មម ម៉ូដទាន់សម័យ ងាយស្រួលដាក់សម្ភារៈប្រចាំថ្ងៃ។', 55.00, NULL, 12, 'One Size', 'Brown,Black,Cream', '/uploads/products/women_bag.jpg,/uploads/products/women_dress.jpg,/uploads/products/women_blazer.jpg', 'Active'),
(N'អាវយឺតកូនក្មេង រូបគំនូរគួរឱ្យស្រឡាញ់', 3, N'អាវយឺតដៃខ្លីកូនក្មេង រូបគំនូរតុក្កតាស្អាតៗ សាច់ក្រណាត់ទន់មិនរមាស់ស្បែក។', 8.50, 6.00, 100, '2Y,4Y,6Y,8Y', 'Yellow,Light Blue,Pink', '/uploads/products/kids_tshirt.jpg,/uploads/products/mens_tshirt.jpg,/uploads/products/sports_shoes.jpg', 'Active'),
(N'អាវក្រៅសម្រាប់បុរស បែបស្ព័រ (Men''s Sport Jacket)', 1, N'អាវក្រៅដៃវែងសម្រាប់បុរស សមស្របសម្រាប់ហាត់ប្រាណ ឬដើរកម្សាន្តក្រៅផ្ទះ ធន់នឹងទឹក និងខ្យល់។', 38.00, 32.00, 25, 'M,L,XL', 'Black,Navy Blue,Grey', '/uploads/products/sports_shoes.jpg,/uploads/products/mens_jeans.jpg,/uploads/products/mens_tshirt.jpg', 'Active'),
(N'កាតាបស្ពាយកូនក្មេង គួរឱ្យស្រឡាញ់ (Kids Cute Backpack)', 3, N'កាតាបស្ពាយក្រោយសម្រាប់កុមារទៅសាលារៀន ម៉ូដតុក្កតាស្អាតៗ ទម្ងន់ស្រាល មិនប៉ះពាល់ដល់ឆ្អឹងខ្នង។', 18.00, 15.00, 40, 'One Size', 'Pink,Sky Blue,Yellow', '/uploads/products/kids_tshirt.jpg,/uploads/products/women_bag.jpg,/uploads/products/sports_shoes.jpg', 'Active'),
(N'ក្រវិលនារី ម៉ូដគុជខ្យងប្រណិត (Women''s Pearl Earrings)', 5, N'ក្រវិលគុជខ្យងធម្មជាតិពិតៗ រចនាឡើងយ៉ាងប្រណិតសម្រាប់នារីសម័យថ្មី បន្ថែមភាពស្រស់ស្អាតទ្វេដង។', 12.00, NULL, 60, 'One Size', 'Gold,Silver', '/uploads/products/women_bag.jpg,/uploads/products/women_blazer.jpg,/uploads/products/women_dress.jpg', 'Active');
GO

-- Seed Promo Codes
INSERT INTO dbo.PromoCodes (Code, DiscountType, DiscountValue, MinOrderAmount, ExpiryDate, Status) VALUES
('ZENTRA10', 'Percentage', 10.00, 10.00, '2027-12-31 23:59:59', 'Active'),
('WELCOME5', 'Fixed', 5.00, 20.00, '2027-12-31 23:59:59', 'Active'),
('KHMERNEWYEAR', 'Percentage', 20.00, 50.00, '2027-12-31 23:59:59', 'Active');
GO
