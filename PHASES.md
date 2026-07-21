# Development Roadmap (Phases 0 - 8)

This roadmap details the chronological software delivery sequence for the NextGen ERP + CRM platform.

---

## 📅 Roadmap Overview

```
Phase 0: Project Setup
      │
      ▼
Phase 1: Authentication & Identity Access Management (IAM)
      │
      ▼
Phase 2: Customer CRM Management
      │
      ▼
Phase 3: Product Catalog (Media Store)
      │
      ▼
Phase 4: Inventory Real-Time Control
      │
      ▼
Phase 5: Sales Challan & Invoicing (ERP Core)
      │
      ▼
Phase 6: Frontend Client Dashboard (React/Redux)
      │
      ▼
Phase 7: Cloud Deployment (Render/Vercel/Neon)
      │
      ▼
Phase 8: End-to-End Testing
```

---

## 🏁 Phase 0: Project Setup

### Objectives
Establish the workspace directories, configure build environments (TypeScript), and initialize database engines (Prisma ORM).

### Tasks
1.  Initialize monorepo directories: `backend/` and `frontend/`.
2.  Install dependencies in `backend/package.json` (Express, Prisma, TypeScript, TS-Node, etc.).
3.  Configure `backend/tsconfig.json` for compilation settings.
4.  Configure Winston Logger (`backend/src/config/logger.ts`) to capture system stdout/stderr.
5.  Initialize Prisma ORM: `npx prisma init`.

### Deliverables
-   Working backend workspace skeleton.
-   Active Winston logging system.
-   Prisma schema foundation template.

### APIs
None.

### Database Changes
None.

---

## 🏁 Phase 1: Authentication & Identity Access Management (IAM)

### Objectives
Implement identity validation endpoints and role-based route access controls.

