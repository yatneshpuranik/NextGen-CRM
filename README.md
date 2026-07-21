# NextGen ERP + CRM Enterprise Platform

[![Production Live](https://img.shields.io/badge/Production-Live-emerald?style=for-the-badge)](https://crm.yatneshpuranik.online)
[![API Status](https://img.shields.io/badge/API-Online-085041?style=for-the-badge)](https://api.yatneshpuranik.online)
[![Swagger Docs](https://img.shields.io/badge/Swagger-API%20Docs-blue?style=for-the-badge)](https://api.yatneshpuranik.online/crm/api)

A unified, high-performance **Enterprise Sales, Multi-Warehouse Inventory & Customer Relationship Management (CRM) Platform**. Engineered with Node.js, Express, Prisma ORM, Neon PostgreSQL, React (TypeScript), and TailwindCSS.

---

## 🌐 Production URLs

| Component | Live Production URL | Description |
| :--- | :--- | :--- |
| **Frontend Application** | [`https://crm.yatneshpuranik.online`](https://crm.yatneshpuranik.online) | High-speed Single Page App hosted on Vercel |
| **Backend REST API** | [`https://api.yatneshpuranik.online`](https://api.yatneshpuranik.online) | Enterprise Express REST API hosted on Render PaaS |
| **Swagger OpenAPI Specs** | [`https://api.yatneshpuranik.online/crm/api`](https://api.yatneshpuranik.online/crm/api) | Interactive OpenAPI 3.0.0 API documentation |

---

## 🏗️ System Architecture & Infrastructure

```mermaid
graph TD
    Client[Browser / Client SPA] -->|HTTPS Requests| DNS[BigRock Custom Domain DNS]
    DNS -->|crm.yatneshpuranik.online| Vercel[Vercel Frontend CDN]
    DNS -->|api.yatneshpuranik.online| Render[Render Backend Server]
    Render -->|Prisma ORM| Neon[(Neon Serverless PostgreSQL)]
    Render -->|Media Assets| Cloudinary[Cloudinary CDN]
    Render -->|Transactional Mail| SMTP[Gmail SMTP Gateway]
```

### Infrastructure Partners
- **DNS & Custom Domains:** BigRock DNS (`yatneshpuranik.online`)
- **Backend Application:** Containerized Node.js runtime on [Render](https://render.com)
- **Frontend SPA Client:** Pre-compiled static React build on [Vercel](https://vercel.com)
- **Database Engine:** PostgreSQL Serverless cluster on [Neon DB](https://neon.tech)
- **Asset Storage:** [Cloudinary CDN](https://cloudinary.com) for product images and uploads

---

## 🚀 Key Modules & Capabilities

1. **360° Customer Relationship Management (CRM)**
   - Account lifecycle tracking (Leads, Retail, Wholesale, Distributors).
   - Complete contact history, GST numbers, and purchasing profiles.

2. **Multi-Warehouse Stock & Inventory Control**
   - Physical warehouse location mapping & inter-warehouse stock transfers.
   - Real-time stock balancing, automated low-stock warnings, and batch tracking.

3. **Sales Delivery Challans & Invoicing**
   - Full delivery challan lifecycle (`DRAFT` → `CONFIRMED` → `COMPLETED` → `CANCELLED`).
   - Server-side automated PDF generation for delivery challans & tax invoices.
   - Automatic stock deduction upon challan confirmation.

4. **System Audit Trails & Security Compliance**
   - Immutable audit logs capturing every user activity, transaction mutation, and setting update.
   - IP address logging and timestamped record history.

5. **Intelligent Email Delivery & Notification Logs**
   - Automated emails for order dispatches, stock alerts, and security alerts.
   - In-app notification bell with real-time unread badges and dispatch logs.

6. **Database Backup & One-Click Restore**
   - Automated JSON snapshot creation and full database restoration capabilities.
   - CSV export utilities for accounts, inventory, and sales records.

7. **Granular Role-Based Access Control (RBAC)**
   - Pre-configured roles: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`.

---

## 🛠️ Technology Stack

### Backend Core
- **Runtime:** Node.js (v18+ LTS) with TypeScript
- **Framework:** Express.js
- **Database ORM:** Prisma ORM
- **Database Engine:** Neon PostgreSQL Serverless
- **Auth & Security:** JWT (JSON Web Tokens), bcryptjs, Helmet, Express Rate Limit
- **API Specs:** Swagger (`swagger-jsdoc` + `swagger-ui-express`)
- **PDF Engine:** PDFKit server-side generator
- **Mail Gateway:** Nodemailer with SMTP transport

### Frontend Client
- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **State Management:** Redux Toolkit & React-Redux
- **Routing:** React Router Dom v6
- **Styling:** Custom Design Tokens + TailwindCSS
- **Icons:** Lucide React

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=production
API_BASE_URL=https://api.yatneshpuranik.online
CLIENT_URL=https://crm.yatneshpuranik.online

# Database Connections (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-host-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-host.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# JWT Authentication
JWT_SECRET=your_production_jwt_secret_key
JWT_EXPIRES_IN=72h

# Cloudinary Setup
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP Email Setup
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yatneshpuranik@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="NextGen ERP <yatneshpuranik@gmail.com>"
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=https://api.yatneshpuranik.online
```

---

## 💻 Local Development Setup

### 1. Backend Service
```bash
cd backend
npm install

# Run database migrations
npx prisma db push

# Populate seed data
npm run seed

# Start development server
npm run dev
```
Backend active at `http://localhost:5000` | Swagger UI at `http://localhost:5000/crm/api`.

### 2. Frontend Application
```bash
cd ../frontend
npm install

# Start Vite client
npm run dev
```
Client active at `http://localhost:5173`.

---

## 👥 Role-Based Access Control (RBAC) Matrix

| Module / Page | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard & Analytics** | Full | View | View | View |
| **Customer CRM** | Full | Full | Read-Only | Read-Only |
| **Product Catalog** | Full | Read-Only | Full | Read-Only |
| **Inventory & Stock** | Full | Read-Only | Full | Read-Only |
| **Warehouses & Transfers** | Full | Read-Only | Full | Read-Only |
| **Sales Challans** | Full | Full | Read-Only | Read-Only |
| **Audit Trails & System Logs** | Full | Restricted | Restricted | Restricted |
| **Backup & Database Restore** | Full | Restricted | Restricted | Restricted |
| **Company Settings** | Full | Restricted | Restricted | Restricted |

---

## 📄 License & Ownership

Designed and developed for enterprise operations by **Yatnesh Puranik**. All rights reserved.
