# NextGen ERP + CRM — Final RBAC Permission Matrix

This document serves as the single source of truth for the Role-Based Access Control (RBAC) implementation across the NextGen ERP + CRM enterprise application.

---

## 1. High-Level Summary Matrix

| Module / Feature | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard** | Full Access | Sales/CRM Widgets | Inventory Widgets | Sales/Financial Widgets |
| **Customers** | Full (View, Create, Edit, Status, Delete) | Manage (View, Create, Edit, Status) | 🚫 No Access | View Only |
| **Products** | Full (View, Create, Edit, Status, Delete) | View Only | Manage (View, Create, Edit, Status) | View Only |
| **Inventory** | Full (View, Stock In, Out, Adjust, Damage, Return, Settings) | 🚫 No Access | Full (View, Stock In, Out, Adjust, Damage, Return, Settings) | View Only |
| **Warehouses** | Full (View, Create, Edit, Transfer) | 🚫 No Access | Full (View, Create, Edit, Transfer) | 🚫 No Access |
| **Sales Challans** | Full Lifecycle (Create, Edit, Delete Draft, Confirm, Cancel, Complete) | Full Lifecycle (Create, Edit, Delete Draft, Confirm, Cancel, Complete) | View Only | View Only |
| **PDF Documents** | Challan, Invoice, Customer, Inventory | Challan, Invoice, Customer | Challan, Invoice, Inventory | Challan, Invoice, Customer, Inventory |
| **Bulk Import** | Customers, Products, Inventory, Warehouses | Customers Only | Products, Inventory, Warehouses | 🚫 No Imports |
| **Data Export** | All Data & System Logs | Customers, Products, Sales, Reports | Products, Inventory, Warehouses, Sales, Reports | Customers, Products, Inventory, Sales, Reports |
| **Global Search** | ✅ Customers, Products, Inventory, Challans | ✅ Customers, Products, Inventory, Challans | ✅ Customers, Products, Inventory, Challans | ✅ Customers, Products, Inventory, Challans |
| **Notifications** | ✅ Full Alert Center | ✅ Full Alert Center | ✅ Full Alert Center | ✅ Full Alert Center |
| **Profile & Password** | ✅ View Profile / Change Password | ✅ View Profile / Change Password | ✅ View Profile / Change Password | ✅ View Profile / Change Password |
| **Audit Logs** | ✅ Admin Only | 🚫 Restricted | 🚫 Restricted | 🚫 Restricted |
| **Email Logs** | ✅ Admin Only | 🚫 Restricted | 🚫 Restricted | 🚫 Restricted |
| **Backup / Restore**| ✅ Admin Only | 🚫 Restricted | 🚫 Restricted | 🚫 Restricted |
| **Company Settings**| ✅ Admin Only | 🚫 Restricted | 🚫 Restricted | 🚫 Restricted |
| **User Registration**| ✅ Admin Only | 🚫 Restricted | 🚫 Restricted | 🚫 Restricted |

---

## 2. Detailed Role Specifications

### 👑 ADMIN
- **System Rights**: Unrestricted full access across all workspace endpoints, UI routes, data mutation actions, system settings, and security logs.
- **Customers**: View, Create, Edit, Activate/Deactivate, Soft Delete.
- **Products**: View, Create, Edit, Activate/Deactivate, Soft Delete.
- **Inventory**: View levels, Stock In, Stock Out, Stock Adjustment, Mark Damage, Record Return, Update Reorder Settings.
- **Warehouses**: View list & details, Create warehouse, Edit warehouse, Inter-warehouse stock transfer.
- **Sales Challans**: View list & details, Create Draft, Edit Draft, Delete Draft, Confirm (deduct stock), Cancel (restore stock), Complete delivery.
- **Reports**: Access all 6 reports (Sales Revenue, Inventory Valuation, Products Catalog, Customer CRM, Stock Movements, Delivery Challans).
- **Admin Panel**: Audit Logs, Email Delivery Logs, Database JSON Export/Restore, CSV Backups, Company Settings, Register New User Accounts.

### 💼 SALES
- **Dashboard**: Tailored widgets focusing on Sales Revenue, Customer Signups, Top Spenders, and Challan Status Distributions.
- **Customers**: View, Create, Edit, Activate/Deactivate (Delete restricted to Admin).
- **Products**: View catalog items & details (Create/Edit/Delete buttons hidden).
- **Inventory**: 🚫 Blocked by backend `authorizeRoles` and frontend `RoleGuard`.
- **Warehouses**: 🚫 Blocked by backend `authorizeRoles` and frontend `RoleGuard`.
- **Sales Challans**: Full lifecycle management (Create, Edit Draft, Delete Draft, Confirm, Cancel, Complete).
- **Reports**: Access to Sales, Products, Customers, and Delivery Challans reports.
- **Imports**: Bulk Customer import allowed.
- **Exports**: Customers, Products, Sales Challans, Reports & Analytics.

