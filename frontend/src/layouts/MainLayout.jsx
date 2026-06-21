import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import WorkspaceContainer from '../components/WorkspaceContainer';
import { useSidebar } from '../contexts/SidebarContext';

export const MainLayout = () => {
  const { isSidebarOpen, closeMobileSidebar } = useSidebar();

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

      {/* Mobile backdrop overlay */}
      {isSidebarOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Main panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar />

        {/* Workspace Wrapper — scrollable outer area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative p-4 sm:p-5 md:p-6">
          {/* Workspace Container — frosted glass surface */}
          <WorkspaceContainer>
            <Outlet />
          </WorkspaceContainer>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
