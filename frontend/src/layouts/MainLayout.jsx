import { Outlet } from 'react-router-dom';
import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import WorkspaceContainer from '../components/WorkspaceContainer';

// This file now accepts 'children' directly so we can use it in App.jsx
export const MainLayout = ({ children }) => {
  return (
    <div
      className="h-screen flex overflow-hidden relative"
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar />
        {/* Workspace Wrapper */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative p-4 sm:p-5 md:p-6">
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
          {children ?? <Outlet />}
          
        </main>
      </div>
    </div>
  );
};

export default MainLayout;