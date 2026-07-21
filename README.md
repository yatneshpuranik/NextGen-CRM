# NextGen ERP + CRM Platform (Sales & Inventory Management)

A production-ready, high-performance, and scalable **Enterprise Sales & Inventory Management Platform** that integrates customer relationship tracking (CRM) with inventory management and billing automation (ERP).

This single monorepo repository acts as the codebase for the Vite-React frontend and the Node-Express backend api.

---

## 📖 System Blueprints

To facilitate rapid development, this repository utilizes exactly five core documents that serve as the single source of truth for the entire platform:

1.  **[README.md](file:///d:/CRM/README.md)** (This File) - High-level introduction, technical stacks, environment variables setup, and local run/deployment operations.
2.  **[PHASES.md](file:///d:/CRM/PHASES.md)** - Chronological development roadmap from Phase 0 to Phase 8, specifying exact tasks, deliverables, APIs, and DB changes per phase.
3.  **[REQUIREMENTS.md](file:///d:/CRM/REQUIREMENTS.md)** - Functional specifications, transaction business rules, validation criteria, role authorization, and developer validation checklists.
4.  **[PROJECT_ARCHITECTURE.md](file:///d:/CRM/PROJECT_ARCHITECTURE.md)** - Technical diagrams, backend route layering, DB model mappings, Redux slice frameworks, token refresh setups, and deployment settings.
5.  **[YATNESH_ENHANCEMENTS.md](file:///d:/CRM/YATNESH_ENHANCEMENTS.md)** - Showcase of custom enterprise enhancements (Swagger, Cloudinary, Winston, PDFKit, Rate Limiter, Helmet) implemented to verify production readiness.

---

## 🛠️ Technology Stack

### Backend Core
-   **Runtime & Language:** Node.js (v18+ LTS) with TypeScript
-   **Server Framework:** Express.js
-   **Database Access Layer:** Prisma ORM
-   **Primary Database:** PostgreSQL (Neon Serverless PostgreSQL)
-   **Access Management:** JWT (JSON Web Tokens) & bcryptjs
-   **Request Verification:** express-validator
-   **API Sandbox Docs:** Swagger (swagger-jsdoc + swagger-ui-express)
-   **Image Parser & Upload:** Multer & Cloudinary
-   **Email Client:** Nodemailer (SMTP transport)
-   **Invoice Engine:** PDFKit (Server-side PDF generation)

### Frontend Client
-   **Core Framework:** React (Vite bundler)
-   **State Management:** Redux Toolkit (Slices, async thunks)
-   **Client Router:** React Router Dom (v6, protected route checks)
-   **Network Client:** Axios (With request/response interceptors)
-   **UI Styles:** TailwindCSS

### DevOps & Tools
-   **Containerization:** Docker & Docker Compose
-   **CI/CD Pipeline:** GitHub Actions
-   **Hosting Platforms:** Vercel (Frontend Client) & Render (Backend Service)

---

## 📁 Project Directory Layout

```text
d:\CRM\
├── .github/                         # Automations and pipeline scripts
│   └── workflows/
│       └── deploy.yml               # GitHub Actions CI/CD configuration
├── backend/                         # Express REST API (TypeScript)
│   ├── prisma/                      # ORM Configuration
│   │   ├── migrations/              # DB migration files
│   │   ├── schema.prisma            # Database schemas
│   │   └── seed.ts                  # Test seed entries
│   ├── src/
│   │   ├── config/                  # DB, mail, and logging setups
│   │   ├── controllers/             # Express route handler files
│   │   ├── middleware/              # JWT, RBAC, and error catchers
│   │   ├── routes/                  # Route routers mapping
│   │   ├── services/                # Database and transactional logic
│   │   ├── validators/              # express-validator schemas
│   │   ├── app.ts                   # Express app initializer
│   │   └── server.ts                # Server listener
│   ├── uploads/                     # Temp storage for Multer
│   ├── Dockerfile
│   └── tsconfig.json
├── frontend/                        # React Dashboard (Vite + TS)
│   ├── src/
│   │   ├── assets/                  # Tailwind CSS styling index
│   │   ├── components/              # Shared UI components (tables, inputs)
│   │   ├── layouts/                 # Dashboard layouts (navbar, sidebar)
│   │   ├── pages/                   # Main views (login, products, challans)
│   │   ├── store/                   # Redux Store slices & actions
│   │   └── utils/                   # Axios network adapters
│   ├── Dockerfile
│   └── tailwind.config.js
└── docker-compose.yml               # Local compose setup
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000

# PostgreSQL Neon Connections
DATABASE_URL="postgresql://user:password@ep-pool-host.us-east-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-direct-host.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Token Configurations
JWT_SECRET=super_secret_jwt_encryption_key_for_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=super_secret_jwt_refresh_token_key_for_production
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary Setup
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SMTP Email Setup
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=NextGen ERP <no-reply@nextgenerp.com>
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 🚀 Running Locally

### 1. Backend Setup & Seeding
```bash
cd backend
npm install

# Run database migrations
npx prisma migrate dev --name init

# Populate seeds (creates default accounts, products, and customers)
npm run seed

# Run local server
npm run dev
# Running on http://localhost:5000 | Swagger Docs: http://localhost:5000/api-docs
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install

# Run client dev server
npm run dev
# Dashboard running on http://localhost:5173
```

---

## 🔒 Verification & Test Credentials

For quick system verification, the database seed file populates the following accounts:

| Username / Email | Password | Role | UI Dashboard Authorization |
| :--- | :--- | :---: | :--- |
| `admin@nextgenerp.com` | `AdminPassword123!` | `ADMIN` | Full access. User creation, deletions, cancels. |
| `manager@nextgenerp.com` | `ManagerPassword123!` | `MANAGER` | Stock edits, Challan confirmations. |
| `user@nextgenerp.com` | `UserPassword123!` | `USER` | View lists. Draft challan creations. |

---

## 🖥️ Live API Sandbox

-   **Local Documentation:** `http://localhost:5000/api-docs`
-   **Production Documentation:** `https://nextgen-api.onrender.com/api-docs`

---

## 📦 Deployment Overview

-   **Database:** PostgreSQL hosted on [Neon](https://neon.tech/).
-   **Backend REST APIs:** Containerized using the Backend `Dockerfile` and hosted on [Render](https://render.com/).
-   **Frontend SPA Client:** Pre-compiled static code hosted on [Vercel](https://vercel.com/) with rewrites configuration inside `vercel.json` to support router path reloads.

Refer to [PROJECT_ARCHITECTURE.md](file:///d:/CRM/PROJECT_ARCHITECTURE.md) and [PHASES.md](file:///d:/CRM/PHASES.md) for deployment parameters and diagrams.

---

## 📸 Dashboard Mockups & Panels

### 1. Overview Panel
A dashboard featuring key performance indicators: Active Customers, Gross Catalog SKUs, Confirmed Challans, Monthly Billing, and interactive charts visualizing sales vs. inventory volumes.
![Overview Mockup](https://raw.githubusercontent.com/username/repo/main/docs/assets/overview.png)

### 2. ERP Delivery Challan Workspace
Allows creation and tracking of delivery notes. Confirmed notes are locked, displaying an **Invoice Generated** badge linking directly to the PDF invoice.
![Challan Workspace](https://raw.githubusercontent.com/username/repo/main/docs/assets/challans.png)

---

## 🔮 Future Enhancement Scope

1.  **Multiple Warehouses:** Support stock tracking across different physical locations.
2.  **Credit History Analytics:** Machine Learning scoring to predict payment defaults based on historical customer invoices.
3.  **Real-Time Alerts:** Socket.io integrations to notify warehouse workers when stock levels fall below critical thresholds.
