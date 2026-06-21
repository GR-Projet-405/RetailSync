import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useSidebar } from '../contexts/SidebarContext';
import { cn } from '../utils/cn';

export const MainLayout = () => {
  const { isSidebarOpen, closeMobileSidebar } = useSidebar();

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Mobile backdrop drawer overlay */}
      {isSidebarOpen && (
        <div 
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Main panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar />

        {/* Dynamic page content scroll wrapper */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
