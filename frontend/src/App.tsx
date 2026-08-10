import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import Loader from './components/Loader';

// Eagerly loaded core shell pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardLayout from './layouts/DashboardLayout';

// Lazy-loaded feature module pages for Code Splitting
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const CustomerFormPage = lazy(() => import('./pages/CustomerFormPage'));
const CustomerDetailsPage = lazy(() => import('./pages/CustomerDetailsPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductFormPage = lazy(() => import('./pages/ProductFormPage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));

const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const InventoryDashboardPage = lazy(() => import('./pages/InventoryDashboardPage'));
const InventoryHistoryPage = lazy(() => import('./pages/InventoryHistoryPage'));
const LowStockReportPage = lazy(() => import('./pages/LowStockReportPage'));
const InventoryDetailsPage = lazy(() => import('./pages/InventoryDetailsPage'));

const ChallansPage = lazy(() => import('./pages/ChallansPage'));
const ChallanFormPage = lazy(() => import('./pages/ChallanFormPage'));
const ChallanDetailsPage = lazy(() => import('./pages/ChallanDetailsPage'));

const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));

const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const BackupRestorePage = lazy(() => import('./pages/BackupRestorePage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

const WarehouseListPage = lazy(() => import('./pages/WarehouseListPage'));
const WarehouseFormPage = lazy(() => import('./pages/WarehouseFormPage'));
const WarehouseDetailsPage = lazy(() => import('./pages/WarehouseDetailsPage'));
const EmailLogsPage = lazy(() => import('./pages/EmailLogsPage'));

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Router future={{ v7_relativeSplatPath: true }}>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public auth pages */}
          <Route
            path="/login"
            element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />}
          />
          <Route
            path="/register"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['ADMIN']}>
                  <RegisterPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/unauthorized"
            element={<UnauthorizedPage />}
          />

          {/* Protected enterprise panel */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="customers" element={<RoleGuard allowedRoles={['ADMIN','SALES','ACCOUNTS']}><CustomersPage /></RoleGuard>} />
            <Route path="customers/new" element={<RoleGuard allowedRoles={['ADMIN','SALES']}><CustomerFormPage /></RoleGuard>} />
            <Route path="customers/:id" element={<RoleGuard allowedRoles={['ADMIN','SALES','ACCOUNTS']}><CustomerDetailsPage /></RoleGuard>} />
            <Route path="customers/:id/edit" element={<RoleGuard allowedRoles={['ADMIN','SALES']}><CustomerFormPage /></RoleGuard>} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<RoleGuard allowedRoles={['ADMIN','WAREHOUSE']}><ProductFormPage /></RoleGuard>} />
            <Route path="products/:id" element={<ProductDetailsPage />} />
            <Route path="products/:id/edit" element={<RoleGuard allowedRoles={['ADMIN','WAREHOUSE']}><ProductFormPage /></RoleGuard>} />
            
            {/* Inventory Module Routes */}
            <Route path="inventory" element={<RoleGuard allowedRoles={['ADMIN','WAREHOUSE','ACCOUNTS']}><InventoryPage /></RoleGuard>} />
            <Route path="inventory/dashboard" element={<RoleGuard allowedRoles={['ADMIN','WAREHOUSE']}><InventoryDashboardPage /></RoleGuard>} />
            <Route path="inventory/history" element={<RoleGuard allowedRoles={['ADMIN','WAREHOUSE','ACCOUNTS']}><InventoryHistoryPage /></RoleGuard>} />
            <Route path="inventory/low-stock" element={<RoleGuard allowedRoles={['ADMIN','WAREHOUSE']}><LowStockReportPage /></RoleGuard>} />
            <Route path="inventory/:productId" element={<RoleGuard allowedRoles={['ADMIN','WAREHOUSE','ACCOUNTS']}><InventoryDetailsPage /></RoleGuard>} />

            {/* Sales Challan Module Routes */}
            <Route path="sales-challans" element={<ChallansPage />} />
            <Route path="sales-challans/new" element={<RoleGuard allowedRoles={['ADMIN','SALES']}><ChallanFormPage /></RoleGuard>} />
            <Route path="sales-challans/:id" element={<ChallanDetailsPage />} />
            <Route path="sales-challans/:id/edit" element={<RoleGuard allowedRoles={['ADMIN','SALES']}><ChallanFormPage /></RoleGuard>} />

            {/* Analytics & Reports Routes */}
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="reports" element={<ReportsPage />} />

            {/* Enterprise Module Routes */}
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="audit-logs" element={<RoleGuard allowedRoles={['ADMIN']}><AuditLogsPage /></RoleGuard>} />
            <Route path="backup-restore" element={<RoleGuard allowedRoles={['ADMIN']}><BackupRestorePage /></RoleGuard>} />
            <Route path="settings" element={<RoleGuard allowedRoles={['ADMIN']}><SettingsPage /></RoleGuard>} />
            <Route path="register-user" element={<RoleGuard allowedRoles={['ADMIN']}><RegisterPage /></RoleGuard>} />

            {/* Warehouse Module Routes */}
            <Route path="warehouses" element={<RoleGuard allowedRoles={['ADMIN','WAREHOUSE']}><WarehouseListPage /></RoleGuard>} />
            <Route path="warehouses/new" element={<RoleGuard allowedRoles={['ADMIN','WAREHOUSE']}><WarehouseFormPage /></RoleGuard>} />
            <Route path="warehouses/:id" element={<RoleGuard allowedRoles={['ADMIN','WAREHOUSE']}><WarehouseDetailsPage /></RoleGuard>} />
            <Route path="warehouses/:id/edit" element={<RoleGuard allowedRoles={['ADMIN','WAREHOUSE']}><WarehouseFormPage /></RoleGuard>} />

            {/* Intelligent Email Logs Route */}
            <Route path="email-logs" element={<RoleGuard allowedRoles={['ADMIN']}><EmailLogsPage /></RoleGuard>} />
          </Route>

          {/* Root landing page */}
          <Route
            path="/"
            element={<LandingPage />}
          />
          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
