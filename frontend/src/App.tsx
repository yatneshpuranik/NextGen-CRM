import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardLayout from './layouts/DashboardLayout';
import CustomersPage from './pages/CustomersPage';
import CustomerFormPage from './pages/CustomerFormPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import ProductDetailsPage from './pages/ProductDetailsPage';

// Import newly created Inventory pages
import InventoryPage from './pages/InventoryPage';
import InventoryDashboardPage from './pages/InventoryDashboardPage';
import InventoryHistoryPage from './pages/InventoryHistoryPage';
import LowStockReportPage from './pages/LowStockReportPage';
import InventoryDetailsPage from './pages/InventoryDetailsPage';

// Import newly created Sales Challan pages
import ChallansPage from './pages/ChallansPage';
import ChallanFormPage from './pages/ChallanFormPage';
import ChallanDetailsPage from './pages/ChallanDetailsPage';

// Import newly created Analytics & Reports pages
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';

// Import newly created Enterprise pages
import AuditLogsPage from './pages/AuditLogsPage';
import SettingsPage from './pages/SettingsPage';
import BackupRestorePage from './pages/BackupRestorePage';
import NotificationsPage from './pages/NotificationsPage';
import RoleGuard from './components/RoleGuard';

// Import Warehouse & Email Log pages
import WarehouseListPage from './pages/WarehouseListPage';
import WarehouseFormPage from './pages/WarehouseFormPage';
import WarehouseDetailsPage from './pages/WarehouseDetailsPage';
import EmailLogsPage from './pages/EmailLogsPage';

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Router future={{ v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public auth pages */}
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/register"
          element={<RegisterPage />}
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
    </Router>
  );
}

export default App;
