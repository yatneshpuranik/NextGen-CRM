# NextGen ERP + CRM Production Deployment Manual

This document outlines deployment architectures, environment variables, Docker run guides, and validation checklists.

---

## 🚀 Deployment Targets & Architecture

```mermaid
graph TD
    Client[Web Browser Client] -->|Vercel Hosting CDN| Frontend[React Client UI]
    Frontend -->|Rest API Requests| Backend[Express Service on Render]
    Backend -->|Database Schema ORM| Database[Postgres Database on Neon/AWS]
    Backend -->|Media files storage| Cloudinary[Cloudinary Cloud Storage]
    Backend -->|Alert emails dispatch| SMTP[Nodemailer SMTP Mailer]
```

---

## 🛠️ Environment Variables Configuration

### Backend Env Keys (`backend/.env`)
Create a `.env` file inside the `backend` directory:
```ini
PORT=5000
NODE_ENV=production
CLIENT_URL=https://nextgen-erp-client.vercel.app

# Database Connection Strings (Neon/Prisma compatible)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# JWT Configs
JWT_SECRET="YOUR_SECURE_JWT_SIGNING_PASSPHRASE"
JWT_EXPIRES_IN=72h

# Nodemailer SMTP Server Credentials
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yatneshpuranik@gmail.com
SMTP_PASS=jtrsbclgttjbnzvh
EMAIL_FROM='"NextGen ERP Support" <yatneshpuranik@gmail.com>'
SYSTEM_ALERT_EMAIL=yatneshpuranik@gmail.com

# Cloudinary Storage Credentials
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend Env Keys (`frontend/.env`)
Create a `.env` or `.env.production` inside the `frontend` directory:
```ini
VITE_API_URL=https://nextgen-erp-backend.onrender.com/crm/v1
```

---

## 🐳 Docker Deployment Setup
To run the database, backend, and frontend containers orchestrated on your local machine or server:

1. **Verify Docker Status:** Ensure the Docker daemon is active.
2. **Launch Orchestration:**
   ```bash
   docker compose up --build -d
   ```
3. **Database Migration Sync:**
   Run Prisma schema migrations on the active database container:
   ```bash
   docker compose exec backend npx prisma db push
   ```
4. **Seed Metadata:**
   Seed default admin profile credentials:
   ```bash
   docker compose exec backend npm run seed
   ```

---

## ☁️ Cloud Providers Integration Guides

### Render (API Backend Service)
1. Navigate to [Render Dashboard](https://dashboard.render.com/) and register a new **Web Service**.
2. Point to the repository and select the subfolder: `backend`.
3. Set Node environment:
   * **Runtime:** Node
   * **Build Command:** `npm ci && npm run build && npx prisma generate`
   * **Start Command:** `node dist/server.js`
4. Add all environment variables listed above under "Backend Env Keys".
5. Set up a free **PostgreSQL Database** on Render or Neon and copy the connection URI to `DATABASE_URL`.

### Vercel (Client UI Hosting)
1. Go to [Vercel Dashboard](https://vercel.com/) and create a new Project.
2. Choose your repository and select the subfolder: `frontend`.
3. Set building variables:
   * **Framework Preset:** Vite
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
4. Define Environment Variables: `VITE_API_URL` pointing to your deployed Render URL `/crm/v1`.

---

## 🔍 Validation & Health Check Checklists

*   **API Service Health Endpoint:** Verify `GET /crm/v1/health` returns status `200 OK`.
*   **API Swagger Documentation:** Accessible at `/crm/api` or `/api-docs`.
*   **Security Auditing:** Check that Helmet headers, CORS parameters, and IP Rate Limiting (100 requests per 15 minutes window) are successfully mounted.
