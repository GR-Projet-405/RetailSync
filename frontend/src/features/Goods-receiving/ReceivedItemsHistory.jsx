import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import DataTable from '../../components/DataTable';
import SearchInput from '../../components/SearchInput';
import { useReceivedItemsHistory } from '../../hooks/useGoodsReceiving';
import { getReceivedItemsHistory } from '../../services/goodsReceivingService';
// 🔔 Adjust this import if your toast utility exports something different
import { toast } from '../../utils/toast';

const STATUS_VARIANT = {
  MATCHED: 'success',
  SHORT: 'danger',
  EXCESS: 'info',
  DISCREPANCY: 'danger',
};

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'MATCHED', label: 'Verified' },
  { value: 'SHORT', label: 'Short' },
  { value: 'EXCESS', label: 'Excess' },
  { value: 'DISCREPANCY', label: 'Discrepancy' },
];

export default function ReceivedItemsHistory() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: '', status: '', page: 1, limit: 10 });
  const { data, isLoading, isError } = useReceivedItemsHistory(filters);
  const [isExporting, setIsExporting] = useState(false);

  const rows = data?.data || [];
  const summary = data?.summary || { totalItems: 0, verified: 0, discrepancy: 0 };

  const updateFilter = (field, value) => setFilters((f) => ({ ...f, [field]: value, page: 1 }));

  const escapeCsvCell = (value) => {
    const str = String(value ?? '');
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // Pull every row matching the current search/status filters, ignoring
      // pagination, so the export isn't limited to just the visible page.
      const { search, status } = filters;
      const full = await getReceivedItemsHistory({ search, status, page: 1, limit: 10000 });
      const exportRows = full?.data || [];

      if (exportRows.length === 0) {
        toast.error('No items to export for the current filters 😕');
        return;
      }

      const headers = ['Item', 'SKU', 'Supplier', 'Qty', 'Date', 'Receipt Number', 'Status'];
      const csvLines = [
        headers,
        ...exportRows.map((row) => [
          row.item,
          row.sku,
          row.supplier || '',
          row.qty,
          new Date(row.date).toLocaleDateString(),
          row.receiptNumber,
          row.status,
        ]),
      ].map((line) => line.map(escapeCsvCell).join(','));

      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `received-items-history-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('CSV exported 📄');
    } catch (err) {
      toast.error(err.message || 'Could not export CSV 😕');
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    { key: 'item', header: 'Item' },
    { key: 'sku', header: 'SKU' },
    { key: 'supplier', header: 'Supplier', render: (row) => row.supplier || '—' },
    { key: 'qty', header: 'Qty' },
    {
      key: 'date',
      header: 'Date',
      render: (row) =>
        new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    {
      key: 'receiptNumber',
      header: 'Receipt #',
      render: (row) => (
        <button
          onClick={() => navigate(`/goods-receiving/verify/${row.receiptId}`)}
          className="text-blue-600 hover:underline font-medium"
        >
          {row.receiptNumber}
        </button>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={STATUS_VARIANT[row.status] || 'neutral'}>{row.status}</Badge>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Received Items History"
        description="Every item received, across all suppliers and receipts 📜"
        actions={
          <Button variant="outline" onClick={handleExportCSV} disabled={isExporting}>
            {isExporting ? 'Exporting… ⏳' : 'Export CSV'}
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput
          placeholder="Search items or receipt #…"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="max-w-sm"
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none"
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="info">Total: {summary.totalItems} items</Badge>
        <Badge variant="success">Verified: {summary.verified}</Badge>
        <Badge variant="danger">Discrepancy: {summary.discrepancy}</Badge>
      </div>

      {isError ? (
        <p className="text-sm text-red-600">😕 Couldn't load item history. Please try again.</p>
      ) : (
        <DataTable
          columns={columns}
          data={isLoading ? [] : rows}
          emptyMessage={isLoading ? 'Loading history… ⏳' : 'No items match your filters yet 🔍'}
        />
      )}

      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-slate-500">Page {filters.page}</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === 1}
            onClick={() => updateFilter('page', filters.page - 1)}
          >
            ← Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={rows.length < filters.limit}
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
          >
            Next →
          </Button>
        </div>
      </div>
    </>
  );
}

