import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  LuArrowLeft,
  LuCalendarRange,
  LuChevronRight as LuBreadcrumbChevron,
  LuHouse,
  LuPrinter,
  LuRotateCcw,
  LuBadgeCheck,
  LuBadgeAlert,
  LuDollarSign,
  LuReceiptText,
  LuUser,
  LuPhone,
  LuMail,
  LuMapPin,
  LuBuilding2,
  LuClock3,
} from 'react-icons/lu';
import { getSaleById, getTransactions } from '../../api/salesApi';
import Spinner from '../../components/Spinner';
import { Card } from '../../components/Card';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const statusStyles = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  refunded: 'bg-rose-50 text-rose-700 border-rose-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const formatDateOnly = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const getCustomerName = (customer) =>
  customer?.name ||
  customer?.fullName ||
  [customer?.firstName, customer?.lastName].filter(Boolean).join(' ').trim() ||
  'Walk-in Customer';

const getCustomerId = (customer) => {
  if (!customer?._id) return '-';
  return `#${String(customer._id).slice(-6).toUpperCase()}`;
};

const getCashierName = (cashier) =>
  [cashier?.firstName, cashier?.lastName].filter(Boolean).join(' ').trim() || cashier?.email || 'Unknown';

const getStatusClass = (status) => statusStyles[String(status || '').toLowerCase()] || statusStyles.cancelled;

const buildTimeline = (sale) => {
  const started = sale?.createdAt ? new Date(sale.createdAt) : new Date();
  const scanned = new Date(started.getTime() + 3 * 60 * 1000);
  const confirmed = new Date(started.getTime() + 6 * 60 * 1000);
  const completed = sale?.status === 'completed' ? new Date(sale.updatedAt || started.getTime() + 10 * 60 * 1000) : new Date(started.getTime() + 10 * 60 * 1000);

  return [
    { title: 'Transaction Started', time: started, tone: 'bg-[#2563EB]' },
    { title: 'Items Scanned', time: scanned, tone: 'bg-emerald-500' },
    { title: 'Payment Confirmed', time: confirmed, tone: 'bg-amber-500' },
    { title: 'Order Completed', time: completed, tone: 'bg-slate-500' },
  ];
};

