import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomerProfileCard from '../features/customer-management/components/CustomerProfileCard';
import CustomerStatsGrid from '../features/customer-management/components/CustomerStatsGrid';
import RecentOrdersTable from '../features/customer-management/components/RecentOrdersTable';
import Spinner from '../components/Spinner';
import customerService from '../features/customer-management/services/customerService';

export default function CustomerProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    customerService
      .getCustomerById(id)
      .then((result) => {
        if (!isMounted) return;
        setCustomer(result);
      })
      .catch((fetchError) => {
        if (!isMounted) return;
        setError(fetchError.message || 'Unable to load customer profile.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const customerOrders = [];
  const totalSpending = 0;
  const averageOrderValue = 0;
  const lastOrderDate = 'N/A';

  const stats = {
    totalOrders: customer?.totalOrders ?? 0,
    totalSpending: `Rs. ${totalSpending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    averageOrderValue: `Rs. ${averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    lastOrderDate,
  };

  if (loading) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Spinner />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-600 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Customer not found</h1>
        <p className="mt-3 text-sm">{error || 'We couldn’t find a customer matching that profile. Please return to the customer list.'}</p>
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

  return (
    <div className="space-y-8 fade-up">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-slate-500">
          Home <span className="mx-2">&gt;</span> Customers <span className="mx-2">&gt;</span> <span className="font-semibold text-slate-900">{customer.name}</span>
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customer Profile</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(`/customers/${id}/edit`)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Edit Profile
            </button>
            <button
              type="button"
              onClick={() => navigate(`/customers/${id}/history`)}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              View History
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-6">
          <CustomerProfileCard customer={customer} />
          <CustomerStatsGrid stats={stats} />
        </div>

        <RecentOrdersTable orders={customerOrders} customerId={id} />
      </div>
    </div>
  );
}
