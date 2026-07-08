import { CalendarDays } from 'lucide-react';

export const CustomerFilterForm = ({ filters, onChange }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 xl:grid-cols-4">
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-semibold">Customer Name</span>
          <input
            type="text"
            value={filters.customerName}
            onChange={(e) => onChange('customerName', e.target.value)}
            placeholder="Enter customer name"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-semibold">Phone Number</span>
          <input
            type="text"
            value={filters.phoneNumber}
            onChange={(e) => onChange('phoneNumber', e.target.value)}
            placeholder="Enter phone number"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-semibold">Customer Type</span>
          <select
            value={filters.customerType}
            onChange={(e) => onChange('customerType', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="">Select type</option>
            <option value="Premium">Premium</option>
            <option value="Regular">Regular</option>
            <option value="Wholesale">Wholesale</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-semibold">Customer Status</span>
          <select
            value={filters.customerStatus}
            onChange={(e) => onChange('customerStatus', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="">Select status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-4">
        <div className="grid xl:col-span-2 gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-semibold">Purchase Date Range</span>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => onChange('startDate', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => onChange('endDate', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
            </div>
          </label>
        </div>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-semibold">Minimum Purchase Amount</span>
          <input
            type="number"
            min="0"
            value={filters.minAmount}
            onChange={(e) => onChange('minAmount', e.target.value)}
            placeholder="Enter minimum amount"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </label>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-4">
        <label className="space-y-2 text-sm text-slate-700 xl:col-span-2">
          <span className="font-semibold">Maximum Purchase Amount</span>
          <input
            type="number"
            min="0"
            value={filters.maxAmount}
            onChange={(e) => onChange('maxAmount', e.target.value)}
            placeholder="Enter maximum amount"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700 xl:col-span-2">
          <span className="font-semibold">Sort By</span>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange('sortBy', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="">Select sorting option</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="spending-desc">Total Spending High-Low</option>
            <option value="spending-asc">Total Spending Low-High</option>
            <option value="orders-desc">Total Orders High-Low</option>
            <option value="recent">Most Recent</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default CustomerFilterForm;