### 🏭 WAREHOUSE
- **Dashboard**: Tailored widgets focusing on Inventory Valuation, Category Asset Spread, Low Stock Warnings, and Recent Activity.
- **Customers**: 🚫 Blocked by backend `authorizeRoles` and frontend `RoleGuard`.
- **Products**: View, Create, Edit, Activate/Deactivate (Delete restricted to Admin).
- **Inventory**: Full operational stock control (View, Stock In, Stock Out, Adjust, Damage, Return, Reorder settings).
- **Warehouses**: Full operational management (View list/details, Create, Edit, Inter-warehouse stock transfer).
- **Sales Challans**: View Only (All action/mutation buttons hidden).
- **Reports**: Access to Inventory, Products, Stock Movements, and Delivery Challans reports.
- **Imports**: Bulk Products, Inventory, and Warehouses import allowed.
- **Exports**: Products, Inventory, Warehouses, Sales Challans, Reports & Analytics.

### 💳 ACCOUNTS
- **Dashboard**: Financial overview widgets focusing on Sales Revenue, Customer Spend, Order Status distribution, and Activity.
- **Customers**: View Only (Create/Edit/Delete/Import buttons hidden).
- **Products**: View Only (Create/Edit/Delete/Import buttons hidden).
- **Inventory**: View Only (Stock In/Out/Adjust/Damage/Return buttons hidden).
- **Warehouses**: 🚫 Blocked by backend `authorizeRoles` and frontend `RoleGuard`.
- **Sales Challans**: View Only (Create/Edit/Confirm/Cancel/Complete buttons hidden).
- **Reports**: Access to Sales, Inventory, Customers, and Delivery Challans reports (Products report excluded to align backend/frontend).
- **PDF Access**: Download Delivery Challan PDF, Tax Invoice PDF, Customer Summary PDF, and Inventory Report PDF.
- **Data Mutability**: 🚫 Zero creation, modification, or deletion rights; 🚫 Bulk imports disabled.

---

## 3. Backend Route Authorization Endpoint Audit