export default function SalesDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSale = async () => {
      setLoading(true);
      setError('');

      try {
        let saleId = id;

        if (!saleId) {
          const listResponse = await getTransactions({ page: 1, limit: 1 });
          const listPayload = listResponse?.data?.data ?? listResponse?.data ?? listResponse;
          saleId = listPayload?.transactions?.[0]?._id || listPayload?.transactions?.[0]?.transactionId;
        }

        if (!saleId) {
          setSale(null);
          setError('No sale records found.');
          return;
        }

        const response = await getSaleById(saleId);
        const payload = response?.data?.data ?? response?.data ?? response;
        setSale(payload);
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || 'Failed to load sale details.';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadSale();
  }, [id]);

  const customer = sale?.customer || {};
  const cashier = sale?.cashier || {};
  const branch = sale?.branch || {};

  const status = String(sale?.status || '').toLowerCase();
  const refundEligible = useMemo(() => {
    if (status !== 'completed' || !sale?.createdAt) return false;
    const createdAt = new Date(sale.createdAt).getTime();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return Date.now() - createdAt <= thirtyDays;
  }, [sale?.createdAt, status]);

  const timeline = useMemo(() => buildTimeline(sale), [sale]);
  const items = sale?.items || [];

  const handlePrint = () => window.print();
  const handleRefund = () => {
    if (!refundEligible) return;
    toast.info('Refund workflow will be handled in the refund module.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/60 px-4 py-6 sm:px-6 lg:px-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnHover theme="light" />

      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <LuHouse className="h-4 w-4 text-slate-400" />
          <span>Home</span>
          <LuBreadcrumbChevron className="h-3.5 w-3.5 text-slate-300" />
          <span>Sales</span>
          <LuBreadcrumbChevron className="h-3.5 w-3.5 text-slate-300" />
          <span>Transaction History</span>
          <LuBreadcrumbChevron className="h-3.5 w-3.5 text-slate-300" />
          <span className="font-medium text-slate-700">{sale?.transactionId || id}</span>
        </div>

        {loading ? (
          <Card className="flex min-h-[420px] items-center justify-center rounded-[16px] p-6">
            <div className="flex flex-col items-center gap-4 text-slate-500">
              <Spinner size="lg" />
              <span className="text-sm font-medium">Loading sale details...</span>
            </div>
          </Card>
        ) : error ? (
          <Card className="rounded-[16px] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Unable to load sale</h2>
                <p className="mt-1 text-sm text-slate-500">{error}</p>
              </div>
              <button type="button" onClick={() => navigate('/sales-history/transactions')} className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1E40AF]">
                Back
              </button>
            </div>
          </Card>
        ) : (
          <>
            <div className="flex flex-col gap-4 rounded-[16px] border border-[#E2E8F0] bg-white/85 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
              <div>
                <button
                  type="button"
                  onClick={() => navigate('/sales-history/transactions')}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#BFDBFE] hover:bg-slate-50"
                >
                  <LuArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A]">{sale?.transactionId || id}</h1>
                  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(status)}`}>
                    {status || 'unknown'}
                  </span>
                </div>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <LuCalendarRange className="h-4 w-4" />
                  Transaction details — {formatDateTime(sale?.createdAt)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#BFDBFE] hover:bg-slate-50"
                >
                  <LuPrinter className="h-4 w-4" />
                  Print Receipt
                </button>
                {refundEligible ? (
                  <button
                    type="button"
                    onClick={handleRefund}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100"
                  >
                    <LuRotateCcw className="h-4 w-4" />
                    Process Refund
                  </button>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="rounded-[16px] p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                  <LuReceiptText className="h-4 w-4 text-[#2563EB]" />
                  Order Information
                </div>

                <dl className="space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <dt className="text-slate-500">Order ID</dt>
                    <dd className="font-semibold text-[#2563EB]">{sale?.transactionId || id}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <dt className="text-slate-500">Date & Time</dt>
                    <dd className="font-medium text-slate-700">{formatDateTime(sale?.createdAt)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <dt className="text-slate-500">Branch</dt>
                    <dd className="font-medium text-slate-700">{branch.name || '-'}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <dt className="text-slate-500">Cashier</dt>
                    <dd className="font-medium text-slate-700">{getCashierName(cashier)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <dt className="text-slate-500">Terminal</dt>
                    <dd className="font-medium text-slate-700">{sale?.terminal || sale?.terminalId || 'POS-01'}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Status</dt>
                    <dd>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClass(status)}`}>
                        {status || 'unknown'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card className="rounded-[16px] p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                  <LuUser className="h-4 w-4 text-[#2563EB]" />
                  Customer Information
                </div>

                <dl className="space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <dt className="text-slate-500">Name</dt>
                    <dd className="font-medium text-slate-700">{getCustomerName(customer)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <dt className="text-slate-500">Customer ID</dt>
                    <dd className="font-semibold text-[#2563EB]">{getCustomerId(customer)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <dt className="text-slate-500">Phone</dt>
                    <dd className="font-medium text-slate-700">{customer.phone || '-'}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <dt className="text-slate-500">Email</dt>
                    <dd className="font-medium text-slate-700">{customer.email || '-'}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <dt className="text-slate-500">Loyalty Points</dt>
                    <dd className="font-semibold text-amber-600">{customer.loyaltyPoints ?? 0} pts</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Member Since</dt>
                    <dd className="font-medium text-slate-700">{formatDateOnly(customer.createdAt)}</dd>
                  </div>
                </dl>
              </Card>
            </div>

            <Card className="rounded-[16px] p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                <LuShoppingCart className="h-4 w-4 text-[#2563EB]" />
                Purchased Items
              </div>

              <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">#</th>
                        <th className="px-4 py-3 font-semibold">Product</th>
                        <th className="px-4 py-3 font-semibold">SKU</th>
                        <th className="px-4 py-3 font-semibold">Category</th>
                        <th className="px-4 py-3 font-semibold">Qty</th>
                        <th className="px-4 py-3 font-semibold">Unit Price</th>
                        <th className="px-4 py-3 font-semibold">Discount</th>
                        <th className="px-4 py-3 font-semibold">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.length ? items.map((item, index) => (
                        <tr key={`${item._id || item.product?._id || index}`} className="hover:bg-[#EFF6FF]">
                          <td className="px-4 py-4 text-slate-500">{index + 1}</td>
                          <td className="px-4 py-4 font-medium text-slate-800">{item.product?.name || item.productName || '-'}</td>
                          <td className="px-4 py-4 text-slate-600">{item.product?.sku || item.sku || '-'}</td>
                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              {item.product?.category || item.product?.categoryName || item.category || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-600">{item.quantity || 0}</td>
                          <td className="px-4 py-4 text-slate-700">{currencyFormatter.format(item.unitPrice || 0)}</td>
                          <td className="px-4 py-4 text-emerald-600">{currencyFormatter.format(item.discount || 0)}</td>
                          <td className="px-4 py-4 font-semibold text-slate-900">{currencyFormatter.format(item.lineTotal || 0)}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td className="px-4 py-12 text-center text-slate-500" colSpan="8">No purchased items found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="rounded-[16px] p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                  <LuDollarSign className="h-4 w-4 text-[#2563EB]" />
                  Payment Summary
                </div>

                <dl className="space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <dt className="text-slate-500">Subtotal</dt>
                    <dd className="font-medium text-slate-700">{currencyFormatter.format(sale?.subtotal || 0)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <dt className="text-slate-500">Discount</dt>
                    <dd className="font-medium text-emerald-600">{currencyFormatter.format(sale?.discountTotal || 0)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <dt className="text-slate-500">Tax</dt>
                    <dd className="font-medium text-slate-700">{currencyFormatter.format(sale?.tax || 0)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 text-lg">
                    <dt className="font-semibold text-slate-700">Total Paid</dt>
                    <dd className="font-semibold text-[#2563EB]">{currencyFormatter.format(sale?.totalAmount || 0)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <dt className="text-slate-500">Payment Method</dt>
                    <dd className="font-medium text-slate-700">{sale?.paymentMethod || '-'}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Card last 4</dt>
                    <dd className="font-medium text-slate-700">{sale?.paymentDetails?.cardLast4 || sale?.cardLast4 || '—'}</dd>
                  </div>
                </dl>
              </Card>

              <Card className="rounded-[16px] p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                  <LuClock3 className="h-4 w-4 text-[#2563EB]" />
                  Activity Timeline
                </div>

                <div className="space-y-5">
                  {timeline.map((entry, index) => (
                    <div key={entry.title} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className={`mt-1 h-3 w-3 rounded-full ${entry.tone}`} />
                        {index < timeline.length - 1 ? <span className="mt-2 h-full w-px bg-slate-200" /> : null}
                      </div>
                      <div className="pb-2">
                        <div className="text-sm font-semibold text-slate-800">{entry.title}</div>
                        <div className="mt-1 text-xs text-slate-500">{formatDateTime(entry.time)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}