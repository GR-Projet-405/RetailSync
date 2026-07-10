import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import MainLayout from './layouts/MainLayout';
import AuditLogsPage from './pages/AuditLogsPage';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  const updateRole = (newRole) => {
    setUserRole(newRole);
  };


  if (userRole === null && window.location.pathname !== '/login') {
    return <div className="flex items-center justify-center h-screen text-blue-600">Loading RetailSync...</div>;
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

            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </AuthProvider>

  );
}

export default App;