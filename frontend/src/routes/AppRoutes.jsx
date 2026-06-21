import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { ROLES } from '../config/roles';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import POSLayout from '../layouts/POSLayout';

// Page Imports
import DashboardPage from '../pages/DashboardPage';
import AuthPage from '../pages/AuthPage';
import NotificationsPage from '../pages/NotificationsPage';
import ProfileSettingsPage from '../pages/ProfileSettingsPage';
import BranchPage from '../pages/BranchPage';
import EmployeePage from '../pages/EmployeePage';
import CustomerPage from '../pages/CustomerPage';
import SupplierPage from '../pages/SupplierPage';
import UserRolePage from '../pages/UserRolePage';
import ProductPage from '../pages/ProductPage';
import CategoryPage from '../pages/CategoryPage';
import InventoryPage from '../pages/InventoryPage';
import WarehousePage from '../pages/WarehousePage';
import PurchaseOrderPage from '../pages/PurchaseOrderPage';
import GoodsReceivingPage from '../pages/GoodsReceivingPage';
import StockTransferPage from '../pages/StockTransferPage';
import POSBillingPage from '../pages/POSBillingPage';
import PaymentProcessingPage from '../pages/PaymentProcessingPage';
import SalesHistoryPage from '../pages/SalesHistoryPage';
import ReturnsRefundsPage from '../pages/ReturnsRefundsPage';
import PromotionsDiscountsPage from '../pages/PromotionsDiscountsPage';
import ReportsPage from '../pages/ReportsPage';
import BusinessAnalyticsPage from '../pages/BusinessAnalyticsPage';
import AIForecastingPage from '../pages/AIForecastingPage';
import AIReorderingPage from '../pages/AIReorderingPage';
import AIAssistantPage from '../pages/AIAssistantPage';
import AuditLogsPage from '../pages/AuditLogsPage';
import HelpSupportPage from '../pages/HelpSupportPage';

// Simple Mock Login
const LoginMock = () => {
  const { login } = useAuth();
  const [email, setEmail] = React.useState('admin@retailsync.com');
  const [role, setRole] = React.useState(ROLES.SUPER_ADMIN);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, role);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400">Email Address</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500" 
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400">Default Role Access</label>
        <select 
          value={role} 
          onChange={(e) => setRole(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
        >
          {Object.keys(ROLES).map((roleKey) => (
            <option key={roleKey} value={roleKey}>
              {roleKey}
            </option>
          ))}
        </select>
      </div>
      <button 
        type="submit" 
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2 rounded-lg transition-colors mt-2"
      >
        Sign In to POS
      </button>
    </form>
  );
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginMock />} />
      </Route>

      {/* POS Billing Route - Full-screen layout */}
      <Route element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER]}>
          <POSLayout />
        </ProtectedRoute>
      }>
        <Route path="/pos-billing" element={<POSBillingPage />} />
      </Route>

      {/* Main Dashboard Panel Layout */}
      <Route element={<MainLayout />}>
        {/* Redirect empty paths to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={Object.values(ROLES)}>
            <DashboardPage />
          </ProtectedRoute>
        } />

        {/* Notifications */}
        <Route path="/notifications" element={
          <ProtectedRoute allowedRoles={Object.values(ROLES)}>
            <NotificationsPage />
          </ProtectedRoute>
        } />

        {/* Help & Support */}
        <Route path="/help-support" element={
          <ProtectedRoute allowedRoles={Object.values(ROLES)}>
            <HelpSupportPage />
          </ProtectedRoute>
        } />

        {/* Profile & Settings */}
        <Route path="/profile-settings" element={
          <ProtectedRoute allowedRoles={Object.values(ROLES)}>
            <ProfileSettingsPage />
          </ProtectedRoute>
        } />

        {/* Authentication Info page */}
        <Route path="/auth-info" element={
          <ProtectedRoute allowedRoles={Object.values(ROLES)}>
            <AuthPage />
          </ProtectedRoute>
        } />

        {/* Audit Logs */}
        <Route path="/audit-logs" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AuditLogsPage />
          </ProtectedRoute>
        } />

        {/* User & Role Management */}
        <Route path="/users-roles" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <UserRolePage />
          </ProtectedRoute>
        } />

        {/* Employee Management */}
        <Route path="/employees" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
            <EmployeePage />
          </ProtectedRoute>
        } />

        {/* Branch Management */}
        <Route path="/branches" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <BranchPage />
          </ProtectedRoute>
        } />

        {/* Warehouse Management */}
        <Route path="/warehouses" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF]}>
            <WarehousePage />
          </ProtectedRoute>
        } />

        {/* Product Management */}
        <Route path="/products" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF]}>
            <ProductPage />
          </ProtectedRoute>
        } />

        {/* Category Management */}
        <Route path="/categories" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF]}>
            <CategoryPage />
          </ProtectedRoute>
        } />

        {/* Inventory Management */}
        <Route path="/inventory" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF]}>
            <InventoryPage />
          </ProtectedRoute>
        } />

        {/* Supplier Management */}
        <Route path="/suppliers" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF]}>
            <SupplierPage />
          </ProtectedRoute>
        } />

        {/* Purchase Orders */}
        <Route path="/purchase-orders" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF]}>
            <PurchaseOrderPage />
          </ProtectedRoute>
        } />

        {/* Goods Receiving */}
        <Route path="/goods-receiving" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF]}>
            <GoodsReceivingPage />
          </ProtectedRoute>
        } />

        {/* Stock Transfers */}
        <Route path="/stock-transfers" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF]}>
            <StockTransferPage />
          </ProtectedRoute>
        } />

        {/* Payment Processing */}
        <Route path="/payment-processing" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER]}>
            <PaymentProcessingPage />
          </ProtectedRoute>
        } />

        {/* Sales History */}
        <Route path="/sales-history" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER]}>
            <SalesHistoryPage />
          </ProtectedRoute>
        } />

        {/* Returns & Refunds */}
        <Route path="/returns-refunds" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER]}>
            <ReturnsRefundsPage />
          </ProtectedRoute>
        } />

        {/* Promotions & Discounts */}
        <Route path="/promotions-discounts" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER]}>
            <PromotionsDiscountsPage />
          </ProtectedRoute>
        } />

        {/* Customer Management */}
        <Route path="/customers" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER]}>
            <CustomerPage />
          </ProtectedRoute>
        } />

        {/* Reports */}
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
            <ReportsPage />
          </ProtectedRoute>
        } />

        {/* Business Analytics */}
        <Route path="/business-analytics" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <BusinessAnalyticsPage />
          </ProtectedRoute>
        } />

        {/* AI Forecasting */}
        <Route path="/ai-forecasting" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
            <AIForecastingPage />
          </ProtectedRoute>
        } />

        {/* AI Reordering */}
        <Route path="/ai-reordering" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
            <AIReorderingPage />
          </ProtectedRoute>
        } />

        {/* AI Assistant */}
        <Route path="/ai-assistant" element={
          <ProtectedRoute allowedRoles={Object.values(ROLES)}>
            <AIAssistantPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Fallback to Dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
