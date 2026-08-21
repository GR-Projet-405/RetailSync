import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeBranch, setActiveBranch] = useState('Central WH');
  const [branches, setBranches] = useState(['Central WH']);

  const fetchBranches = async (userData) => {
    try {
      const res = await api.get('/branch-management/active');
      if (res.data && res.data.data) {
        // Only allow these 5 QA branch codes
        const qaBranchCodes = ['CWH-001', 'WWH-002', 'R-001', 'R-002', 'BR001'];
        
        // Filter by checking if the branch's code is in our approved list
        const filteredBranches = res.data.data.filter(b => qaBranchCodes.includes(b.code));
        
        // Extract names to use in the frontend UI
        const branchNames = filteredBranches.map(b => b.name);
        setBranches(branchNames);
        
        // Default to user's branch if it exists, otherwise Central WH
        const userBranchName = userData?.branchId?.branchName || userData?.branchId?.name;
        if (userBranchName && branchNames.includes(userBranchName)) {
          setActiveBranch(userBranchName);
        } else if (branchNames.includes('Central WH')) {
          setActiveBranch('Central WH');
        } else if (branchNames.length > 0) {
          setActiveBranch(branchNames[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch branches in AuthContext:', err);
    }
  };

  useEffect(() => {
    // Check if token exists on load
    const initializeAuth = async () => {
      const token = localStorage.getItem('retailsync_token');
      if (token) {
        try {
          // Set token to default axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await api.get('/auth/me');
          const userData = res.data.data;
          setUser(userData);
          await fetchBranches(userData);
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
      const payload = res.data?.data || res.data;
      const userData = payload?.user || payload?.userData;
      const token = payload?.token || payload?.accessToken || payload?.jwt;
      
      if (!userData || !token) {
        throw new Error('Unexpected login response from server');
      }

      localStorage.setItem('retailsync_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      await fetchBranches(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Auth login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('retailsync_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setActiveBranch('Central WH');
    setBranches(['Central WH']);
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
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      getCurrentUser, 
      hasRole, 
      hasPermission,
      activeBranch,
      setActiveBranch,
      branches
    }}>
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
