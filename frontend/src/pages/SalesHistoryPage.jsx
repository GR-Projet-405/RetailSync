import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Card } from '../components/Card';

const moduleTabs = [
  { name: 'Sales Dashboard', path: '/sales-history/dashboard' },
  { name: 'Transaction History', path: '/sales-history/transactions' },
];

export default function SalesHistoryPage() {
  const location = useLocation();

  if (location.pathname === '/sales-history') {
    return <Navigate to="/sales-history/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[16px] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#2563EB]">Sales History Module</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#0F172A]">Sales History</h1>
            <p className="mt-2 text-sm text-slate-500">Use the dashboard for KPIs and the transaction screen for detailed records.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {moduleTabs.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-[0_10px_20px_rgba(37,99,235,0.18)]'
                      : 'border border-[#E2E8F0] bg-white text-slate-700 hover:border-[#BFDBFE] hover:bg-slate-50'
                  }`
                }
              >
                {tab.name}
              </NavLink>
            ))}
          </div>
        </div>
      </Card>

      <Outlet />
    </div>
  );
}
