import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusClasses = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Inactive: 'bg-red-50 text-red-700 border-red-200',
};

export const CustomerSearchResultsTable = ({ customers }) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[780px] text-left border-collapse text-sm text-slate-700">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <th className="px-5 py-4">CUSTOMER NAME</th>
            <th className="px-5 py-4">PHONE NUMBER</th>
            <th className="px-5 py-4">EMAIL</th>
            <th className="px-5 py-4 text-right">TOTAL ORDERS</th>
            <th className="px-5 py-4 text-right">TOTAL SPENDING</th>
            <th className="px-5 py-4">STATUS</th>
            <th className="px-5 py-4">ACTION</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {customers.map((customer) => (
            <tr key={customer._id} className="hover:bg-slate-50 transition-colors duration-150">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                    {customer.name
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <span className="font-semibold text-slate-900">{customer.name}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-slate-500">{customer.phone}</td>
              <td className="px-5 py-4 text-slate-500">{customer.email}</td>
              <td className="px-5 py-4 text-right font-semibold text-slate-900">{customer.totalOrders}</td>
              <td className="px-5 py-4 text-right font-semibold text-slate-900">Rs. {customer.totalSpending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="px-5 py-4">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[customer.status]}`}>
                  {customer.status}
                </span>
              </td>
              <td className="px-5 py-4">
                <button
                  type="button"
                  onClick={() => navigate(`/customers/${customer._id}`)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition"
                >
                  <Eye size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerSearchResultsTable;
