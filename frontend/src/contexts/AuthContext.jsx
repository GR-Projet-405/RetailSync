import React, { createContext, useContext, useState } from 'react';
import { ROLES } from '../config/roles';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'Alex Mercer',
    email: 'admin@retailsync.com',
    role: ROLES.SUPER_ADMIN,
  });

  const [activeBranch, setActiveBranch] = useState('Main Branch HQ');

  const branches = [
    'Main Branch HQ',
    'Downtown Retail Hub',
    'East Warehouse Depot',
    'Westside Outlet'
  ];

  const updateRole = (newRole) => {
    if (ROLES[newRole]) {
      setUser((prev) => ({ ...prev, role: newRole }));
    }
  };

  const logout = () => {
    setUser(null);
  };

  const login = (email, role = ROLES.SUPER_ADMIN) => {
    setUser({
      name: 'Alex Mercer',
      email,
      role
    });
  };

  return (
    <AuthContext.Provider value={{ user, activeBranch, setActiveBranch, branches, updateRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
