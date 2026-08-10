# NextGen ERP + CRM — Performance Audit Report

**Date**: August 11, 2026  
**Target Environment**: Production (`https://crm.yatneshpuranik.online` / `https://api.yatneshpuranik.online`) & Local Development  

---

## 1. Executive Summary & Audit Findings

During the initial codebase audit, we identified key performance bottlenecks across frontend bundle initialization, initial network request cascading, unoptimized notification polling, unindexed database columns, and eager payload fetching.

---

## 2. Detailed Findings

### A. Frontend Bundle & Route Loading Issues
1. **Zero Code Splitting**: All 28+ page components in `App.tsx` are eagerly imported at startup, bloating the main JavaScript bundle.
2. **Missing Suspense Fallbacks**: Entire app waits for eager page scripts before displaying header and navigation controls.

### B. Eager API Request Cascading on Application Startup
1. **Notification Polling Overhead**: `NotificationDropdown` automatically executes `GET /notifications` (fetching the full array of up to 50 notifications) every 20 seconds on mount, even when the notification dropdown modal is closed.
2. **Dashboard Multi-Fetch**: Opening `/dashboard` fires 5 separate parallel API requests:
   - `GET /dashboard/summary`
   - `GET /dashboard/recent-activity`
   - `GET /dashboard/sales-overview`
   - `GET /dashboard/top-products`
   - `GET /dashboard/low-stock`
3. **Role Unawareness during Initial Load**:
   - Unauthorized module calls are avoided in `DashboardPage`, but notification list calls and pagination configs do not leverage role caching.

### C. Data Pagination & Request Volume
1. **Unoptimized Default Page Size**: List pages currently use a limit of 10-20 items without client-side page caching.
2. **Missing Page Caching**: Switching from Page 1 → Page 2 → Page 1 triggers duplicate network requests to `/customers`, `/products`, `/inventory`, `/sales-challans`.

### D. Search & Keystroke Debouncing
1. **Global Search**: Search requests are sent on every keystroke without proper 300-400ms debounce control.

### E. Database Queries & Indexing Bottlenecks
1. **Missing Indexes in Prisma Schema**:
   - `Customer`: Missing index on `isDeleted`, `isActive`, `createdAt`.
   - `Product`: Missing index on `isDeleted`, `isActive`, `category`, `createdAt`.
   - `SalesChallan`: Missing index on `status`, `createdAt`.
   - `StockTransaction`: Missing index on `transactionType`, `createdAt`.
   - `Notification`: Missing index on `type`.
2. **Heavy Payload Returns**: Database queries select full relations (`customer`, `product`, `items`, `createdByUser`) when only summary list fields are required.

---

## 3. Recommended Optimization Blueprint

1. **Frontend Code Splitting**: Convert `App.tsx` page imports to `React.lazy()` with `<Suspense fallback={<Loader />}>`.
2. **Role-Aware Dashboard & Notification Unread Count**:
   - Create lightweight `GET /notifications/unread-count` returning `{ count: N }`.
   - Load full notification list only when user toggles the dropdown modal.
3. **On-Demand Paginated Caching**:
   - Set default pagination limit to 8 items per page across all module list tables.
   - Implement key-based pagination caching `[resource, page, limit, search, filters, sortBy, sortOrder]` so returning to previously visited pages loads instantly from memory.
   - Invalidate resource cache on mutation (create/edit/delete/status toggle).
4. **Prisma Indexing & Select Tuning**:
   - Add database indexes on `isDeleted`, `isActive`, `status`, `type`, `category`, `createdAt`.
   - Use Prisma `select` / `include` optimizations to strip unused payload properties.
5. **Debounced Global Search**: Standardize 350ms debounce on global search modal input.
6. **HTTP Compression & Response Caching**: Ensure `compression` middleware and security headers are active.
