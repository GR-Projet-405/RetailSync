import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
  // Initialize state from localStorage
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('retailsync_sidebar_collapsed');
    return saved === 'true';
  });

  // Mobile/Tablet drawer open/close state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync isSidebarCollapsed with localStorage
  useEffect(() => {
    localStorage.setItem('retailsync_sidebar_collapsed', isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <SidebarContext.Provider value={{
      isSidebarCollapsed,
      isSidebarOpen,
      toggleSidebar,
      closeMobileSidebar
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export default SidebarContext;
