import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  LuCalendarRange,
  LuChevronRight,
  LuDownload,
  LuFiles,
  LuHouse,
  LuLink,
  LuMail,
  LuShare2,
  LuCalendarDays,
  LuClock3,
} from 'react-icons/lu';
import { getFilteredSales, exportSalesReport } from '../../api/salesApi';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';

const fieldOptions = [
  { key: 'orderId', label: 'Order ID' },
  { key: 'dateTime', label: 'Date & Time' },
  { key: 'customer', label: 'Customer' },
  { key: 'items', label: 'Items' },
  { key: 'totalAmount', label: 'Total Amount' },
  { key: 'paymentMethod', label: 'Payment Method' },
  { key: 'status', label: 'Status' },
  { key: 'cashier', label: 'Cashier' },
  { key: 'discount', label: 'Discount' },
  { key: 'branch', label: 'Branch' },
];

const formatOptions = [
  { key: 'xlsx', label: 'Excel (.xlsx)', description: 'Best for data analysis and pivot tables' },
  { key: 'pdf', label: 'PDF Report', description: 'Ideal for printing and sharing' },
  { key: 'csv', label: 'CSV (.csv)', description: 'Compatible with all tools' },
];

const quickRanges = [
  { label: 'Today', days: 0 },
  { label: 'This Week', days: 6 },
  { label: 'This Month', days: 29 },
  { label: 'Last 90 Days', days: 89 },
];

