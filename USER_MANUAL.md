# 📘 NextGen ERP + CRM — Complete Production User Manual & Technical Documentation

> **System Name**: NextGen Enterprise Resource Planning & Customer Relationship Management (NextGen ERP + CRM)  
> **Target Audience**: Business Executives, System Administrators, QA Engineers, & Software Developers  
> **Lead Architect & Lead Developer**: **Yatnesh Puranik**  
> **Version**: 1.0.0 (Production Ready)  
> **Repository**: [yatneshpuranik/NextGen-CRM](https://github.com/yatneshpuranik/NextGen-CRM.git)  

---

## 📑 TABLE OF CONTENTS
1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture & Folder Structure](#3-architecture--folder-structure)
4. [Implemented System Features](#4-implemented-system-features)
5. [Yatnesh Enhancements (Custom Enterprise Additions)](#5-yatnesh-enhancements-custom-enterprise-additions)
6. [Third-Party Services & Integrations](#6-third-party-services--integrations)
7. [API Endpoint Documentation](#7-api-endpoint-documentation)
8. [Roles & Role-Based Access Control (RBAC)](#8-roles--role-based-access-control-rbac)
9. [Installation & Setup Guide](#9-installation--setup-guide)
10. [Environment Variables Reference](#10-environment-variables-reference)
11. [Import & Export Subsystem](#11-import--export-subsystem)
12. [Automated Email Notification System](#12-automated-email-notification-system)
13. [Media & File Upload Subsystem](#13-media--file-upload-subsystem)
14. [Enterprise Dashboard & Analytics](#14-enterprise-dashboard--analytics)
15. [Security Architecture](#15-security-architecture)
16. [Known Limitations](#16-known-limitations)
17. [Future Scope & Roadmap](#17-future-scope--roadmap)
18. [Troubleshooting & FAQs](#18-troubleshooting--faqs)
19. [Production Deployment Guide](#19-production-deployment-guide)
20. [Credits & Acknowledgments](#20-credits--acknowledgments)

---

## 1. PROJECT OVERVIEW

**NextGen ERP + CRM** is a full-featured, enterprise-grade Mini ERP and Customer Relationship Management application designed specifically for small-to-medium enterprises (SMEs), distributors, and manufacturing businesses.

The platform bridges the gap between sales operations, customer relationships, warehouse inventory control, order fulfillment, tax invoicing, and financial reporting. Built on a modern decoupled architecture (Node.js + TypeScript Express backend and React 18 Vite frontend), NextGen ERP + CRM replaces fragmented spreadsheets with a single, real-time single source of truth.

### Key Functional Domains:
- **Customer Relationship Management**: Complete contact lifecycle, GSTIN tracking, customer categorization, and communication logs.
- **Product Catalog & Pricing**: Barcode/SKU management, brand categorization, purchase/selling price calculation, and tax slab configuration.
- **Inventory & Stock Management**: Multi-location stock allocation, live stock movements (Stock In, Stock Out, Adjustments, Damage & Returns), and minimum stock alarms.
- **Warehouse Operations**: Warehouse location registration and inter-warehouse stock transfer tracking.
- **Sales Order & Delivery Challan Processing**: Complete status lifecycle (`DRAFT` ➔ `CONFIRMED` ➔ `COMPLETED` / `CANCELLED`), automatic stock deduction, and PDF Tax Invoice generation.
- **Analytics & BI Reporting**: Role-tailored interactive charts, sales trends, top product performance, inventory valuation spread, and CSV/Excel/PDF exports.
- **System Administration**: Comprehensive audit logging, automated email activity logs, system configuration parameters, and database backup/export services.

---

## 2. TECHNOLOGY STACK

| Layer / Subsystem | Technology Used | Version / Details |
| :--- | :--- | :--- |
| **Frontend Core** | React 18, TypeScript, Vite | Fast HMR, type-safe JSX component rendering |
| **Frontend Styling** | Vanilla CSS Tokens, Lucide Icons | HSL curated design tokens (`index.css`), 100+ Lucide icons |
| **State Management** | Redux Toolkit, React-Redux | Normalized global slices, async thunks, local storage auth sync |
| **Backend Core** | Node.js, Express.js, TypeScript | RESTful modular architecture, strong type checks |
| **Database & ORM** | PostgreSQL (Neon DB), Prisma ORM | Relational database engine, type-safe queries, migration control |
| **Authentication** | JWT (JSON Web Tokens), Bcrypt.js | Bearer token auth, 10 salt rounds password hashing |
| **Data Ingestion & Export**| Fast-CSV, XLSX (SheetJS) | High-speed CSV parsing, Excel format generation |
| **Document Generation** | PDFKit | Vector-rendered A4 Delivery Challans & Tax Invoicing |
| **Email Transport** | Nodemailer | SMTP integration for welcome credentials, alerts, & invoices |
| **Media Hosting** | Cloudinary API, Multer | Secure cloud media storage (selected over AWS S3 for simplicity) |
| **API Documentation** | Swagger OpenAPI 3.0 | Interactive API testing documentation (`/crm/api`) |
| **Security & Middleware** | Helmet, Express-Rate-Limit, CORS | HTTP security headers, rate limiting (1000 req/15 min) |
| **Build & Tooling** | Vite, Nodemon, ts-node | Production Vite bundler, ts-node runtime environment |

---

## 3. ARCHITECTURE & FOLDER STRUCTURE

### High-Level Architecture Diagram
```
                     +---------------------------------------+
                     |         React 18 Frontend             |
                     |  (Redux Toolkit / Vite / Lucide-React)|
                     +-------------------+-------------------+
                                         |
                                  REST API / HTTP
                                         |
                     +-------------------v-------------------+
                     |       Express.js TypeScript Backend   |
                     |  (Auth / RBAC / RateLimiter / Helmet) |
                     +----+--------------+--------------+----+
                          |              |              |
                          |              |              |
            +-------------v----+   +-----v--------+   +-v------------+
            | Prisma ORM       |   | Cloudinary   |   | Nodemailer   |
            | (PostgreSQL Neon)|   | Media Hosting|   | Email Engine |
            +------------------+   +--------------+   +--------------+
```

### Backend Folder Structure (`d:\CRM\backend`)
```
backend/
├── prisma/
│   ├── migrations/             # Database migration SQL files
│   ├── schema.prisma           # Prisma database schema definition
│   └── seed.ts                 # Production seed script (Users, Warehouses, Settings)
├── src/
│   ├── config/                 # DB client, Logger, Swagger configuration
│   ├── controllers/            # Global controller handlers
│   ├── middleware/             # Auth, Role Guards, Rate Limiter, Error Middleware
│   ├── modules/                # Domain Modules (Auth, Customer, Product, Inventory, etc.)
│   │   ├── audit/
│   │   ├── auth/
│   │   ├── backup/
│   │   ├── customer/
│   │   ├── dashboard/
│   │   ├── email-log/
│   │   ├── import-export/
│   │   ├── inventory/
│   │   ├── notification/
│   │   ├── pdf/
│   │   ├── product/
│   │   ├── reports/
│   │   ├── sales-challan/
│   │   ├── search/
│   │   ├── settings/
│   │   ├── upload/
│   │   └── warehouse/
│   ├── routes/                 # Master V1 Router Router Index (`/crm/v1`)
│   ├── services/               # Email, PDF generation, Cloudinary storage services
│   ├── utils/                  # Response formatters, JWT sign/verify, Errors
│   ├── app.ts                  # Express application setup
│   └── server.ts               # HTTP server entrypoint
```

### Frontend Folder Structure (`d:\CRM\frontend`)
```
frontend/
├── public/                     # Static assets and icons
├── src/
│   ├── components/             # Reusable UI Components
│   │   ├── customers/
│   │   ├── products/
│   │   ├── ConfirmationModal.tsx
│   │   ├── ExportButton.tsx
│   │   ├── GlobalSearchModal.tsx
│   │   ├── ImportModal.tsx
│   │   ├── Loader.tsx
│   │   ├── StockTransferDialog.tsx
│   │   └── Toast.tsx
│   ├── layouts/                # Dashboard Layout & Sidebar navigation
│   │   └── DashboardLayout.tsx
│   ├── pages/                  # Top-level Page Views
│   │   ├── AnalyticsPage.tsx
│   │   ├── AuditLogsPage.tsx
│   │   ├── BackupRestorePage.tsx
│   │   ├── ChallanDetailsPage.tsx
│   │   ├── ChallanFormPage.tsx
│   │   ├── ChallansPage.tsx
│   │   ├── CustomerDetailsPage.tsx
│   │   ├── CustomerFormPage.tsx
│   │   ├── CustomersPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── EmailLogsPage.tsx
│   │   ├── InventoryDetailsPage.tsx
│   │   ├── InventoryPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ProductDetailsPage.tsx
│   │   ├── ProductFormPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── UnauthorizedPage.tsx
│   │   ├── WarehouseDetailsPage.tsx
│   │   ├── WarehouseFormPage.tsx
│   │   └── WarehouseListPage.tsx
│   ├── store/                  # Redux Toolkit Slices & Store Configuration
│   │   ├── slices/
│   │   └── index.ts
│   ├── utils/                  # Axios interceptors, formatters, export utilities
│   ├── App.tsx                 # Root router configuration & Protected Routes
│   ├── index.css               # Global CSS Variable tokens & theme styling
│   └── main.tsx                # React DOM render entrypoint
```

---

## 4. IMPLEMENTED SYSTEM FEATURES

1. **Authentication & Identity**:
   - User Sign-Up (with role selection).
   - User Login with JWT Token return.
   - Profile Password Rotation (`Rotate Password` form).
   - Password reset workflow via security alert notifications.
2. **Customer Relationship Management**:
   - Customer creation, edit, view details, and soft deletion.
   - GSTIN format validation, email & phone uniqueness enforcement.
   - Multi-format customer list search, sorting, and pagination.
3. **Product Catalog Management**:
   - SKU and Barcode uniqueness verification.
   - Category and Brand classification.
   - Dynamic gross price calculation based on configurable GST percentages (5%, 12%, 18%, 28%).
   - Product image upload hosted on Cloudinary CDN.
4. **Multi-Location Inventory Management**:
   - Real-time stock intake (`STOCK_IN`), dispatch (`STOCK_OUT`), stock reconciliation (`ADJUSTMENT`), and damaged returns (`DAMAGE`/`RETURN`).
   - Atomic database locks preventing negative inventory levels.
   - Low stock warnings triggered when available stock drops below minimum threshold.
5. **Warehouse & Multi-Branch Operations**:
   - Register warehouse facilities (`WH-DEFAULT`, etc.).
   - Inter-warehouse inventory transfers (`StockTransferDialog`) with transaction logs.
6. **Sales Order & Delivery Challan Processing**:
   - Draft challan creation with automatic pricing math.
   - Confirmation workflow: deducting stock from inventory and creating sales ledger entries.
   - Status updates: `DRAFT` ➔ `CONFIRMED` ➔ `COMPLETED` or `CANCELLED` (stock auto-restored upon cancellation).
   - PDF Delivery Challans & Tax Invoices printable from list and detail views.
7. **Business Intelligence & Reporting**:
   - Interactive Recharts for Monthly Sales Revenue Trends, Top Products, and Stock Spread.
   - On-demand CSV, Excel, and PDF exports across reports.
8. **System Auditing & Security Logs**:
   - Audit trail logging every CREATE, UPDATE, DELETE, CONFIRM, and CANCEL action with user context and IP address.
   - Automated email transaction log (`EmailLog`) tracking recipient, status, and delivery timestamps.

---

## 5. YATNESH ENHANCEMENTS (CUSTOM ENTERPRISE ADDITIONS)

In addition to standard specifications, the following enterprise-grade custom enhancements were designed and implemented by **Yatnesh Puranik**:

1. **Role-Based Dynamic Sidebar & Workspace Navigation**:
   - Unauthorized navigation items are **100% removed from the DOM** (not grayed-out or disabled).
   - Personalizes the workspace for every role (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
2. **Role-Aware Dashboard & Widget Gating**:
   - Hides financial cards (Revenue, Gross Margin) from `WAREHOUSE` users and stock intake widgets from `SALES` users.
   - Suppresses background API requests for unauthorized widgets to prevent console 403 errors.
3. **Full-Featured Import Subsystem (`ImportModal.tsx`)**:
   - Universal CSV and XLSX file parser with sample template download, field mapping, row validation, and error reporting.
4. **Universal Multi-Format Export Subsystem (`ExportButton.tsx`)**:
   - Exports data directly to **CSV**, **Excel (XLSX)**, or **Printable PDF** across Customers, Products, Inventory, Delivery Challans, and Audit Logs.
5. **Cloudinary CDN Integration**:
   - Integrated Cloudinary REST API for fast, scalable product image uploads instead of local disk storage.
6. **Comprehensive Email Notification Suite**:
   - Sends automated welcome emails containing new user sign-in credentials (Name, Email, Role, initial Security Password).
   - Sends automated PDF Tax Invoice attachments to customers upon delivery confirmation.
   - Sends real-time low-stock alert emails to procurement teams.
7. **Global Search Modal (`GlobalSearchModal.tsx`)**:
   - Keyboard shortcut modal (`Ctrl+K` / `Cmd+K`) searching across Customers, Products, Warehouses, and Delivery Challans with role-aware query filtering.
8. **Interactive Swagger OpenAPI Documentation**:
   - Live interactive API testing UI hosted at `http://localhost:5000/crm/api` generated directly from JSDoc comments.
9. **Automated Production Database Seeder (`prisma/seed.ts`)**:
   - Seeds administrative accounts, default warehouse locations (`WH-DEFAULT`), and initial company branding settings.
10. **Lucide React Enterprise Icon Integration**:
    - Replaced generic text and emojis with crisp Lucide vector icons across the entire frontend.

---

## 6. THIRD-PARTY SERVICES & INTEGRATIONS

- **Cloudinary CDN**:
  - *Purpose*: Cloud image hosting and optimization.
  - *Reason*: Replaced AWS S3 to eliminate complex IAM configuration overhead while delivering secure CDN URLs for product assets.
- **Neon PostgreSQL**:
  - *Purpose*: Serverless PostgreSQL database engine with connection pooling.
- **Nodemailer**:
  - *Purpose*: Outbound SMTP engine for sending welcome credentials, tax invoices, and low stock warnings.
- **PDFKit**:
  - *Purpose*: Dynamic A4 vector PDF rendering engine for generating invoices, challans, and reports.
- **Swagger UI Express**:
  - *Purpose*: Serves interactive OpenAPI 3.0 documentation at `/crm/api`.

---

## 7. API ENDPOINT DOCUMENTATION

**Base API URL**: `http://localhost:5000/crm/v1`  
**Interactive Swagger Docs**: `http://localhost:5000/crm/api`

### 🔑 Authentication Module (`/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new user profile | Public / Admin |
| `POST` | `/auth/login` | Authenticate user & return JWT token | Public |
| `GET` | `/auth/me` | Fetch active user profile details | Authenticated |
| `POST` | `/auth/change-password` | Update current user password | Authenticated |

### 👥 Customers Module (`/customers`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/customers` | Fetch paginated customers list | ADMIN, SALES, ACCOUNTS |
| `POST` | `/customers` | Create new customer account | ADMIN, SALES |
| `GET` | `/customers/:id` | Fetch single customer profile | ADMIN, SALES, ACCOUNTS |
| `PUT` | `/customers/:id` | Update customer record | ADMIN, SALES |
| `DELETE` | `/customers/:id` | Soft delete customer record | ADMIN, SALES |

### 📦 Products Module (`/products`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Fetch paginated products list | All Roles |
| `POST` | `/products` | Create catalog product | ADMIN, WAREHOUSE |
| `GET` | `/products/:id` | Fetch single product details | All Roles |
| `PUT` | `/products/:id` | Update product details | ADMIN, WAREHOUSE |
| `DELETE` | `/products/:id` | Soft delete product | ADMIN, WAREHOUSE |

### 🏢 Inventory & Warehouses Module (`/inventory`, `/warehouses`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/inventory` | Fetch global inventory levels | All Roles |
| `POST` | `/inventory/transaction` | Record Stock In/Out/Adjustment | ADMIN, WAREHOUSE |
| `POST` | `/inventory/transfer` | Transfer stock between warehouses | ADMIN, WAREHOUSE |
| `GET` | `/warehouses` | Fetch registered warehouses | ADMIN, WAREHOUSE |
| `POST` | `/warehouses` | Register new warehouse facility | ADMIN, WAREHOUSE |

### 📄 Sales Delivery Challans Module (`/sales-challans`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/sales-challans` | Fetch paginated delivery challans | All Roles |
| `POST` | `/sales-challans` | Create draft delivery challan | ADMIN, SALES |
| `GET` | `/sales-challans/:id` | Fetch single challan details | All Roles |
| `PUT` | `/sales-challans/:id` | Update draft challan details | ADMIN, SALES |
| `DELETE` | `/sales-challans/:id` | Delete draft challan | ADMIN, SALES |
| `POST` | `/sales-challans/:id/confirm` | Confirm challan & deduct stock | ADMIN, SALES |
| `POST` | `/sales-challans/:id/cancel` | Cancel challan & restore stock | ADMIN, SALES |

### 📑 Document & PDF Generation Module (`/pdf`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/pdf/challan/:id` | Stream A4 Delivery Challan PDF | All Roles |
| `GET` | `/pdf/invoice/:id` | Stream A4 Tax Invoice PDF | All Roles |
| `GET` | `/pdf/report/inventory` | Stream Inventory Valuation PDF | ADMIN, WAREHOUSE, ACCOUNTS |

---

## 8. ROLES & ROLE-BASED ACCESS CONTROL (RBAC)

The system strictly enforces a 4-tier Role-Based Access Control Matrix:

| Module / Action | ADMIN 👨‍💼 | SALES 💼 | WAREHOUSE 🏭 | ACCOUNTS 📊 |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard** | Full View | Sales View | Stock View | Financial View |
| **Customers** | Full (CRUD) | Full (CRUD) | Hidden 🚫 | Read-Only 👁️ |
| **Products** | Full (CRUD) | Read-Only 👁️ | Full (CRUD) | Read-Only 👁️ |
| **Inventory** | Full (CRUD) | Hidden 🚫 | Full (CRUD) | Read-Only 👁️ |
| **Warehouses** | Full (CRUD) | Hidden 🚫 | Full (CRUD) | Hidden 🚫 |
| **Delivery Challans**| Full (CRUD) | Full (CRUD) | Dispatch Status 👁️ | Read-Only 👁️ |
| **Reports & Analytics**| All Reports | Sales Reports | Inventory Reports | Financial Reports |
| **Admin Panel** | Full Access | Hidden 🚫 | Hidden 🚫 | Hidden 🚫 |

---

## 9. INSTALLATION & SETUP GUIDE

### Prerequisites:
- **Node.js**: `v18.x` or `v20.x`
- **npm**: `v9.x` or `v10.x`
- **PostgreSQL Database**: Local PostgreSQL instance or remote database (Neon DB)

### Step-by-Step Installation:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yatneshpuranik/NextGen-CRM.git
   cd NextGen-CRM
   ```

2. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment Variables**:
   Create a `.env` file in `backend/` and `frontend/` as described in [Section 10](#10-environment-variables-reference).

5. **Run Prisma Migrations & Seed Database**:
   ```bash
   cd ../backend
   npx prisma migrate dev --name init
   npm run seed
   ```

6. **Launch Development Application**:
   - **Option A (Combined Root Runner)**:
     ```bash
     cd ..
     npm run dev
     ```
   - **Option B (Separate Terminals)**:
     - Terminal 1 (Backend): `cd backend && npm run dev` (Runs on `http://localhost:5000`)
     - Terminal 2 (Frontend): `cd frontend && npm run dev` (Runs on `http://localhost:5173`)

### Seed Account Credentials:
- **Administrator**: `admin@nextgen.com` | Password: `password123`
- **Sales Rep**: `sales@nextgen.com` | Password: `password123`
- **Warehouse Lead**: `warehouse@nextgen.com` | Password: `password123`
- **Financial Controller**: `accounts@nextgen.com` | Password: `password123`

---

## 10. ENVIRONMENT VARIABLES REFERENCE

### Backend Environment Variables (`backend/.env`):
```env
# Server Runtime
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection (Neon PostgreSQL / Local)
DATABASE_URL="postgresql://neondb_owner:npg_password@ep-noisy-mountain-pooler.aws.neon.tech/neondb?sslmode=require"

# JWT Security
JWT_SECRET=super_secret_jwt_access_key_nextgen_2026
JWT_EXPIRES_IN=1d

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yatneshpuranik@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM='"NextGen ERP Notifications" <yatneshpuranik@gmail.com>'
```

### Frontend Environment Variables (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/crm/v1
```

---

## 11. IMPORT & EXPORT SUBSYSTEM

### Import Subsystem (`ImportModal.tsx`):
- **Supported Formats**: `.csv`, `.xlsx`
- **Supported Modules**: Customers, Products, Inventory.
- **Capabilities**:
  - Sample template download.
  - Auto-mapping column headers (`Company Name`, `GSTIN`, `SKU`, `Purchase Price`).
  - Row-by-row data sanitization and batch insertion.

### Export Subsystem (`ExportButton.tsx`):
- **Supported Formats**: **CSV**, **Excel (XLSX)**, **PDF**
- **Supported Modules**: Customers, Products, Inventory, Delivery Challans, Audit Logs, Reports.

---

## 12. AUTOMATED EMAIL NOTIFICATION SYSTEM

1. **User Welcome Credentials Email**:
   - Triggered when an admin creates a user profile.
   - Delivers Name, Email, Role, and Security Password.
2. **Sales Tax Invoice Email**:
   - Triggered upon delivery challan confirmation.
   - Automatically attaches the generated A4 Tax Invoice PDF.
3. **Low Inventory Watchdog Email**:
   - Triggered when stock falls below safety minimums.
4. **Email Audit Logs (`/email-logs`)**:
   - Records every outbound email's status (`SENT` or `FAILED`), recipient, and timestamp.

---

## 13. MEDIA & FILE UPLOAD SUBSYSTEM

- **Engine**: Multer memory storage + Cloudinary API upload pipeline.
- **Validation**: Restricts uploads to valid image MIME types (`image/jpeg`, `image/png`, `image/webp`).
- **File Size Limit**: Enforces a strict 5MB maximum file size limit.

---

## 14. ENTERPRISE DASHBOARD & ANALYTICS

- **Role-Aware Summary Cards**:
  - Active Customers, Monthly Revenue, Pending Draft Orders, Low Stock Alerts.
- **Interactive Data Charts (Recharts)**:
  - 6-Month Gross Revenue Trend bar chart.
  - Top Selling Products performance table.
  - Low Stock Warning list with quick stock intake trigger.
  - System Audit Activity Feed.

---

## 15. SECURITY ARCHITECTURE

- **JWT Authentication**: Signed JWT tokens stored securely and validated on protected endpoints.
- **Bcrypt Password Hashing**: Passwords salted and hashed with 10 salt rounds.
- **Role Guards (`authorizeRoles`)**: Backend route guards preventing unauthorized API access.
- **Helmet Security Headers**: Enables protection against XSS, clickjacking, and MIME-sniffing.
- **Rate Limiting**: Limits IP traffic to 1000 requests per 15-minute window.

---

## 16. KNOWN LIMITATIONS

1. **Email SMTP Rate Limits**: Free Gmail SMTP transport limits outbound emails to 500 emails/day.
2. **PDF Large Data Truncation**: Single-page PDF rendering auto-paginates up to 50 line items per invoice.

---

## 17. FUTURE SCOPE & ROADMAP

- [ ] **Multi-Branch & Warehouse Hierarchy**: Hierarchical sub-locations per warehouse.
- [ ] **Purchase Orders & Vendor Management**: Supplier management and PO tracking.
- [ ] **Automated GST E-Way Bill Generation**: Integration with Indian GST portal APIs.
- [ ] **WhatsApp & SMS Alerts**: Integration with Twilio for instant mobile SMS and WhatsApp dispatch notifications.
- [ ] **Barcode & QR Code Scanning**: Mobile camera barcode scanning for stock intake and dispatch.

---

## 18. TROUBLESHOOTING & FAQS

### Q1: `listen EADDRINUSE: address already in use :::5000`
- **Cause**: A previous backend Node.js process is still bound to port 5000.
- **Fix**: Run `npx kill-port 5000` or `taskkill /F /IM node.exe`.

### Q2: Database Connection Failed (`Can't reach database server`)
- **Cause**: Invalid Neon PostgreSQL connection string or network connectivity issue.
- **Fix**: Check `DATABASE_URL` in `backend/.env` and verify your internet connection.

### Q3: Images not displaying after upload
- **Cause**: Invalid Cloudinary API credentials.
- **Fix**: Ensure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are correctly configured in `backend/.env`.

---

## 19. PRODUCTION DEPLOYMENT GUIDE

### Backend Deployment (Render / Railway / Heroku):
1. Connect GitHub repository `yatneshpuranik/NextGen-CRM`.
2. Set root directory to `backend`.
3. Set Build Command: `npm install && npm run build`.
4. Set Start Command: `npm run start`.
5. Configure Environment Variables (`DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_*`, `SMTP_*`).

### Frontend Deployment (Vercel / Netlify):
1. Connect GitHub repository `yatneshpuranik/NextGen-CRM`.
2. Set root directory to `frontend`.
3. Set Build Command: `npm run build`.
4. Set Output Directory: `dist`.
5. Set Environment Variable: `VITE_API_URL=https://your-backend-render-url.onrender.com/crm/v1`.

---

## 20. CREDITS & ACKNOWLEDGMENTS

- **Lead Application Architect & Lead Developer**: **Yatnesh Puranik**
- **Repository**: [github.com/yatneshpuranik/NextGen-CRM](https://github.com/yatneshpuranik/NextGen-CRM)

*This application was designed and engineered as a complete enterprise-grade ERP & CRM solution equipped with modern UI standards, robust security controls, and high-performance database management.*
