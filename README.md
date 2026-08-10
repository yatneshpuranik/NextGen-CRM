# NextGen ERP + CRM Enterprise Platform

[![Production Live](https://img.shields.io/badge/Production-Live-emerald?style=for-the-badge)](https://crm.yatneshpuranik.online)
[![API Status](https://img.shields.io/badge/API-Online-085041?style=for-the-badge)](https://api.yatneshpuranik.online)
[![Swagger Docs](https://img.shields.io/badge/Swagger-API%20Docs-blue?style=for-the-badge)](https://api.yatneshpuranik.online/crm/api)

A unified, high-performance **Enterprise Sales, Multi-Warehouse Inventory & Customer Relationship Management (CRM) Platform**. Engineered with Node.js, Express, Prisma ORM, Neon PostgreSQL, React 18 (TypeScript), and TailwindCSS.

---

## 🌐 Production URLs

| Component | Live Production URL | Description |
| :--- | :--- | :--- |
| **Frontend Application** | [`https://crm.yatneshpuranik.online`](https://crm.yatneshpuranik.online) | High-speed Single Page App hosted on Vercel |
| **Backend REST API** | [`https://api.yatneshpuranik.online`](https://api.yatneshpuranik.online) | Enterprise Express REST API hosted on Render PaaS |
| **Swagger API Docs** | [`https://api.yatneshpuranik.online/crm/api`](https://api.yatneshpuranik.online/crm/api) | Interactive OpenAPI 3.0.0 API documentation |

---

## 📖 Technical Documentation Index

1. **[README.md](file:///d:/CRM/README.md)** (This Document) - All-in-one setup guide, local execution instructions, deployment manual, environment variables, test credentials, and architecture overview.
2. **[USER_MANUAL.md](file:///d:/CRM/USER_MANUAL.md)** - Comprehensive user operations manual covering CRM workflows, inventory movements, challan lifecycles, and system admin tasks.
3. **[PROJECT_ARCHITECTURE.md](file:///d:/CRM/PROJECT_ARCHITECTURE.md)** - Technical specifications, database ERD diagrams, Prisma schemas, request lifecycles, and Redux Toolkit state slices.
4. **[YATNESH_ENHANCEMENTS.md](file:///d:/CRM/YATNESH_ENHANCEMENTS.md)** - Custom enterprise extensions (Swagger OpenAPI, Cloudinary, Winston, PDFKit, Helmet, Rate Limiter).

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

---

## 🔑 Default Test Credentials (RBAC)

The system automatically initializes test accounts across all system roles:

| Role | Email | Password | Scope of Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `nextgen@admin.com` | `112233nextgen` | Full system control, user management, audit trails, database backup & restore. |
| **Sales** | `nextgen@sales.com` | `12345678` | Customer CRM management, sales delivery challan creation, view inventory catalog. |
| **Warehouse** | `nextgen@warehouse.com` | `12345678` | Product catalog management, stock allocations, inter-warehouse stock transfers. |
| **Accounts** | `nextgen@accounts.com` | `12345678` | Financial ledger overview, invoice PDF downloads, sales analytics reports. |

---

## 🛠️ Technology Stack

### Backend Core
- **Runtime:** Node.js (v18+ LTS) with TypeScript
- **Framework:** Express.js
- **Database ORM:** Prisma ORM
- **Primary Database:** Neon Serverless PostgreSQL
- **Security:** JWT (JSON Web Tokens), bcryptjs, Helmet, Express Rate Limit
- **API Sandbox Docs:** Swagger (`swagger-jsdoc` + `swagger-ui-express`)
- **PDF Engine:** PDFKit server-side generator
- **Mail Gateway:** Nodemailer with SMTP transport

### Frontend Client
- **Framework:** React 18 (Vite bundler)
- **Language:** TypeScript
- **State Management:** Redux Toolkit & React-Redux
- **Routing:** React Router Dom v6 (Protected routes & RBAC guards)
- **Styling:** Custom Design Tokens + TailwindCSS
- **Icons:** Lucide React

---

## ⚙️ Environment Variables Reference

### Backend Configuration (`backend/.env`)

```env
PORT=5000
NODE_ENV=production
API_BASE_URL=https://api.yatneshpuranik.online
CLIENT_URL=https://crm.yatneshpuranik.online

# Database Connection Strings (Neon Serverless PostgreSQL)
DATABASE_URL="postgresql://your_db_user:your_db_password@your_db_host:5432/your_db_name?sslmode=require"
DIRECT_URL="postgresql://your_db_user:your_db_password@your_db_host:5432/your_db_name?sslmode=require"

# JWT Authentication Keys
JWT_SECRET="your_production_jwt_signing_key"
JWT_EXPIRES_IN=72h

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gmail SMTP Mailer Credentials
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="NextGen ERP <your_email@gmail.com>"
```

### Frontend Configuration (`frontend/.env`)

```env
VITE_API_URL=https://api.yatneshpuranik.online
```

---

## 💻 Local Setup Guide

### 1. Prerequisites
- Node.js (v18+) & npm (v9+)
- Git & Docker (Optional)

### 2. Backend Installation & Server Run
```bash
cd backend

# Install dependencies
npm install

# Push database schema to PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Start Express server (auto-seeds default accounts)
npm run dev
```
- Backend REST API: `http://localhost:5000`
- Swagger Docs Sandbox: `http://localhost:5000/crm/api`

### 3. Frontend Installation & Client Run
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite React dev server
npm run dev
```
- Frontend SPA Application: `http://localhost:5173`

### 4. Running with Docker Compose (Alternative)
```bash
# Launch multi-container environment
docker compose up --build -d

# Sync Prisma database schema inside backend container
docker compose exec backend npx prisma db push
```

---

## ☁️ Production Deployment Guide

### 1. Domain & DNS Setup (BigRock)
1. Log into **BigRock Control Panel** for `yatneshpuranik.online`.
2. Configure **CNAME Record**: Host `crm` ➔ `cname.vercel-dns.com`.
3. Configure **CNAME Record**: Host `api` ➔ `nextgen-crm-backend.onrender.com`.

### 2. Backend Web Service (Render)
1. Connect GitHub repository `yatneshpuranik/NextGen-CRM` on [Render](https://dashboard.render.com/).
2. Subfolder: `backend`.
3. Build Command: `npm ci && npm run build && npx prisma generate`.
4. Start Command: `node dist/server.js`.
5. Add Custom Domain: `api.yatneshpuranik.online`.
6. Add environment variables listed in backend `.env` reference above.

### 3. Frontend SPA Client (Vercel)
1. Connect repository on [Vercel](https://vercel.com/).
2. Subfolder: `frontend`.
3. Framework Preset: `Vite`.
4. Build Command: `npm run build` | Output Directory: `dist`.
5. Environment Variable: `VITE_API_URL=https://api.yatneshpuranik.online`.
6. Add Custom Domain: `crm.yatneshpuranik.online`.

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

Designed and engineered for enterprise operations by **Yatnesh Puranik**. All rights reserved.