const defaultFieldState = fieldOptions.reduce((acc, field) => {
  acc[field.key] = true;
  return acc;
}, {});

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const getDateLabel = (from, to) => {
  if (from && to) {
    return `${from} to ${to}`;
  }

  if (from) return `From ${from}`;
  if (to) return `Until ${to}`;
  return 'All available records';
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function ExportReports() {
  const [selectedFormat, setSelectedFormat] = useState('xlsx');
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return toDateInput(date);
  });
  const [toDate, setToDate] = useState(() => toDateInput(new Date()));
  const [selectedFields, setSelectedFields] = useState(defaultFieldState);
  const [summary, setSummary] = useState({ totalRecords: 0, totalRevenue: 0 });
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [exporting, setExporting] = useState(false);

  const activeFieldCount = useMemo(
    () => Object.values(selectedFields).filter(Boolean).length,
    [selectedFields]
  );

  const dateRangeLabel = useMemo(() => getDateLabel(fromDate, toDate), [fromDate, toDate]);

  const estimatedFileSize = useMemo(() => {
    const records = Math.max(summary.totalRecords || 0, 1);
    const bytesPerRow = selectedFormat === 'pdf' ? 650 : selectedFormat === 'csv' ? 180 : 320;
    const estimatedKb = Math.max(Math.round((records * activeFieldCount * bytesPerRow) / 1024), 24);
    return `~${estimatedKb} KB`;
  }, [activeFieldCount, selectedFormat, summary.totalRecords]);

  const selectedFieldList = useMemo(
    () => fieldOptions.filter((field) => selectedFields[field.key]).map((field) => field.key),
    [selectedFields]
  );

  const refreshSummary = async () => {
    setLoadingSummary(true);

    try {
      const response = await getFilteredSales({
        startDate: fromDate || undefined,
        endDate: toDate || undefined,
        limit: 1,
        page: 1,
      });

      setSummary({
        totalRecords: response?.pagination?.totalRecords || response?.matchCount || 0,
        totalRevenue: response?.summary?.totalRevenue || 0,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to load export summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    refreshSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  const setQuickRange = (daysBack) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - daysBack);
    setFromDate(toDateInput(start));
    setToDate(toDateInput(end));
  };

  const handleFieldToggle = (fieldKey) => {
    setSelectedFields((current) => ({
      ...current,
      [fieldKey]: !current[fieldKey],
    }));
  };

  const handleDownload = async () => {
    if (!selectedFieldList.length) {
      toast.error('Select at least one field to export.');
      return;
    }

    setExporting(true);

    try {
      const fileName = await exportSalesReport({
        format: selectedFormat,
        startDate: fromDate || undefined,
        endDate: toDate || undefined,
        fields: selectedFieldList.join(','),
      });

      toast.success(`${fileName} downloaded successfully.`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to export sales report.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnHover theme="light" />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <LuHouse className="h-4 w-4 text-slate-400" />
            <span>Home</span>
            <LuChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span>Sales</span>
            <LuChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="font-medium text-slate-700">Export Reports</span>
          </div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#2563EB]">Sales History</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#0F172A]">Export Reports</h1>
          <p className="mt-2 text-sm text-slate-500">Download sales data in your preferred format.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700">
            <LuShare2 className="mr-2 h-4 w-4" />
            Share Report
          </Button>
          <Button variant="outline" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700">
            <LuCalendarDays className="mr-2 h-4 w-4" />
            Schedule Export
          </Button>
          <Button
            variant="primary"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold"
            onClick={handleDownload}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Preparing...
              </>
            ) : (
              <>
                <LuDownload className="mr-2 h-4 w-4" />
                Download {selectedFormat.toUpperCase()} Report
              </>
            )}
          </Button>
        </div>
      </div>

      <Card className="rounded-[16px] p-5">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Choose Export Format</p>
          </div>
          <Badge variant="info">{selectedFormat.toUpperCase()}</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {formatOptions.map((option) => {
            const active = selectedFormat === option.key;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setSelectedFormat(option.key)}
                className={`rounded-2xl border p-5 text-left transition ${
                  active
                    ? 'border-[#2563EB] bg-[#EFF6FF] shadow-[0_10px_25px_rgba(37,99,235,0.08)]'
                    : 'border-[#E2E8F0] bg-white hover:border-[#BFDBFE] hover:bg-slate-50'
                }`}
              >
                <div className="text-base font-semibold text-slate-900">{option.label}</div>
                <p className="mt-2 text-sm text-slate-500">{option.description}</p>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="rounded-[16px] p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            <LuClock3 className="h-4 w-4 text-[#2563EB]" />
            Date Range
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-600">From</span>
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#2563EB]"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-600">To</span>
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#2563EB]"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickRanges.map((range) => (
              <button
                key={range.label}
                type="button"
                onClick={() => setQuickRange(range.days)}
                className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#1E40AF]"
              >
                {range.label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="rounded-[16px] p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            <LuFiles className="h-4 w-4 text-[#2563EB]" />
            Fields to Include
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {fieldOptions.map((field) => (
              <label
                key={field.key}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={Boolean(selectedFields[field.key])}
                  onChange={() => handleFieldToggle(field.key)}
                  className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span>{field.label}</span>
              </label>
            ))}
          </div>
        </Card>
      </div>

      <Card className="rounded-[16px] p-5">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Export Summary</p>
            <p className="mt-1 text-sm text-slate-500">Updated for {dateRangeLabel}</p>
          </div>
          {loadingSummary ? <Spinner size="sm" /> : <Badge variant="success">100% Ready</Badge>}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-[#F8FAFC] p-4">
            <p className="text-sm text-slate-500">Records Count</p>
            <p className="mt-2 text-2xl font-semibold text-[#2563EB]">{summary.totalRecords.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl bg-[#F8FAFC] p-4">
            <p className="text-sm text-slate-500">Total Revenue</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">{formatCurrency(summary.totalRevenue)}</p>
          </div>
          <div className="rounded-2xl bg-[#F8FAFC] p-4">
            <p className="text-sm text-slate-500">Date Range</p>
            <p className="mt-2 text-xl font-semibold text-slate-700">{dateRangeLabel}</p>
          </div>
          <div className="rounded-2xl bg-[#F8FAFC] p-4">
            <p className="text-sm text-slate-500">Est. File Size</p>
            <p className="mt-2 text-2xl font-semibold text-amber-500">{estimatedFileSize}</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
            <span>Export ready</span>
            <span>100%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-full rounded-full bg-[#2563EB]" />
          </div>
        </div>
      </Card>
    </div>
  );
}