| Endpoint Route | Method | Required Roles | Status / Notes |
| :--- | :---: | :--- | :--- |
| `/auth/register` | `POST` | `ADMIN` | 🔒 Fixed: Enforced `authenticateJWT` + `authorizeRoles('ADMIN')` |
| `/auth/login` | `POST` | Public | Unauthenticated authentication |
| `/auth/me` | `GET` | All Authenticated | JWT payload validation |
| `/auth/change-password` | `PUT` | All Authenticated | Self-password rotation |
| `/customers` | `POST` | `ADMIN`, `SALES` | Create customer profile |
| `/customers` | `GET` | `ADMIN`, `SALES`, `ACCOUNTS` | Read customer list |
| `/customers/:id` | `GET` | `ADMIN`, `SALES`, `ACCOUNTS` | Read customer profile |
| `/customers/:id` | `PUT` | `ADMIN`, `SALES` | Update customer profile |
| `/customers/:id` | `DELETE` | `ADMIN` | Soft delete customer |
| `/customers/:id/activate` | `PATCH` | `ADMIN`, `SALES` | Activate customer |
| `/customers/:id/deactivate` | `PATCH` | `ADMIN`, `SALES` | Deactivate customer |
| `/products` | `POST` | `ADMIN`, `WAREHOUSE` | Create catalog product |
| `/products` | `GET` | `ADMIN`, `WAREHOUSE`, `SALES`, `ACCOUNTS` | Read product catalog |
| `/products/:id` | `GET` | `ADMIN`, `WAREHOUSE`, `SALES`, `ACCOUNTS` | Read product details |
| `/products/:id` | `PUT` | `ADMIN`, `WAREHOUSE` | Update product details |
| `/products/:id` | `DELETE` | `ADMIN` | Soft delete product |
| `/products/:id/activate` | `PATCH` | `ADMIN`, `WAREHOUSE` | Activate product |
| `/products/:id/deactivate` | `PATCH` | `ADMIN`, `WAREHOUSE` | Deactivate product |
| `/inventory` | `GET` | `ADMIN`, `WAREHOUSE`, `ACCOUNTS` | Read inventory stocks |
| `/inventory/summary` | `GET` | `ADMIN`, `WAREHOUSE`, `ACCOUNTS` | Read stock stats |
| `/inventory/low-stock` | `GET` | `ADMIN`, `WAREHOUSE`, `ACCOUNTS` | Read low stock alert list |
| `/inventory/history` | `GET` | `ADMIN`, `WAREHOUSE`, `ACCOUNTS` | Read stock movement log |
| `/inventory/product/:id/settings` | `PUT` | `ADMIN`, `WAREHOUSE` | Update reorder levels |
| `/inventory/stock-in` | `POST` | `ADMIN`, `WAREHOUSE` | Stock intake transaction |
| `/inventory/stock-out` | `POST` | `ADMIN`, `WAREHOUSE` | Stock dispatch transaction |
| `/inventory/adjust` | `POST` | `ADMIN`, `WAREHOUSE` | Stock adjustment |
| `/inventory/damage` | `POST` | `ADMIN`, `WAREHOUSE` | Mark damaged stock |
| `/inventory/return` | `POST` | `ADMIN`, `WAREHOUSE` | Record stock return |
| `/warehouses` | `ALL` | `ADMIN`, `WAREHOUSE` | Full warehouse management |
| `/sales-challans` | `POST` | `ADMIN`, `SALES` | Create draft sales challan |
| `/sales-challans` | `GET` | `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS` | Read sales challan list |
| `/sales-challans/:id` | `GET` | `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS` | Read sales challan details |
| `/sales-challans/:id` | `PUT` | `ADMIN`, `SALES` | Update draft sales challan |
| `/sales-challans/:id` | `DELETE` | `ADMIN`, `SALES` | Delete draft sales challan |
| `/sales-challans/:id/confirm` | `POST` | `ADMIN`, `SALES` | Confirm sales challan |
| `/sales-challans/:id/cancel` | `POST` | `ADMIN`, `SALES` | Cancel sales challan |
| `/sales-challans/:id/complete` | `POST` | `ADMIN`, `SALES` | Complete sales challan |
| `/reports/sales` | `GET` | `ADMIN`, `SALES`, `ACCOUNTS` | Financial revenue report |
| `/reports/inventory` | `GET` | `ADMIN`, `WAREHOUSE`, `ACCOUNTS` | Stock asset valuation report |
| `/reports/products` | `GET` | `ADMIN`, `WAREHOUSE`, `SALES` | Catalog products report |
| `/reports/customers` | `GET` | `ADMIN`, `SALES`, `ACCOUNTS` | 🔒 Aligned: Added ACCOUNTS |
| `/reports/stock-movements` | `GET` | `ADMIN`, `WAREHOUSE` | Stock ledger history report |
| `/reports/challans` | `GET` | `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS` | 🔒 Aligned: Allowed WAREHOUSE |
| `/pdf/challan/:id` | `GET` | `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS` | Stream Delivery Challan PDF |
| `/pdf/invoice/:id` | `GET` | `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS` | Stream Tax Invoice PDF |
| `/pdf/customer/:id` | `GET` | `ADMIN`, `SALES`, `ACCOUNTS` | Stream Customer Summary PDF |
| `/pdf/report/inventory` | `GET` | `ADMIN`, `WAREHOUSE`, `ACCOUNTS` | Stream Inventory Valuation PDF |
| `/audit` | `ALL` | `ADMIN` | Audit log trail |
| `/email-logs` | `ALL` | `ADMIN` | Outbound email dispatches |
| `/backup/*` | `ALL` | `ADMIN` | JSON/CSV Backup & Restore |
| `/settings` | `ALL` | `ADMIN` | System & Company configuration |

---

## 4. Security Verification Checklist

- [x] **Unauthenticated User Registration Vulnerability**: Fixed. `POST /auth/register` requires authenticated ADMIN token.
- [x] **Accounts + Product Report Discrepancy**: Fixed. Frontend dropdown and authorization check now hide Products report from ACCOUNTS.
- [x] **Warehouse + Challans Report Discrepancy**: Fixed. Frontend `isAuthorized` logic now allows WAREHOUSE to view Challan Report.
- [x] **Customer Report Accounts Access**: Fixed. Backend route `GET /reports/customers` now includes `ACCOUNTS`.
- [x] **PDF Route Protections**: Fixed. PDF routes now enforce explicit role-based access matching module boundaries.
- [x] **Action Buttons & Modals**: Hidden appropriately on all tables, cards, and detail pages when logged in with a read-only role.
