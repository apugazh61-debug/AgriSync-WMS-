import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import WarehousesPage from './pages/WarehousesPage';
import SuppliersPage from './pages/SuppliersPage';
import OrdersPage from './pages/OrdersPage';
import InboundPage from './pages/InboundPage';
import AnalyticsPage from './pages/AnalyticsPage';
import QrScannerPage from './pages/QrScannerPage';
import SettingsPage from './pages/SettingsPage';
import EmployeesPage from './pages/EmployeesPage';

// Enterprise Agricultural Modules
import IoTTelemetryPage from './pages/IoTTelemetryPage';
import BatchLotsPage from './pages/BatchLotsPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import GatePassPage from './pages/GatePassPage';
import WarehouseZonesPage from './pages/WarehouseZonesPage';

function ProtectedRoute({ children, reqRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (reqRole && user.role !== reqRole) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1" style={{ minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
      
      {/* Enterprise Agri Modules */}
      <Route path="/iot-telemetry" element={<ProtectedRoute><AppLayout><IoTTelemetryPage /></AppLayout></ProtectedRoute>} />
      <Route path="/batch-lots" element={<ProtectedRoute><AppLayout><BatchLotsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/purchase-orders" element={<ProtectedRoute><AppLayout><PurchaseOrdersPage /></AppLayout></ProtectedRoute>} />
      <Route path="/gate-passes" element={<ProtectedRoute><AppLayout><GatePassPage /></AppLayout></ProtectedRoute>} />
      <Route path="/zones" element={<ProtectedRoute><AppLayout><WarehouseZonesPage /></AppLayout></ProtectedRoute>} />

      <Route path="/products" element={<ProtectedRoute><AppLayout><ProductsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><AppLayout><InventoryPage /></AppLayout></ProtectedRoute>} />
      <Route path="/warehouses" element={<ProtectedRoute><AppLayout><WarehousesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/suppliers" element={<ProtectedRoute><AppLayout><SuppliersPage /></AppLayout></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><AppLayout><OrdersPage /></AppLayout></ProtectedRoute>} />
      <Route path="/inbound" element={<ProtectedRoute><AppLayout><InboundPage /></AppLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AppLayout><AnalyticsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/qr-scanner" element={<ProtectedRoute><AppLayout><QrScannerPage /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/employees" element={<ProtectedRoute reqRole="ADMIN"><AppLayout><EmployeesPage /></AppLayout></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#1e293b',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#ffffff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