### Tasks
1.  Model the `User` table and `Role` enum inside `schema.prisma` (see [PROJECT_ARCHITECTURE.md](file:///d:/CRM/PROJECT_ARCHITECTURE.md)).
2.  Implement `bcryptjs` hashing for password storage.
3.  Implement Token Service to generate:
    *   **Access Token:** Short-lived JWT (15m expiry) containing user metadata.
    *   **Refresh Token:** Long-lived JWT (7d expiry) sent as a secure, HTTP-only cookie.
4.  Build Express middleware:
    *   `authenticateJWT`: Extracts and decrypts JWT token from headers.
    *   `authorizeRoles(...roles)`: Verifies user role fits the endpoint requirements (RBAC).

### Deliverables
-   JWT middleware controllers.
-   Token rotation helpers.

### APIs
-   `POST /auth/register` - Registers a user (Admin only, see [REQUIREMENTS.md](file:///d:/CRM/REQUIREMENTS.md)).
-   `POST /auth/login` - Public login. Sets refresh token cookie and returns access token.
-   `POST /auth/refresh` - Public token rotation. Reads cookie and returns a new access token.
-   `POST /auth/logout` - Clears the HTTP-only cookie.
-   `GET /auth/me` - Authenticated dashboard user session verification.

### Database Changes
Create the `User` table:
```sql
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'USER');

CREATE TABLE "User" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL
);

CREATE INDEX "User_email_idx" ON "User"("email");
```

---

## 🏁 Phase 2: Customer CRM Management

### Objectives
Onboard customer profiles, capture shipping/billing configurations, and organize database query indexes.

### Tasks
1.  Define the `Customer` table in Prisma.
2.  Implement customer request payloads validators using `express-validator` (see [REQUIREMENTS.md](file:///d:/CRM/REQUIREMENTS.md)).
3.  Write Customer Controller handlers mapping GET, POST, PUT, and DELETE operations.
4.  Prevent deletion of a customer profile if active Delivery Challans exist.

### Deliverables
-   Validated Customer REST endpoints.

### APIs
-   `GET /customers` - Paginated lists (supports search & filters).
-   `GET /customers/:id` - Fetch single profile details.
-   `POST /customers` - Create customer profiles (Manager+).
-   `PUT /customers/:id` - Update customer configurations (Manager+).
-   `DELETE /customers/:id` - Remove customer profile (Admin only).

### Database Changes
Create the `Customer` table:
```sql
CREATE TABLE "Customer" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "phone" VARCHAR(20),
    "billingAddress" TEXT NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "creditLimit" DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL
);

CREATE INDEX "Customer_email_idx" ON "Customer"("email");
```

---

## 🏁 Phase 3: Product Catalog (Media Store)

### Objectives
Construct the product catalogue, configure image uploads, and index product SKUs.

### Tasks
1.  Define the `Product` table in Prisma.
2.  Configure Multer storage engine in `backend/src/middleware/upload.middleware.ts`.
3.  Implement Cloudinary SDK services (`backend/src/services/cloudinary.service.ts`) to upload image files and remove temporary local files.
4.  Write Product CRUD handlers with express-validators checking SKU formats.

### Deliverables
-   Functional image upload pipeline (Multer + Cloudinary).
-   Product CRUD controllers.

### APIs
-   `GET /products` - Paginated catalog list (supports SKU search & pricing filters).
-   `GET /products/:id` - Fetch product specifications.
-   `POST /products` - Create product record with image upload (Manager+).
-   `PUT /products/:id` - Edit product record (optional image upload, Manager+).
-   `DELETE /products/:id` - Remove product from database (Admin only).

### Database Changes
Create the `Product` table:
```sql
CREATE TABLE "Product" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "sku" VARCHAR(50) UNIQUE NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10, 2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL
);

CREATE INDEX "Product_sku_idx" ON "Product"("sku");
```

---

## 🏁 Phase 4: Inventory Real-Time Control

### Objectives
Monitor stock adjustments, track inventory balances, and log stock revisions.

### Tasks
1.  Implement a manual stock adjustment service for administrative corrections.
2.  Write controllers to search for and isolate items with stock levels below defined warning thresholds.
3.  Integrate the `AuditLog` table with inventory operations to log all manual stock changes.

### Deliverables
-   Low-stock reporting views.
-   Administrative stock adjustment endpoints.

### APIs
-   `GET /products/low-stock` - Returns list of products where stock is below warning levels (Manager+).
-   `POST /products/:id/adjust-stock` - Manually adjust stock counts (Admin only).

### Database Changes
None.

---

## 🏁 Phase 5: Sales Challan & Invoicing (ERP Core)

### Objectives
Implement transaction controls for Challan confirmation, automatic stock deductions, invoice calculations, and outbound invoice emails.

### Tasks
1.  Define `Challan`, `ChallanItem`, and `Invoice` tables in Prisma.
2.  Implement Challan creation in a `DRAFT` state.
3.  Develop the **Challan Confirmation Pipeline** inside a Prisma transaction (`$transaction`):
    *   Lock product database rows using a `SELECT ... FOR UPDATE` statement.
    *   Verify that available inventory is sufficient for all items in the challan.
    *   Deduct the requested item quantities from product stock levels.
    *   Update Challan status to `CONFIRMED`.
    *   Create an `Invoice` record linked to the challan with a sequential invoice number (e.g., `INV-2026-00001`).
    *   Calculate subtotal, 18% tax, and total.
4.  Develop a background worker using **PDFKit** to render the invoice PDF.
5.  Trigger **Nodemailer** to email the PDF invoice to the customer.

### Deliverables
-   Transaction-safe challan confirmations.
-   Automated PDF generation and email delivery.

### APIs
-   `GET /challans` - Retrieve challans (paginated, filter by customer/status).
-   `POST /challans` - Create a delivery challan in `DRAFT` status.
-   `PUT /challans/:id` - Edit draft challan items.
-   `POST /challans/:id/confirm` - Confirm a challan, trigger stock deductions, generate invoice, and email the PDF (Manager+).
-   `GET /invoices` - Retrieve billing history logs.
-   `GET /invoices/:id/download` - Downloads the invoice PDF.

### Database Changes
Create `Challan`, `ChallanItem`, and `Invoice` tables:
```sql
CREATE TYPE "ChallanStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED');

CREATE TABLE "Challan" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "challanNo" VARCHAR(50) UNIQUE NOT NULL,
    "customerId" UUID NOT NULL REFERENCES "Customer"("id") ON DELETE RESTRICT,
    "status" "ChallanStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL
);

CREATE TABLE "ChallanItem" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "challanId" UUID NOT NULL REFERENCES "Challan"("id") ON DELETE CASCADE,
    "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE RESTRICT,
    "quantity" INTEGER NOT NULL,
    "priceAtSale" DECIMAL(10, 2) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL
);

CREATE TABLE "Invoice" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "invoiceNo" VARCHAR(50) UNIQUE NOT NULL,
    "challanId" UUID UNIQUE NOT NULL REFERENCES "Challan"("id") ON DELETE RESTRICT,
    "subTotal" DECIMAL(12, 2) NOT NULL,
    "taxAmount" DECIMAL(12, 2) NOT NULL,
    "totalAmount" DECIMAL(12, 2) NOT NULL,
    "pdfUrl" VARCHAR(255),
    "sentEmail" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL
);

CREATE INDEX "Challan_customerId_idx" ON "Challan"("customerId");
CREATE INDEX "ChallanItem_challanId_idx" ON "ChallanItem"("challanId");
CREATE INDEX "Invoice_challanId_idx" ON "Invoice"("challanId");
```

---

## 🏁 Phase 6: Frontend Client Dashboard (React/Redux)

### Objectives
Build the frontend single-page application (SPA) client interface, setting up state slices, route protections, and UI dashboard grids.

### Tasks
1.  Initialize frontend layout using Vite and TailwindCSS.
2.  Configure Redux Store slices (`auth`, `customer`, `inventory`, `challan`, `invoice`) to manage UI state.
3.  Implement Axios client configuration with request interceptors to inject JWT headers, and response interceptors to handle automatic token refresh (silent refresh).
4.  Construct Dashboard Layouts (Sidebar, Top Navbar) dynamically displaying navigation links based on user roles.
5.  Build UI Page Views: Login form, Inventory SKU list, Customers directory, Challan creation, and Invoice logs.

### Deliverables
-   Responsive dashboard portal connected to the Express APIs.
-   Functional JWT token refresh handler.

### APIs
Backend APIs consumed via Axios.

### Database Changes
None.

---

## 🏁 Phase 7: Cloud Deployment

### Objectives
Deploy the database to Neon, the API services to Render, and the frontend app to Vercel.

### Tasks
1.  Provision production database inside Neon cloud.
2.  Deploy backend to Render Web Services utilizing multi-stage Dockerfiles.
3.  Map environment variables (secrets) on Render and execute `npx prisma migrate deploy` during deployment.
4.  Deploy frontend to Vercel CDN, configuring routing rewrites in `vercel.json` for client routing support.

### Deliverables
-   Publicly accessible live URLs for the APIs and frontend application.

### APIs
None.

### Database Changes
Deploy schema migrations to the live database:
```bash
npx prisma migrate deploy
```

---

## 🏁 Phase 8: End-to-End Testing

### Objectives
Test the system's endpoints, check validation constraints, and verify database transactions.

### Tasks
1.  Seed the production database with default operational users.
2.  Test the full order workflow: Create Customer ➔ Add Products ➔ Create Draft Challan ➔ Confirm Challan ➔ Verify stock decrement, invoice generation, PDF layout, and email receipt.
3.  Simulate concurrent checkouts to confirm transaction locks prevent inventory discrepancies.

### Deliverables
-   QA-approved project deployment ready for production release.

### APIs
None.

### Database Changes
None.
