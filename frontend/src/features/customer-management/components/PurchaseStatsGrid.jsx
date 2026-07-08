import { ShoppingCart, Package, CreditCard, TrendingUp } from 'lucide-react';

const statsConfig = [
  { title: 'Total Orders', valueKey: 'totalOrders', icon: ShoppingCart, badge: '+8.2%' , badgeVariant: 'success', iconBg: 'bg-sky-100 text-sky-600' },
  { title: 'Total Items Purchased', valueKey: 'totalItems', icon: Package, badge: '+12.4%', badgeVariant: 'success', iconBg: 'bg-indigo-100 text-indigo-600' },
  { title: 'Total Amount Spent', valueKey: 'totalAmount', icon: CreditCard, badge: '-2.1%', badgeVariant: 'danger', iconBg: 'bg-slate-100 text-slate-700' },
  { title: 'Average Order Value', valueKey: 'averageOrderValue', icon: TrendingUp, badge: '+5.6%', badgeVariant: 'success', iconBg: 'bg-sky-100 text-sky-600' },
];

const badgeStyles = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
};

export const PurchaseStatsGrid = ({ stats }) => {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {statsConfig.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconBg}`}>
                <Icon size={18} />
              </div>
              <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${badgeStyles[item.badgeVariant]}`}>
                {item.badge}
              </span>
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

export default PurchaseStatsGrid;
