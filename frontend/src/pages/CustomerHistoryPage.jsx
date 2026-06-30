import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import PurchaseHistoryTable from '../features/customer-management/components/PurchaseHistoryTable';
import PurchaseStatsGrid from '../features/customer-management/components/PurchaseStatsGrid';
import { mockCustomers } from '../features/customer-management/data/mockCustomers';
import { mockOrders } from '../features/customer-management/data/mockOrders';
import { toast } from '../utils/toast';
import Pagination from '../components/Pagination';

export default function CustomerHistoryPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const customer = mockCustomers.find((item) => item._id === id);

  const customerOrders = useMemo(
    () => mockOrders
      .filter((order) => order.customerId === id)
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [id]
  );

  const filteredOrders = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return customerOrders;
    return customerOrders.filter((order) => order.invoiceId.toLowerCase().includes(normalized));
  }, [search, customerOrders]);

  const totalOrders = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));
  const currentOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);
  const startEntry = totalOrders === 0 ? 0 : (page - 1) * pageSize + 1;
  const endEntry = Math.min(totalOrders, page * pageSize);

  const totalItems = customerOrders.reduce((sum, order) => sum + order.itemsCount, 0);
  const totalAmount = customerOrders.reduce((sum, order) => sum + order.amount, 0);
  const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

  const stats = {
    totalOrders: totalOrders.toString(),
    totalItems: totalItems.toString(),
    totalAmount: `Rs. ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    averageOrderValue: `Rs. ${averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  };

  if (!customer) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-600 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Customer not found</h1>
        <p className="mt-3 text-sm">We couldn’t find that customer. Please return to the customer list.</p>
        <button
          type="button"
          onClick={() => navigate('/customers')}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  const handleExport = () => {
    toast.info('Export feature coming soon');
  };

  const handleViewInvoice = (invoiceId) => {
    toast.info('Invoice details coming soon');
  };

  return (
    <div className="space-y-8 fade-up">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-slate-500">
          Home <span className="mx-2">&gt;</span> Customers <span className="mx-2">&gt;</span> {customer.name} <span className="mx-2">&gt;</span> <span className="font-semibold text-slate-900">History</span>
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Purchase History - {customer.name}</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search invoice..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 sm:w-72"
              />
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <PurchaseHistoryTable orders={currentOrders} onViewInvoice={handleViewInvoice} />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Showing {startEntry}-{endEntry} of {totalOrders} orders</p>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      <PurchaseStatsGrid stats={stats} />
    </div>
  );
}
