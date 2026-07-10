import { Eye } from 'lucide-react';
import { toast } from '../../../utils/toast';

const statusClasses = {
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  REFUNDED: 'bg-red-50 text-red-700 border-red-200',
};

export const PurchaseHistoryTable = ({ orders, onViewInvoice }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
        No orders match your search.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[740px] text-left border-collapse text-sm text-slate-700">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <th className="px-5 py-4">INVOICE NO.</th>
            <th className="px-5 py-4">DATE</th>
            <th className="px-5 py-4">ITEMS</th>
            <th className="px-5 py-4">AMOUNT</th>
            <th className="px-5 py-4">PAYMENT METHOD</th>
            <th className="px-5 py-4">STATUS</th>
            <th className="px-5 py-4">ACTION</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => (
            <tr key={order.invoiceId} className="hover:bg-slate-50 transition-colors duration-150">
              <td className="px-5 py-4">
                <button
                  type="button"
                  onClick={() => onViewInvoice(order.invoiceId)}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  {order.invoiceId}
                </button>
              </td>
              <td className="px-5 py-4 text-slate-500">
                {new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </td>
              <td className="px-5 py-4 text-slate-500">{order.itemsCount} items</td>
              <td className="px-5 py-4 font-semibold text-slate-900">Rs. {order.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="px-5 py-4 text-slate-500">{order.paymentMethod}</td>
              <td className="px-5 py-4">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${statusClasses[order.status]}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-5 py-4">
                <button
                  type="button"
                  onClick={() => onViewInvoice(order.invoiceId)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition"
                  title="View Invoice"
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

export default PurchaseHistoryTable;
