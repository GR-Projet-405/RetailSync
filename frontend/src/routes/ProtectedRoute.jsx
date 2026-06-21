import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';
import Card, { CardContent } from '../components/Card';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Render Access Denied
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full border-red-500/30 bg-red-950/10 backdrop-blur-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Access Denied</h2>
            <p className="text-sm text-slate-400">
              Your current role (<span className="text-red-400 font-semibold">{user.role}</span>) does not have permission to access <code className="text-xs bg-slate-900 px-1.5 py-0.5 rounded text-slate-300">{location.pathname}</code>.
            </p>
            <p className="text-xs text-slate-500">
              Use the demo role dropdown selector in the Navbar to switch roles.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
