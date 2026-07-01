import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft, Monitor } from 'lucide-react';
import BranchSelector from '../components/BranchSelector';
import WorkspaceContainer from '../components/WorkspaceContainer';
import { useAuth } from '../contexts/AuthContext';

export const POSLayout = () => {
  const { user } = useAuth();
  const cashierName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'Cashier'
    : 'Cashier';
  const cashierRole = user?.roleId?.name || 'Cashier';
  
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* POS Top Header */}
      <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard" 
            className="flex items-center justify-center p-2 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-[#1E40AF] group-hover:text-[#2563EB] transition-colors" />
          </Link>
          <div className="flex items-center gap-3 h-8">
            <div className="h-8 w-8 rounded-xl bg-[#2563EB] flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-blue-500/20">
              TS
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 leading-none">TalentSync POS</div>
              <div className="text-xs text-slate-500 mt-1">Sales terminal</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex justify-center max-w-xl mx-auto px-4">
          {/* Optional centered element slot if needed */}
        </div>

        <div className="flex items-center gap-6">
          <BranchSelector />
          <div className="h-6 w-px bg-[#E2E8F0]" />
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-200">{cashierName}</div>
            <div className="text-xs text-[#2563EB] font-medium">Terminal active • {cashierRole}</div>
          </div>
        </div>
      </header>

      {/* POS Working Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative p-4 sm:p-5 md:p-6 bg-[linear-gradient(180deg,#F8FAFC_0%,#EFF6FF_100%)]">
        <WorkspaceContainer>
          <Outlet />
        </WorkspaceContainer>
      </main>
    </div>
  );
};

export default POSLayout;
