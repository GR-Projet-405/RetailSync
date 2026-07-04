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
import VerifyOTPPage from '../features/auth/VerifyOTPPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage'; 
import SelectRolePage from '../features/auth/SelectRolePage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/ResetPasswordPage';
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
import AddCustomerPage from '../pages/AddCustomerPage';
import CustomerProfilePage from '../pages/CustomerProfilePage';
import CustomerHistoryPage from '../pages/CustomerHistoryPage';
import CustomerSearchPage from '../pages/CustomerSearchPage';



// Convenience arrays
const ALL_ROLES = Object.values(ROLES);
const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
const MANAGEMENT_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER];
const INVENTORY_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.INVENTORY_MANAGER];
const SALES_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.CASHIER];
const POS_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.CASHIER];

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOTPPage />} />
      <Route path="/select-role" element={<SelectRolePage />} /> 
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      {/* POS Billing Route - Full-screen layout */}
      <Route element={
        <ProtectedRoute allowedRoles={POS_ROLES}>
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
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <DashboardPage />
          </ProtectedRoute>
        } />

        {/* Notifications */}
        <Route path="/notifications" element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <NotificationsPage />
          </ProtectedRoute>
        } />

        {/* Help & Support */}
        <Route path="/help-support" element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <HelpSupportPage />
          </ProtectedRoute>
        } />

        {/* Profile & Settings */}
        <Route path="/profile-settings" element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <ProfileSettingsPage />
          </ProtectedRoute>
        } />

        {/* Authentication Info page */}
        <Route path="/auth-info" element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <AuthPage />
          </ProtectedRoute>
        } />

        {/* Audit Logs */}
        <Route path="/audit-logs" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.AUDITOR]}>
            <AuditLogsPage />
          </ProtectedRoute>
        } />

        {/* User & Role Management */}
        <Route path="/users-roles" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <UserRolePage />
          </ProtectedRoute>
        } />

        {/* Employee Management */}
        <Route path="/employees" element={
          <ProtectedRoute allowedRoles={MANAGEMENT_ROLES}>
            <EmployeePage />
          </ProtectedRoute>
        } />

        {/* Branch Management */}
        <Route path="/branches" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <BranchPage />
          </ProtectedRoute>
        } />

        {/* Warehouse Management */}
        <Route path="/warehouses" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}>
            <WarehousePage />
          </ProtectedRoute>
        } />

        {/* Product Management */}
        <Route path="/products" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}>
            <ProductPage />
          </ProtectedRoute>
        } />

        {/* Category Management */}
        <Route path="/categories" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}>
            <CategoryPage />
          </ProtectedRoute>
        } />

        {/* Inventory Management */}
        <Route path="/inventory" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}>
            <InventoryPage />
          </ProtectedRoute>
        } />

        {/* Supplier Management */}
        <Route path="/suppliers" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}>
            <SupplierPage />
          </ProtectedRoute>
        } />

        {/* Purchase Orders */}
        <Route path="/purchase-orders" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}>
            <PurchaseOrderPage />
          </ProtectedRoute>
        } />

        {/* Goods Receiving */}
        <Route path="/goods-receiving" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}>
            <GoodsReceivingPage />
          </ProtectedRoute>
        } />

        {/* Stock Transfers */}
        <Route path="/stock-transfers" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}>
            <StockTransferPage />
          </ProtectedRoute>
        } />

        {/* Payment Processing */}
        <Route path="/payment-processing" element={
          <ProtectedRoute allowedRoles={SALES_ROLES}>
            <PaymentProcessingPage />
          </ProtectedRoute>
        } />

        {/* Sales History */}
        <Route path="/sales-history" element={
          <ProtectedRoute allowedRoles={SALES_ROLES}>
            <SalesHistoryPage />
          </ProtectedRoute>
        } />

        {/* Returns & Refunds */}
        <Route path="/returns-refunds" element={
          <ProtectedRoute allowedRoles={SALES_ROLES}>
            <ReturnsRefundsPage />
          </ProtectedRoute>
        } />

        {/* Promotions & Discounts */}
        <Route path="/promotions-discounts" element={
          <ProtectedRoute allowedRoles={SALES_ROLES}>
            <PromotionsDiscountsPage />
          </ProtectedRoute>
        } />

        {/* Customer Management */}
        <Route path="/customers" element={
          <ProtectedRoute allowedRoles={SALES_ROLES}>
            <CustomerPage />
          </ProtectedRoute>
        } />
        <Route path="/customers/new" element={
          <ProtectedRoute allowedRoles={SALES_ROLES}>
            <AddCustomerPage />
          </ProtectedRoute>
        } />
        <Route path="/customers/search" element={
          <ProtectedRoute allowedRoles={SALES_ROLES}>
            <CustomerSearchPage />
          </ProtectedRoute>
        } />
        <Route path="/customers/:id" element={
          <ProtectedRoute allowedRoles={SALES_ROLES}>
            <CustomerProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/customers/:id/history" element={
          <ProtectedRoute allowedRoles={SALES_ROLES}>
            <CustomerHistoryPage />
          </ProtectedRoute>
        } />

        {/* Reports */}
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={[...MANAGEMENT_ROLES, ROLES.AUDITOR]}>
            <ReportsPage />
          </ProtectedRoute>
        } />

        {/* Business Analytics */}
        <Route path="/business-analytics" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <BusinessAnalyticsPage />
          </ProtectedRoute>
        } />

        {/* AI Forecasting */}
        <Route path="/ai-forecasting" element={
          <ProtectedRoute allowedRoles={MANAGEMENT_ROLES}>
            <AIForecastingPage />
          </ProtectedRoute>
        } />

        {/* AI Reordering */}
        <Route path="/ai-reordering" element={
          <ProtectedRoute allowedRoles={MANAGEMENT_ROLES}>
            <AIReorderingPage />
          </ProtectedRoute>
        } />

        {/* AI Assistant */}
        <Route path="/ai-assistant" element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
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
