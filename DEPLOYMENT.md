# NextGen ERP + CRM Production Deployment & Infrastructure Guide

This guide details the complete production deployment architecture, DNS configurations, environment variables, cloud infrastructure services, and deployment procedures for the NextGen ERP & CRM platform.

---

## 🌐 Production Domain & Deployment Overview

| Tier | Custom Domain | Provider / Host | Config Details |
| :--- | :--- | :--- | :--- |
| **DNS Registrar** | `yatneshpuranik.online` | **BigRock DNS** | CNAME & A record management |
| **Frontend Application** | `https://crm.yatneshpuranik.online` | **Vercel** | SPA static distribution + HTML5 routing |
| **Backend REST API** | `https://api.yatneshpuranik.online` | **Render PaaS** | Containerized Node.js (v18+) web service |
| **Swagger API Docs** | `https://api.yatneshpuranik.online/crm/api` | **Render / Express** | OpenAPI 3.0.0 Interactive Sandbox |
| **Database Engine** | `ep-noisy-mountain-azywjutl.aws.neon.tech` | **Neon Database** | Serverless PostgreSQL with SSL connection |

---

## 🏗️ Architecture & Component Flow

```mermaid
graph TD
    User[End User] -->|Resolves| DNS[BigRock DNS Server]
    DNS -->|crm.yatneshpuranik.online| Vercel[Vercel Frontend CDN]
    DNS -->|api.yatneshpuranik.online| Render[Render Web Service]
    Render -->|Prisma Engine| Neon[(Neon PostgreSQL Database)]
    Render -->|Image Storage| Cloudinary[Cloudinary Media CDN]
    Render -->|Notification Emails| Gmail[Gmail SMTP Gateway]
```

---

## ⚙️ Environment Variables Configuration

### 1. Backend Service (`backend/.env`)

```env
PORT=5000
NODE_ENV=production
API_BASE_URL=https://api.yatneshpuranik.online
CLIENT_URL=https://crm.yatneshpuranik.online

# Neon Serverless PostgreSQL Database Connections
DATABASE_URL="postgresql://neondb_owner:password@ep-noisy-mountain-azywjutl-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:password@ep-noisy-mountain-azywjutl.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# JWT Authentication Encryption Keys
JWT_SECRET="your_production_jwt_signing_key"
JWT_EXPIRES_IN=72h

# Cloudinary Storage Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gmail SMTP Mailer Credentials
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yatneshpuranik@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="NextGen ERP <yatneshpuranik@gmail.com>"
```

### 2. Frontend Application (`frontend/.env`)

```env
VITE_API_URL=https://api.yatneshpuranik.online
```

---

## ☁️ Step-by-Step Deployment Setup

### Step 1: BigRock DNS Setup
1. Log into your **BigRock Domain Control Panel** for domain `yatneshpuranik.online`.
2. Add a **CNAME Record**:
   - Host: `crm`
   - Value: `cname.vercel-dns.com`
3. Add a **CNAME Record**:
   - Host: `api`
   - Value: `nextgen-crm-backend.onrender.com` (or Render CNAME target)

---

### Step 2: Render Backend Web Service Setup
1. Log into [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Select your repository subfolder: `backend`.
3. Set configuration parameters:
   - **Environment:** `Node`
   - **Build Command:** `npm ci && npm run build && npx prisma generate`
   - **Start Command:** `node dist/server.js`
4. Add custom domain `api.yatneshpuranik.online` under Custom Domains settings.
5. Populate all environment variables listed above.

---

### Step 3: Vercel Frontend SPA Setup
1. Log into [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
2. Select repository subfolder: `frontend`.
3. Set build settings:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Define Environment Variable: `VITE_API_URL=https://api.yatneshpuranik.online`.
5. Add custom domain `crm.yatneshpuranik.online` under Project Settings → Domains.

---

## 🔍 Post-Deployment Health Check Checklist

- [x] **Root Health Route:** `GET https://api.yatneshpuranik.online/` returns status `200 OK`.
- [x] **Swagger OpenAPI Sandbox:** `GET https://api.yatneshpuranik.online/crm/api` loads interactive API documentation.
- [x] **Frontend SPA Routing:** Direct navigation to `https://crm.yatneshpuranik.online/dashboard` handles HTML5 fallback.
- [x] **Database Connectivity:** Prisma ORM successfully connects to Neon PostgreSQL.
- [x] **CORS Configuration:** Backend allows headers & credentials from `https://crm.yatneshpuranik.online`.
