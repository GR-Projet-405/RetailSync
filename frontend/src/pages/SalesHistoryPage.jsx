import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, Download, FileSearch, LayoutDashboard, ReceiptText, Search } from 'lucide-react';
import { Card } from '../components/Card';

const moduleTabs = [
  { name: 'Sales Dashboard', path: '/sales-history/dashboard', icon: LayoutDashboard },
  { name: 'Transaction History', path: '/sales-history/transactions', icon: ReceiptText },
  { name: 'Sales Details', path: '/sales-history/details', icon: FileSearch },
  { name: 'Filters & Search', path: '/sales-history/filters', icon: Search },
  { name: 'Export Reports', path: '/sales-history/export', icon: Download },
];

export default function SalesHistoryPage() {
  const location = useLocation();

  if (location.pathname === '/sales-history') {
    return <Navigate to="/sales-history/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-[16px] border-slate-200 bg-white p-0">
        <div className="flex flex-col gap-5 bg-gradient-to-br from-white via-slate-50 to-blue-50/70 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-[0_14px_28px_rgba(37,99,235,0.22)]">
              <BarChart3 className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2563EB]">Sales History Module</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#0F172A]">Sales History</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {moduleTabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={({ isActive }) =>
                    `group flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)]'
                        : 'border-slate-200 bg-white/90 text-slate-700 shadow-sm hover:border-[#BFDBFE] hover:bg-white hover:text-[#1D4ED8]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-[#2563EB]'
                        }`}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="whitespace-nowrap">{tab.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </Card>

      <Outlet />
    </div>
  );
}
