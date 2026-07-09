import { useEffect, useMemo, useState } from 'react';
import { FiFilter, FiSearch, FiSliders, FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import { getFilteredSales } from '../../api/salesApi';

const defaultFilters = {
  keyword: '',
  customerName: '',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  paymentMethod: '',
  status: [],
  category: '',
  cashier: '',
};

const paymentMethods = ['cash', 'card', 'mobile_money', 'bank_transfer'];
const statuses = ['completed', 'pending', 'voided', 'refunded'];

const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const FiltersSearch = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(defaultFilters);
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 0, totalRecords: 0, limit: 10 });
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeChips = useMemo(() => {
    const chips = [];

    if (appliedFilters.keyword) chips.push({ label: `Keyword: ${appliedFilters.keyword}` });
    if (appliedFilters.customerName) chips.push({ label: `Customer: ${appliedFilters.customerName}` });
    if (appliedFilters.startDate || appliedFilters.endDate) {
      chips.push({ label: `Date: ${appliedFilters.startDate || 'Any'} to ${appliedFilters.endDate || 'Any'}` });
    }
    if (appliedFilters.minAmount || appliedFilters.maxAmount) {
      chips.push({ label: `Amount: ${appliedFilters.minAmount || 0} - ${appliedFilters.maxAmount || 'Any'}` });
    }
    if (appliedFilters.paymentMethod) chips.push({ label: `Payment: ${appliedFilters.paymentMethod}` });
    if (appliedFilters.status.length) chips.push({ label: `Status: ${appliedFilters.status.join(', ')}` });
    if (appliedFilters.category) chips.push({ label: `Category: ${appliedFilters.category}` });
    if (appliedFilters.cashier) chips.push({ label: `Cashier: ${appliedFilters.cashier}` });

    return chips;
  }, [appliedFilters]);

  useEffect(() => {
    const loadPreview = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getFilteredSales({ ...appliedFilters, limit: 5, page: 1 });
        setResults(response.transactions || []);
        setPagination(response.pagination || pagination);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Unable to load filtered sales.');
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  const updateField = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const toggleStatus = (value) => {
    setFilters((current) => ({
      ...current,
      status: current.status.includes(value)
        ? current.status.filter((item) => item !== value)
        : [...current.status, value],
    }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Sales History</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Filters & Search</h1>
          <p className="mt-2 text-sm text-slate-500">Search transactions using combined filters before opening the full results screen.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/sales-history/transactions')}>
          View Full Results <FiChevronRight className="ml-2" />
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <form onSubmit={applyFilters} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Keyword</label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3">
              <FiSearch className="text-slate-400" />
              <input className="w-full border-0 bg-transparent px-3 py-3 text-sm outline-none" value={filters.keyword} onChange={(e) => updateField('keyword', e.target.value)} placeholder="Transaction, customer, product" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Customer</label>
            <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" value={filters.customerName} onChange={(e) => updateField('customerName', e.target.value)} placeholder="Customer name" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Start Date</label>
            <input type="date" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" value={filters.startDate} onChange={(e) => updateField('startDate', e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">End Date</label>
            <input type="date" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" value={filters.endDate} onChange={(e) => updateField('endDate', e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Min Amount</label>
            <input type="number" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" value={filters.minAmount} onChange={(e) => updateField('minAmount', e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Max Amount</label>
            <input type="number" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" value={filters.maxAmount} onChange={(e) => updateField('maxAmount', e.target.value)} placeholder="9999" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Payment Method</label>
            <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" value={filters.paymentMethod} onChange={(e) => updateField('paymentMethod', e.target.value)}>
              <option value="">All methods</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>{method.replaceAll('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Category</label>
            <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" value={filters.category} onChange={(e) => updateField('category', e.target.value)} placeholder="Product category" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Cashier</label>
            <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" value={filters.cashier} onChange={(e) => updateField('cashier', e.target.value)} placeholder="Cashier ID or name" />
          </div>
          <div className="md:col-span-2 xl:col-span-4">
            <label className="mb-2 block text-sm font-medium text-slate-600">Status</label>
            <div className="flex flex-wrap gap-3">
              {statuses.map((status) => (
                <button key={status} type="button" onClick={() => toggleStatus(status)} className={`rounded-full border px-4 py-2 text-sm font-medium transition ${filters.status.includes(status) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 xl:col-span-4 flex flex-wrap gap-3">
            <Button type="submit"><FiFilter className="mr-2" /> Apply Filters</Button>
            <Button type="button" variant="secondary" onClick={resetFilters}>Reset</Button>
          </div>
        </form>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Active Filters</h2>
            <p className="text-sm text-slate-500">{pagination.totalRecords} matching transactions found.</p>
          </div>
          <Badge>{loading ? 'Loading' : `Page ${pagination.currentPage} of ${pagination.totalPages || 1}`}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeChips.length ? activeChips.map((chip) => <Badge key={chip.label} variant="info">{chip.label}</Badge>) : <span className="text-sm text-slate-500">No filters applied yet.</span>}
        </div>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <FiSliders className="text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Preview Results</h2>
            <p className="text-sm text-slate-500">Top matching sales are shown here before you open the full transaction list.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center"><Spinner /></div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Transaction</th>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Payment</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {results.map((sale) => (
                  <tr key={sale._id || sale.transactionId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{sale.transactionId}</td>
                    <td className="px-4 py-3 text-slate-600">{sale.customer?.name || 'Walk-in customer'}</td>
                    <td className="px-4 py-3 text-slate-600">{String(sale.paymentMethod || '').replaceAll('_', ' ')}</td>
                    <td className="px-4 py-3 text-slate-600">{sale.status}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatMoney(sale.totalAmount)}</td>
                  </tr>
                ))}
                {!results.length && (
                  <tr>
                    <td className="px-4 py-10 text-center text-slate-500" colSpan="5">No sales matched the selected filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FiltersSearch;