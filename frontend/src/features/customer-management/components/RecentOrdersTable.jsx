import { Eye, Filter } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const statusClasses = {
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  REFUNDED: 'bg-red-50 text-red-700 border-red-200',
};

export const RecentOrdersTable = ({ orders, customerId }) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h3 className="text-base font-semibold text-slate-900">Recent Orders</h3>
        <button className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <Filter size={16} />
          Filter
        </button>
      </div>

      {orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">INVOICE ID</th>
                <th className="px-4 py-3">DATE</th>
                <th className="px-4 py-3">AMOUNT</th>
                <th className="px-4 py-3">STATUS</th>
                <th className="px-4 py-3"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.invoiceId} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/customers/${customerId}/history`)}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      {order.invoiceId}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-slate-500">{new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 py-4 font-semibold text-slate-900">Rs. {order.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/customers/${customerId}/history`)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition"
                      title="View Order"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-16 text-center text-slate-500">No recent orders found for this customer.</div>
      )}

      <div className="mt-6 text-center">
        <Link to={`/customers/${customerId}/history`} className="text-sm font-semibold text-blue-600 hover:underline">
          View all orders →
        </Link>
      </div>
    </div>
  );
};

export default RecentOrdersTable;
