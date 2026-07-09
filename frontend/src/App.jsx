import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard'; 
import EmployeeDashboard from './pages/EmployeeDashboard';
import MainLayout from './layouts/MainLayout';
import AuditLogsPage from './pages/AuditLogsPage';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('retailsync_token') || localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('retailsync_userRole') || localStorage.getItem('userRole');
  });

  useEffect(() => {
    const role = localStorage.getItem('retailsync_userRole') || localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  const updateRole = (newRole) => {
    setUserRole(newRole);
  };

  if (!userRole && window.location.pathname !== '/login') {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <AuthProvider>
      <SidebarProvider>
        <BrowserRouter>
          <Routes>
            {/* 1. LOGIN ROUTE */}
            <Route path="/login" element={<LoginPage onLoginSuccess={updateRole} />} />
            
            {/* 2. DASHBOARD ROUTE (Only renders the dashboard) */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <MainLayout>
                    {userRole === 'ADMIN' ? (
                      <AdminDashboard />
                    ) : userRole === 'BRANCH_MANAGER' ? (
                      <ManagerDashboard /> 
                    ) : userRole === 'EMPLOYEE' ? (
                      <EmployeeDashboard /> 
                    ) : (
                      <div className="p-10 text-center text-red-500">Unknown Role detected!</div>
                    )}
                  </MainLayout>
                </PrivateRoute>
              } 
            />

            {/* 3. AUDIT LOG ROUTE (This is its own separate page!) */}
            <Route 
              path="/audit-log" 
              element={
                <PrivateRoute>
                  <MainLayout>
                    <AuditLogsPage />
                  </MainLayout>
                </PrivateRoute>
              } 
            />
            
            {/* 4. CATCH-ALL ROUTE */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;