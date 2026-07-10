import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import WorkspaceContainer from '../components/WorkspaceContainer';

// This file now accepts 'children' directly so we can use it in App.jsx
export const MainLayout = ({ children }) => {
  return (
    <div
      className="relative flex h-screen overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at top right, rgba(59,130,246,0.05), transparent 35%),
          linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 55%, #EFF6FF 100%)
        `
      }}
    >
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main panel */}
      <div className="relative flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />
        {/* Workspace Wrapper */}
        <main className="relative flex-1 p-4 overflow-x-hidden overflow-y-auto sm:p-5 md:p-6">
          {/* Workspace Container — frosted glass surface */}
          {/* Commented out useContainer logic for now
          {useContainer ? (
            <WorkspaceContainer>
              {children} 
            </WorkspaceContainer>
          ) : (
            <Outlet />
          )}
          */}

          {/* Temporary render to make the app work */}
          {children || <Outlet />}

        </main>
      </div>
    </div>
  );
};

export default MainLayout;