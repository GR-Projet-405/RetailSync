import { ShoppingCart, Wallet, TrendingUp, CalendarDays } from 'lucide-react';

const statItems = [
  { title: 'Total Orders', valueKey: 'totalOrders', icon: ShoppingCart, suffix: '', badge: '+12% vs last mo.' },
  { title: 'Total Spending', valueKey: 'totalSpending', icon: Wallet, suffix: '', badge: '+8.4% vs last mo.' },
  { title: 'Average Order Value', valueKey: 'averageOrderValue', icon: TrendingUp, suffix: '', badge: null },
  { title: 'Last Order Date', valueKey: 'lastOrderDate', icon: CalendarDays, suffix: '', badge: null },
];

export const CustomerStatsGrid = ({ stats }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Icon size={18} />
              </div>
              {item.badge && (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                  {item.badge}
                </span>
              )}
            </div>
            <p className="mt-6 text-sm font-semibold text-slate-500">{item.title}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {stats[item.valueKey]}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default CustomerStatsGrid;
