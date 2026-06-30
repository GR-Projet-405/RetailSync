import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import Pagination from '../components/Pagination';
import CustomerSearchBar from '../features/customer-management/components/CustomerSearchBar';
import CustomerTable from '../features/customer-management/components/CustomerTable';
import { useCustomers } from '../features/customer-management/hooks/useCustomers';
import Spinner from '../components/Spinner';

const STAT_SUMMARY = [
  { title: 'Total Customers', value: '2,458', change: '+12% vs last period' },
  { title: 'Active Customers', value: '2,156', change: '+9% vs last period' },
  { title: 'New This Month', value: '142', change: '+18% vs last period' },
  { title: 'Total Loyalty Points', value: '125,450', change: '+15% vs last period' },
];

export default function CustomerPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const { customers, loading, totalCount } = useCustomers({ search, status: statusFilter, page, limit: pageSize });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startEntry = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endEntry = Math.min(totalCount, page * pageSize);

  const customerCountLabel = useMemo(() => {
    return String(totalCount).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }, [totalCount]);

  return (
    <div className="space-y-8 fade-up">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customer Management</h1>
          <p className="mt-2 text-sm text-slate-500">Manage and view all customer information</p>
        </div>

        <div className="w-full xl:w-auto">
          <CustomerSearchBar
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={(newStatus) => {
              setStatusFilter(newStatus);
              setPage(1);
            }}
            onAddCustomer={() => navigate('/customers/new')}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_SUMMARY.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} change={stat.change} />
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-6">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner />
              </div>
            ) : (
              <CustomerTable customers={customers} />
            )}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing {startEntry} to {endEntry} of {customerCountLabel} entries
            </p>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
