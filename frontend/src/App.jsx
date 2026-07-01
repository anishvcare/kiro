import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getRoleHome } from './utils/roleRedirect';
import socketService from './services/socketService';
import InstallPWAButton from './components/InstallPWAButton';
import Profile from './pages/Profile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';
import ShopLayout from './layouts/ShopLayout';
import DeliveryAgentLayout from './layouts/DeliveryAgentLayout';
import DeliveryBoyLayout from './layouts/DeliveryBoyLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ShopManagement from './pages/admin/ShopManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import ServiceAreas from './pages/admin/ServiceAreas';
import DeliverySettings from './pages/admin/DeliverySettings';
import Reports from './pages/admin/Reports';
import ExportReports from './pages/admin/ExportReports';
import AuditLogs from './pages/admin/AuditLogs';
import SystemSettings from './pages/admin/SystemSettings';
import SupportTickets from './pages/admin/SupportTickets';
import Notifications from './pages/admin/Notifications';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import SearchResults from './pages/customer/SearchResults';
import ShopProfile from './pages/customer/ShopProfile';
import CreateRequest from './pages/customer/CreateRequest';
import MyRequests from './pages/customer/MyRequests';
import RequestDetail from './pages/customer/RequestDetail';
import ShopDashboard from './pages/shop/ShopDashboard';
import ShopRegistration from './pages/shop/ShopRegistration';
import ShopProfileSettings from './pages/shop/ShopProfileSettings';
import ShopRequests from './pages/shop/ShopRequests';
import ShopRequestDetail from './pages/shop/RequestDetail';
import CreateQuotation from './pages/shop/CreateQuotation';
import QuotationHistory from './pages/shop/QuotationHistory';
import AgentDashboard from './pages/delivery-agent/AgentDashboard';
import AssignDelivery from './pages/delivery-agent/AssignDelivery';
import DeliveryBoyManagement from './pages/delivery-agent/DeliveryBoyManagement';
import CashReport from './pages/delivery-agent/CashReport';
import PerformanceReport from './pages/delivery-agent/PerformanceReport';
import BoyDashboard from './pages/delivery-boy/BoyDashboard';
import ActiveDelivery from './pages/delivery-boy/ActiveDelivery';
import CashCollection from './pages/delivery-boy/CashCollection';
import DeliveryProof from './pages/delivery-boy/DeliveryProof';
import DeliveryHistory from './pages/delivery-boy/DeliveryHistory';
import CustomerChat from './pages/customer/Chat';
import ShopChat from './pages/shop/Chat';
import TrackDelivery from './pages/customer/TrackDelivery';
import HomePage from './pages/HomePage';
import PublicSearchResults from './pages/explore/SearchResults';
import PublicShopProfile from './pages/explore/ShopProfile';

const RoleHome = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={getRoleHome(user)} replace />;
};

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-red-600">403</h1>
      <p className="mt-2 text-gray-600">You do not have permission to access this page.</p>
    </div>
  </div>
);

function App() {
  const { isAuthenticated, tokens } = useSelector((state) => state.auth);

  // Establish the Socket.IO connection once the user is authenticated so that
  // live tracking, chat and notifications work in real time.
  useEffect(() => {
    if (isAuthenticated && tokens?.accessToken) {
      socketService.connect(tokens.accessToken);
    } else {
      socketService.disconnect();
    }
  }, [isAuthenticated, tokens]);

  return (
    <>
      <InstallPWAButton />
      <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Public explore routes (no auth required) */}
      <Route path="/explore/search" element={<PublicSearchResults />} />
      <Route path="/explore/shop/:id" element={<PublicShopProfile />} />

      {/* Admin routes - Super Admin only */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="shops" element={<ShopManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="service-areas" element={<ServiceAreas />} />
        <Route path="delivery-settings" element={<DeliverySettings />} />
        <Route path="reports" element={<Reports />} />
        <Route path="export-reports" element={<ExportReports />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="support-tickets" element={<SupportTickets />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Customer routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerDashboard />} />
        <Route path="search" element={<SearchResults />} />
        <Route path="shop/:id" element={<ShopProfile />} />
        <Route path="create-request/:shopId" element={<CreateRequest />} />
        <Route path="requests" element={<MyRequests />} />
        <Route path="request/:id" element={<RequestDetail />} />
        <Route path="chat" element={<CustomerChat />} />
        <Route path="track/:assignmentId" element={<TrackDelivery />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Shop Owner routes */}
      <Route
        path="/shop"
        element={
          <ProtectedRoute allowedRoles={['shop_owner']}>
            <ShopLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ShopDashboard />} />
        <Route path="register" element={<ShopRegistration />} />
        <Route path="settings" element={<ShopProfileSettings />} />
        <Route path="requests" element={<ShopRequests />} />
        <Route path="request/:id" element={<ShopRequestDetail />} />
        <Route path="create-quotation/:requestId" element={<CreateQuotation />} />
        <Route path="quotation-history" element={<QuotationHistory />} />
        <Route path="chat" element={<ShopChat />} />
      </Route>

      {/* Delivery Agent routes */}
      <Route
        path="/delivery-agent"
        element={
          <ProtectedRoute allowedRoles={['delivery_agent']}>
            <DeliveryAgentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AgentDashboard />} />
        <Route path="assign" element={<AssignDelivery />} />
        <Route path="delivery-boys" element={<DeliveryBoyManagement />} />
        <Route path="cash-report" element={<CashReport />} />
        <Route path="performance" element={<PerformanceReport />} />
      </Route>

      {/* Delivery Boy routes */}
      <Route
        path="/delivery-boy"
        element={
          <ProtectedRoute allowedRoles={['delivery_boy']}>
            <DeliveryBoyLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<BoyDashboard />} />
        <Route path="active" element={<ActiveDelivery />} />
        <Route path="cash-collection" element={<CashCollection />} />
        <Route path="proof" element={<DeliveryProof />} />
        <Route path="history" element={<DeliveryHistory />} />
        <Route path="earnings" element={<DeliveryHistory />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Role-based home redirect */}
      <Route path="/dashboard" element={<RoleHome />} />

      {/* Catch-all redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

export default App;
