import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import ProtectedRoute from './components/ProtectedRoute';

// Import newly created pages
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
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/new" element={<CustomerFormPage />} />
          <Route path="customers/:id" element={<CustomerDetailsPage />} />
          <Route path="customers/:id/edit" element={<CustomerFormPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id" element={<ProductDetailsPage />} />
          <Route path="products/:id/edit" element={<ProductFormPage />} />
          
          {/* Inventory Module Routes */}
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="inventory/dashboard" element={<InventoryDashboardPage />} />
          <Route path="inventory/history" element={<InventoryHistoryPage />} />
          <Route path="inventory/low-stock" element={<LowStockReportPage />} />
          <Route path="inventory/:productId" element={<InventoryDetailsPage />} />

          {/* Sales Challan Module Routes */}
          <Route path="sales-challans" element={<ChallansPage />} />
          <Route path="sales-challans/new" element={<ChallanFormPage />} />
          <Route path="sales-challans/:id" element={<ChallanDetailsPage />} />
          <Route path="sales-challans/:id/edit" element={<ChallanFormPage />} />

          {/* Analytics & Reports Routes */}
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="reports" element={<ReportsPage />} />

          {/* Enterprise Module Routes */}
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="audit-logs" element={<RoleGuard allowedRoles={['ADMIN']}><AuditLogsPage /></RoleGuard>} />
          <Route path="backup-restore" element={<RoleGuard allowedRoles={['ADMIN']}><BackupRestorePage /></RoleGuard>} />
          <Route path="settings" element={<RoleGuard allowedRoles={['ADMIN']}><SettingsPage /></RoleGuard>} />
        </Route>

        {/* Catch all and route to dashboard or login */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
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
