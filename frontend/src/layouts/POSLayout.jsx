import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft, Monitor } from 'lucide-react';
import BranchSelector from '../components/BranchSelector';
import WorkspaceContainer from '../components/WorkspaceContainer';
import { useAuth } from '../contexts/AuthContext';

export const POSLayout = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* POS Top Header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard" 
            className="flex items-center justify-center p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </Link>
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-lg text-slate-200 tracking-tight">RetailSync POS Terminal</span>
          </div>
        </div>

        <div className="flex-1 flex justify-center max-w-xl mx-auto px-4">
          {/* Optional centered element slot if needed */}
        </div>

        <div className="flex items-center gap-6">
          <BranchSelector />
          <div className="h-6 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-200">{user?.name || 'Cashier'}</div>
            <div className="text-xs text-indigo-400 font-medium">Terminal active • {user?.role}</div>
          </div>
        </div>
      </header>

      {/* POS Working Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <WorkspaceContainer>
          <Outlet />
        </WorkspaceContainer>
      </main>
    </div>
  );
};

export default POSLayout;
