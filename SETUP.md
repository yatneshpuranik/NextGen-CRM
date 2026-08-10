# 🛠️ NextGen ERP + CRM — Setup & Local Execution Manual

A comprehensive guide for configuring, installing, running, and testing the **NextGen ERP & CRM Operations Portal** locally and preparing for production deployment.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Project Architecture & Structure](#2-project-architecture--structure)
3. [Environment Setup](#3-environment-setup)
   - [Backend Environment Variables](#backend-environment-variables)
   - [Frontend Environment Variables](#frontend-environment-variables)
4. [Backend Installation & Database Seeding](#4-backend-installation--database-seeding)
5. [Frontend Installation & Setup](#5-frontend-installation--setup)
6. [Running with Docker Compose](#6-running-with-docker-compose)
7. [Default Test Credentials (RBAC)](#7-default-test-credentials-rbac)
8. [API Sandbox & Documentation](#8-api-sandbox--documentation)
9. [Troubleshooting & Common FAQs](#9-troubleshooting--common-faqs)

---

## 1. Prerequisites

Ensure the following tools are installed on your machine:
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v9.0.0` or higher
- **Git**: Latest version
- **Database Options**:
  - Neon Serverless PostgreSQL (Recommended) or Local PostgreSQL (v14+)
- **Docker & Docker Compose**: (Optional, for containerized deployment)

---

## 2. Project Architecture & Structure

This repository is structured as a decoupled full-stack workspace:

```text
NextGen-CRM/
├── backend/                  # Express REST API (TypeScript)
│   ├── prisma/               # Prisma Schema & Database Seeder
│   │   ├── migrations/       # Database Migration Files
│   │   ├── schema.prisma     # Relational Database Schema
│   │   └── seed.ts           # Test Data Seeding Script
│   ├── src/
│   │   ├── config/           # Database, Swagger, & Logger Configurations
│   │   ├── controllers/      # Route Handler Logic
│   │   ├── middleware/       # JWT Auth & Security Middleware
│   │   ├── routes/           # REST API Endpoint Declarations
│   │   ├── services/         # Core Transactional & Business Logic
│   │   ├── validators/       # Input Request Validation Schemas
│   │   ├── app.ts            # Express Server Configuration
│   │   └── server.ts         # Server Entry Point
│   └── Dockerfile
├── frontend/                 # React SPA (Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── components/       # Reusable UI Components
│   │   ├── layouts/          # Dashboard Layout Shells
│   │   ├── pages/            # View Pages (CRM, Inventory, Challans)
│   │   ├── store/            # Redux Toolkit Slices & Actions
│   │   └── utils/            # Axios API Configuration
│   └── Dockerfile
├── SETUP.md                  # Setup & Execution Manual
├── DEPLOYMENT.md             # Production Deployment Architecture Guide
└── docker-compose.yml        # Docker Multi-Container Orchestration
```

---

## 3. Environment Setup

### Backend Environment Variables
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development

# PostgreSQL Connection Strings (Neon or Local PostgreSQL)
DATABASE_URL="postgresql://your_db_user:your_db_password@your_db_host:5432/your_db_name?sslmode=require"
DIRECT_URL="postgresql://your_db_user:your_db_password@your_db_host:5432/your_db_name?sslmode=require"

# JWT Authentication Configuration
JWT_SECRET="your_secure_jwt_secret_key_here"
JWT_EXPIRES_IN="72h"

# CORS Client Origin
CLIENT_URL="http://localhost:5173"

# Cloudinary Media Storage (Optional for product image uploads)
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

# Nodemailer SMTP Gateway (Optional for invoice PDF dispatches)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@example.com"
SMTP_PASS="your_smtp_app_password"
EMAIL_FROM="NextGen ERP <your_email@example.com>"
```

### Frontend Environment Variables
Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000
```

---

## 4. Backend Installation & Database Seeding

Open your terminal and navigate to the `backend/` directory:

```bash
cd backend

# 1. Install Node.js dependencies
npm install

# 2. Push Prisma database schema to PostgreSQL
npx prisma db push

# 3. Generate Prisma Client bindings
npx prisma generate


# 5. Start the backend development server
npm run dev
```

- **Backend REST API**: `http://localhost:5000`
- **Swagger Interactive API Documentation**: `http://localhost:5000/crm/api`

---

## 5. Frontend Installation & Setup

Open a second terminal window and navigate to the `frontend/` directory:

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start the Vite React development server
npm run dev
```

- **Frontend Application Portal**: `http://localhost:5173`

---

## 6. Running with Docker Compose

To launch the full stack (Frontend, Backend, and Database) using Docker:

```bash
# Build and run containers in detached mode
docker compose up --build -d

# Sync Prisma database schema inside the backend container
docker compose exec backend npx prisma db push

# Seed test data
docker compose exec backend npm run seed
```

- **Frontend Client**: `http://localhost:5173` (or `http://localhost:80`)
- **Backend API**: `http://localhost:5000`

---

## 7. Default Test Credentials (RBAC)

The database seeder initializes default accounts across all system roles:

| Role | Email | Password | Scope of Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `nextgen@admin.com` | `112233nextgen` | Full system control, user management, audit trails, database backup & restore. |
| **Sales** | `nextgen@sales.com` | `12345678` | Customer CRM management, sales delivery challan creation, view inventory catalog. |
| **Warehouse** | `nextgen@warehouse.com` | `12345678` | Product catalog management, stock allocations, inter-warehouse stock transfers. |
| **Accounts** | `nextgen@accounts.com` | `12345678` | Financial ledger overview, invoice PDF downloads, sales analytics reports. |


---

## 8. API Sandbox & Documentation

- **Swagger UI Interactive Documentation**: Available locally at `http://localhost:5000/crm/api` or in production at `https://api.yatneshpuranik.online/crm/api`.
- Supports Bearer Token authentication via the `Authorize` button.
- Comprehensive schemas included for `User`, `Customer`, `Product`, `Warehouse`, `Inventory`, `SalesChallan`, and `Report`.

---

## 9. Troubleshooting & Common FAQs

### Q1: `Error: Port 5000 is in use`
- **Fix**: Change `PORT=5001` in `backend/.env` and update `VITE_API_URL=http://localhost:5001` in `frontend/.env`.

### Q2: Prisma database connection timeout
- **Fix**: Ensure your `DATABASE_URL` connection string includes `?sslmode=require` if connecting to cloud PostgreSQL providers like Neon or Supabase.

### Q3: CORS error on frontend API calls
- **Fix**: Verify that `CLIENT_URL` in `backend/.env` matches your exact local frontend origin (`http://localhost:5173`).
