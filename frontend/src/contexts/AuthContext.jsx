import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists on load
    const initializeAuth = async () => {
      const token = localStorage.getItem('retailsync_token');
      if (token) {
        try {
          // Set token to default axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await api.get('/auth/me');
          setUser(res.data.data);
        } catch (error) {
          console.error('Auth initialization error', error);
          localStorage.removeItem('retailsync_token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: userData, token } = res.data.data;
      
      localStorage.setItem('retailsync_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('retailsync_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const getCurrentUser = () => {
    return user;
  };

  const hasRole = (...roles) => {
    if (!user || !user.roleId) return false;
    return roles.includes(user.roleId.name);
  };

  const hasPermission = (permission) => {
    if (!user || !user.roleId) return false;
    if (user.roleId.name === 'SUPER_ADMIN') return true;
    return user.roleId.permissions?.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getCurrentUser, hasRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
