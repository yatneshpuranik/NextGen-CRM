# Project Requirements & Specifications

This document serves as the developer's single source of truth for functional requirements, business validation constraints, acceptance criteria, role mappings, and input validators.

---

## 1. Role Authorization & Access Control

The platform uses Role-Based Access Control (RBAC) to enforce security. The three roles are `ADMIN`, `MANAGER`, and `USER`.

| Feature Module | Endpoint API Route | Allowed Roles |
| :--- | :--- | :--- |
| **User Access** | `POST /auth/register` | `ADMIN` (Creates company accounts) |
| **User Session** | `GET /auth/me` | All Authenticated Roles (`ADMIN`, `MANAGER`, `USER`) |
| **CRM Directory** | `GET /customers` | All Authenticated Roles (`ADMIN`, `MANAGER`, `USER`) |
| **CRM Setup** | `POST /customers` / `PUT /customers/:id` | `ADMIN`, `MANAGER` |
| **CRM Delete** | `DELETE /customers/:id` | `ADMIN` |
| **Product catalog** | `GET /products` | All Authenticated Roles (`ADMIN`, `MANAGER`, `USER`) |
| **Inventory Setup** | `POST /products` / `PUT /products/:id` | `ADMIN`, `MANAGER` |
| **Inventory Delete**| `DELETE /products/:id` | `ADMIN` |
| **ERP Challan Draft**| `POST /challans` / `PUT /challans/:id` | All Authenticated Roles (`ADMIN`, `MANAGER`, `USER`) |
| **ERP Challan Confirm**| `POST /challans/:id/confirm` | `ADMIN`, `MANAGER` |
| **ERP Challan Cancel**| `POST /challans/:id/cancel` | `ADMIN` |
| **Billing logs** | `GET /invoices` | All Authenticated Roles (`ADMIN`, `MANAGER`, `USER`) |
| **Invoice Downloads** | `GET /invoices/:id/download` | All Authenticated Roles (`ADMIN`, `MANAGER`, `USER`) |

---

## 2. Business Rules Specification

### Stock Allocation & Verification
1.  **Safety Checks:**
    Creating a `DRAFT` challan does not reserve stock. Stock checks are executed during Challan confirmation.
2.  **Concurrency Lock:**
    Confirming a Challan updates stock counts in a database transaction block. Product rows must be locked during stock check:
    `SELECT * FROM "Product" WHERE id = $1 FOR UPDATE;`
3.  **Atomic Decrement:**
    If all items in the challan are in stock, deduct the quantities from the product stock counts and set status to `CONFIRMED`.
    If any item's quantity exceeds physical stock, roll back the transaction and return an `INSUFFICIENT_STOCK` error.

### Challan Lifecycle States
1.  **`DRAFT`:** Editable (items, quantities, and customer details can be changed) and deletable.
2.  **`CONFIRMED`:** Read-only. Triggers invoice calculations and email dispatches.
3.  **`CANCELLED`:** Reversible only by `ADMIN` within 24 hours. Cancelling a confirmed Challan returns the items to stock levels.

### Customer Credit Controls
-   **Credit Limit Enforcement:**
    If a customer's total unpaid invoices plus the value of the new Challan exceeds their `creditLimit`, the Challan confirmation fails:
    $$\text{Unpaid Invoices Sum} + \text{New Challan Value} \le \text{Customer Credit Limit}$$
    *Exception:* A credit limit of `0.00` indicates cash-only terms, bypassing checks.

### Invoice Calculations
-   **Taxes:** Apply 18% VAT/GST to subtotals.
    $$\text{Tax Amount} = \text{Subtotal} \times 0.18$$
    $$\text{Total Amount} = \text{Subtotal} + \text{Tax Amount}$$
-   **Immutability:** Generated invoices are read-only financial records. Any corrections require canceling the linked Challan or issuing a credit note.

---

## 3. Input Validation Constraints (`express-validator`)

To ensure data integrity, the backend api validates incoming payloads using `express-validator` rules:

```typescript
// backend/src/validators/auth.validators.ts
import { body } from 'express-validator';

export const registerValidator = [
  body('email').isEmail().withMessage('Provide a valid email address').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must contain at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least 1 uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least 1 number')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must contain at least 1 special character'),
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('role').optional().isIn(['ADMIN', 'MANAGER', 'USER']).withMessage('Invalid security role mapping')
];

export const customerValidator = [
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Company name required (3-100 characters)'),
  body('email').isEmail().withMessage('Provide a valid company billing email'),
  body('phone').optional().matches(/^\+?[1-9]\d{1,14}$/).withMessage('Provide a valid E.164 phone number'),
  body('billingAddress').notEmpty().withMessage('Billing address is required'),
  body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
  body('creditLimit').optional().isFloat({ min: 0 }).withMessage('Credit limit must be a positive number')
];

export const productValidator = [
  body('sku')
    .toUpperCase()
    .matches(/^PROD-[A-Z0-9]+-[A-Z0-9]+$/)
    .withMessage('SKU code must match template format: PROD-XXXX-YYYY'),
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Product name required (3-100 characters)'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0.00'),
  body('stock').isInt({ min: 0 }).withMessage('Stock level must be 0 or higher')
];

export const challanValidator = [
  body('customerId').isUUID().withMessage('Valid customer ID required'),
  body('items').isArray({ min: 1 }).withMessage('Challan items list cannot be empty'),
  body('items.*.productId').isUUID().withMessage('Valid product ID required'),
  body('items.*.quantity').isInt({ gt: 0 }).withMessage('Item quantity must be greater than 0')
];
```

---

## 4. Acceptance Criteria Checklist

### 🔑 Authentication Module
- [ ] Users can log in using valid credentials, returning a JSON Access Token and an HTTP-Only Refresh Cookie.
- [ ] Users cannot access protected dashboard endpoints without an access token.
- [ ] Session tokens expire after 15 minutes, triggering automatic silent refreshes via `/auth/refresh`.

### 👥 Customer CRM Module
- [ ] CRM panel displays a list of customer companies with search and pagination controls.
- [ ] Create Customer form validates email inputs, phone patterns, and positive credit limits.
- [ ] Deleting a customer with active or historical challans returns an error block.

### 📦 Product catalog Module
- [ ] Product creation forms allow image uploads, sending images to Cloudinary and saving the secure CDN URL in the database.
- [ ] Product grids display current stock levels, highlighting low-stock items in red.

### 📋 ERP Delivery Challan Module
- [ ] Users can create challans in a `DRAFT` status.
- [ ] Confirming a draft challan verifies stock levels inside a transaction block, updating product quantities upon success.
- [ ] Confirming a challan generates an invoice record and sends the PDF invoice to the customer's email.
