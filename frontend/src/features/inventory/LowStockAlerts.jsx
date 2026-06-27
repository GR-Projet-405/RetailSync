import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, X, ChevronDown, Calendar, MoreVertical,
  AlertTriangle, AlertOctagon, RefreshCw, BellRing,
  Package, Building2, Truck, Tag, CalendarDays, FileText,
  CheckCircle2, Settings, Clock, XCircle, TrendingDown,
  ShieldAlert,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { cn } from '../../utils/cn';
import { toast } from '../../utils/toast';

// ─── Mock alert data ──────────────────────────────────────────────────────────
// daysRemaining: estimated days until stockout (based on avg sales velocity)
// SRS REQ-INV-003: alerts triggered when stock < reorder level
// SRS REQ-INV-007: configurable reorder levels per product per warehouse

const INITIAL_ALERTS = [
  { id:  1, sku: 'SKU-ELE-000123', product: 'Samsung Galaxy S24 128GB',     category: 'Electronics',   warehouse: 'Colombo', supplier: 'Samsung Lanka (Pvt) Ltd',    currentStock:  40, reservedStock:  5, reorderLevel: 100, daysRemaining:  4, lastPurchase: '15 March 2026',  alertSince: '10 Jun 2026', acknowledged: false, image: null },
  { id:  2, sku: 'SKU-STA-000010', product: 'A4 Printing Paper (Ream)',      category: 'Stationery',    warehouse: 'Kandy',   supplier: 'Kowloon Paper (pvt) ltd',    currentStock:  15, reservedStock:  5, reorderLevel: 500, daysRemaining:  2, lastPurchase: '20 April 2026',  alertSince: '08 Jun 2026', acknowledged: false, image: null },
  { id:  3, sku: 'SKU-GRO-000103', product: 'Fresh Milk 1L',                 category: 'Grocery',       warehouse: 'Kandy',   supplier: 'Kotmale (pvt) ltd',          currentStock:  15, reservedStock: 30, reorderLevel: 500, daysRemaining:  5, lastPurchase: '20 April 2026',  alertSince: '09 Jun 2026', acknowledged: false, image: null },
  { id:  4, sku: 'SKU-ELE-000125', product: 'HP LaserJet Printer M110w',     category: 'Electronics',   warehouse: 'Colombo', supplier: 'HP Ceylon Ltd',              currentStock:   0, reservedStock:  0, reorderLevel:   5, daysRemaining:  0, lastPurchase: '10 Jan 2026',    alertSince: '05 Jun 2026', acknowledged: false, image: null },
  { id:  5, sku: 'SKU-CLO-000402', product: "Kids' School Uniform Set",       category: 'Clothing',      warehouse: 'Kandy',   supplier: 'KidZone Apparel Ltd',        currentStock:   6, reservedStock:  0, reorderLevel:  20, daysRemaining:  3, lastPurchase: '05 Feb 2026',    alertSince: '11 Jun 2026', acknowledged: false, image: null },
  { id:  6, sku: 'SKU-GRO-000200', product: 'Basmati Rice 5kg',              category: 'Grocery',       warehouse: 'Galle',   supplier: 'Cargills Food City',         currentStock:   0, reservedStock:  0, reorderLevel:  30, daysRemaining:  0, lastPurchase: '25 March 2026',  alertSince: '07 Jun 2026', acknowledged: false, image: null },
  { id:  7, sku: 'SKU-GRO-000201', product: 'Sunflower Cooking Oil 1L',      category: 'Grocery',       warehouse: 'Colombo', supplier: 'Sunrich Lanka (Pvt) Ltd',    currentStock:  18, reservedStock:  6, reorderLevel:  20, daysRemaining:  6, lastPurchase: '01 April 2026',  alertSince: '12 Jun 2026', acknowledged: false, image: null },
  { id:  8, sku: 'SKU-BEV-000301', product: 'Red Bull Energy Drink 250ml',   category: 'Beverages',     warehouse: 'Galle',   supplier: 'Red Bull Lanka Dist.',       currentStock:   4, reservedStock:  0, reorderLevel:  15, daysRemaining:  2, lastPurchase: '14 Feb 2026',    alertSince: '10 Jun 2026', acknowledged: false, image: null },
  { id:  9, sku: 'SKU-BEV-000302', product: 'Mineral Water 500ml (24-pack)', category: 'Beverages',     warehouse: 'Kandy',   supplier: 'Elephant House Ltd',         currentStock:   0, reservedStock:  0, reorderLevel:  20, daysRemaining:  0, lastPurchase: '22 Jan 2026',    alertSince: '04 Jun 2026', acknowledged: false, image: null },
  { id: 10, sku: 'SKU-HH-000500',  product: 'Surf Excel Detergent 2kg',      category: 'Household',     warehouse: 'Colombo', supplier: 'Unilever Ceylon Ltd',        currentStock:  14, reservedStock:  6, reorderLevel:  15, daysRemaining:  7, lastPurchase: '30 March 2026',  alertSince: '13 Jun 2026', acknowledged: false, image: null },
  { id: 11, sku: 'SKU-PC-000601',  product: 'Nivea Body Lotion 250ml',       category: 'Personal Care', warehouse: 'Colombo', supplier: 'Nivea Lanka (Pvt) Ltd',      currentStock:   0, reservedStock:  0, reorderLevel:  12, daysRemaining:  0, lastPurchase: '10 March 2026',  alertSince: '06 Jun 2026', acknowledged: false, image: null },
  { id: 12, sku: 'SKU-CLO-000401', product: "Men's Cotton T-Shirt (M)",      category: 'Clothing',      warehouse: 'Colombo', supplier: 'Fashion Hub (Pvt) Ltd',      currentStock:  80, reservedStock: 20, reorderLevel:  50, daysRemaining: 12, lastPurchase: '18 March 2026',  alertSince: '14 Jun 2026', acknowledged: false, image: null },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const avail = (a) => Math.max(0, a.currentStock - a.reservedStock);

function getSeverity(item) {
  const av = avail(item);
  if (av <= 0)                            return 'out';
  if (item.daysRemaining <= 3)            return 'critical';
  if (av < item.reorderLevel)             return 'low';
  return 'reorder';
}

const SEVERITY_CFG = {
  out:      { label: 'Out of Stock', color: 'bg-red-100    text-red-700    border-red-200',    dot: 'bg-red-500',    Icon: XCircle       },
  critical: { label: 'Critical',     color: 'bg-red-100    text-red-700    border-red-200',    dot: 'bg-red-400',    Icon: AlertOctagon  },
  low:      { label: 'Low Stock',    color: 'bg-amber-100  text-amber-700  border-amber-200',  dot: 'bg-amber-500',  Icon: AlertTriangle },
  reorder:  { label: 'Reorder Due',  color: 'bg-blue-100   text-blue-700   border-blue-200',   dot: 'bg-blue-400',   Icon: RefreshCw     },
};

function daysColor(days, severity) {
  if (severity === 'out')   return 'text-slate-400';
  if (days <= 3)            return 'text-red-600';
  if (days <= 7)            return 'text-amber-600';
  return 'text-slate-600';
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES_F = ['All Categories', 'Electronics', 'Grocery', 'Clothing', 'Beverages', 'Stationery', 'Household', 'Personal Care'];
const WAREHOUSES_F = ['All Warehouses', 'Colombo', 'Galle', 'Kandy'];
const SEVERITY_F   = ['All Alerts', 'Out of Stock', 'Critical', 'Low Stock', 'Reorder Due'];

const SEV_FILTER_MAP = { 'Out of Stock': 'out', 'Critical': 'critical', 'Low Stock': 'low', 'Reorder Due': 'reorder' };

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-blue-400 cursor-pointer"
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

function SeverityBadge({ severity }) {
  const cfg  = SEVERITY_CFG[severity];
  const Icon = cfg.Icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border', cfg.color)}>
      <Icon size={9} />
      {cfg.label}
    </span>
  );
}

// Days remaining pill with urgency bar
function DaysLeftCell({ days, severity }) {
  if (severity === 'out') return <span className="text-xs text-slate-400 italic">—</span>;
  const barW   = Math.min(100, Math.max(0, (days / 14) * 100));
  const barCls = days <= 3 ? 'bg-red-400' : days <= 7 ? 'bg-amber-400' : 'bg-emerald-400';
  return (
    <div className="space-y-1.5 min-w-[52px]">
      <span className={cn('text-sm font-bold tabular-nums', daysColor(days, severity))}>
        {days}d
      </span>
      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', barCls)} style={{ width: `${barW}%` }} />
      </div>
    </div>
  );
}

// ─── View Details Modal ───────────────────────────────────────────────────────

function ViewModal({ item, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    function handler(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const severity = getSeverity(item);
  const av       = avail(item);
  const cfg      = SEVERITY_CFG[severity];

  const stockPct = item.reorderLevel > 0
    ? Math.min(100, Math.round((av / item.reorderLevel) * 100))
    : 100;
  const barColor = severity === 'out' || severity === 'critical' ? 'bg-red-500'
    : severity === 'low' ? 'bg-amber-400' : 'bg-blue-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Alert Details</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{item.sku}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Product + severity */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-bold text-slate-800">{item.product}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.category} · {item.warehouse}</p>
            </div>
            <SeverityBadge severity={severity} />
          </div>

          {/* Urgency + stock bar */}
          <div className="bg-slate-50 rounded-xl px-4 py-4">
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-xs text-slate-400">Available Stock</p>
                <p className={cn('text-3xl font-extrabold leading-tight',
                  severity === 'out' || severity === 'critical' ? 'text-red-600'
                  : severity === 'low' ? 'text-amber-600' : 'text-blue-600'
                )}>{av}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">units</p>
              </div>
              {severity !== 'out' ? (
                <div className="text-right">
                  <p className="text-xs text-slate-400">Est. Days Remaining</p>
                  <p className={cn('text-2xl font-extrabold', daysColor(item.daysRemaining, severity))}>
                    {item.daysRemaining}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">days</p>
                </div>
              ) : (
                <div className="text-right">
                  <p className="text-xs text-slate-400">Reorder Level</p>
                  <p className="text-2xl font-extrabold text-slate-500">{item.reorderLevel}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">threshold</p>
                </div>
              )}
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${stockPct}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{stockPct}% of reorder threshold</p>
          </div>

          {/* Stock breakdown grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Current Stock',  `${item.currentStock} units`],
              ['Reserved Stock', `${item.reservedStock} units`],
              ['Reorder Level',  `${item.reorderLevel} units`],
              ['Alert Since',    item.alertSince],
            ].map(([label, val]) => (
              <div key={label} className="bg-slate-50 rounded-lg px-3 py-2.5">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{val}</p>
              </div>
            ))}
          </div>

          {/* Supplier + last purchase */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg px-3 py-2.5 col-span-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Supplier</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{item.supplier}</p>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2.5 col-span-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Last Purchase Date</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{item.lastPurchase}</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-2">
          <button
            onClick={() => { toast.info(`Creating PO for ${item.product}…`); navigate('/purchase-orders'); onClose(); }}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Create Purchase Order
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function fmtISOLabel(iso) {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  const mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m - 1];
  return `${+d} ${mon}`;
}

function inDateRange(dateStr, startISO, endISO) {
  if (!startISO && !endISO) return true;
  const d = new Date(dateStr);
  if (isNaN(d)) return true;
  if (startISO && d < new Date(startISO)) return false;
  if (endISO   && d > new Date(endISO + 'T23:59:59')) return false;
  return true;
}

function DateRangeFilter({ startDate, endDate, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const hasDate = startDate || endDate;
  const label   = hasDate
    ? `${startDate ? fmtISOLabel(startDate) : '…'} – ${endDate ? fmtISOLabel(endDate) : '…'}`
    : 'Date Range';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors',
          hasDate ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
        )}
      >
        <Calendar size={12} className={hasDate ? 'text-blue-500' : 'text-slate-400'} />
        <span>{label}</span>
        {hasDate && (
          <X size={10} className="ml-0.5 text-blue-400 hover:text-blue-600" onClick={e => { e.stopPropagation(); onChange('', ''); }} />
        )}
      </button>
      {open && (
        <div className="absolute top-10 left-0 z-40 bg-white border border-slate-200 rounded-xl shadow-xl p-4 w-56" onClick={e => e.stopPropagation()}>
          <p className="text-xs font-semibold text-slate-700 mb-3">Filter by Alert Date</p>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">From</label>
              <input type="date" value={startDate} onChange={e => onChange(e.target.value, endDate)}
                className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">To</label>
              <input type="date" value={endDate} min={startDate} onChange={e => onChange(startDate, e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
            </div>
            {hasDate && (
              <button onClick={() => { onChange('', ''); setOpen(false); }}
                className="w-full py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                Clear Dates
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 3-dot action menu
function ActionMenu({ item, onView, onDismiss, onSetReorder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
      >
        <MoreVertical size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-30 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 fade-in">
          <button
            onClick={() => { onView(item); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FileText size={13} /> Full Details
          </button>
          <button
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <FileText size={13} /> Create Purchase Order
          </button>
          <button
            onClick={() => { onSetReorder(item); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-violet-600 hover:bg-violet-50 transition-colors"
          >
            <Settings size={13} /> Set Reorder Level
          </button>
          <div className="border-t border-slate-100 mt-1 pt-1">
            <button
              onClick={() => { onDismiss(item.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <CheckCircle2 size={13} /> Dismiss Alert
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Set Reorder Level mini-modal ─────────────────────────────────────────────

function SetReorderModal({ item, onClose, onSave }) {
  const [level, setLevel] = useState(String(item.reorderLevel));
  const [err,   setErr]   = useState('');

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  function submit() {
    const n = parseInt(level, 10);
    if (!level || isNaN(n) || n < 1) { setErr('Enter a valid positive number'); return; }
    onSave(item.id, n);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Set Reorder Level</h3>
          <button onClick={onClose} className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100">
            <X size={13} />
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-1">{item.product}</p>
        <p className="text-[10px] font-mono text-slate-400 mb-4">{item.sku} · {item.warehouse}</p>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Reorder Level (units) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="1"
          value={level}
          onChange={e => { setLevel(e.target.value); setErr(''); }}
          className={cn('w-full px-3 py-2 text-sm border rounded-lg outline-none', err ? 'border-red-300' : 'border-slate-200 focus:border-blue-400')}
          autoFocus
        />
        {err && <p className="text-[11px] text-red-500 mt-1">{err}</p>}
        <p className="text-[10px] text-slate-400 mt-1.5">Current reorder level: {item.reorderLevel} units</p>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={submit} className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Full Details panel ───────────────────────────────────────────────────────

function DetailPanel({ item, onClose, onDismiss }) {
  const navigate = useNavigate();
  const severity = getSeverity(item);
  const av       = avail(item);

  return (
    <div className="w-72 shrink-0 bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgba(15,23,42,0.08)] flex flex-col overflow-hidden fade-in">

      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Full Details</h3>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X size={13} />
        </button>
      </div>

      {/* Product identity */}
      <div className="flex items-start gap-3 px-4 py-4 border-b border-slate-100">
        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
          {item.image
            ? <img src={item.image} alt={item.product} className="w-full h-full object-cover rounded-xl" />
            : <Package size={22} className="text-slate-400" />
          }
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 leading-tight">{item.product}</p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5 font-mono">{item.sku}</p>
          <div className="mt-2">
            <SeverityBadge severity={severity} />
          </div>
        </div>
      </div>

      {/* Urgency indicator */}
      {severity !== 'out' && (
        <div className={cn(
          'mx-4 mt-3 px-3 py-2 rounded-xl border flex items-center gap-3',
          item.daysRemaining <= 3 ? 'bg-red-50 border-red-200' : item.daysRemaining <= 7 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
        )}>
          <Clock size={14} className={item.daysRemaining <= 3 ? 'text-red-500' : item.daysRemaining <= 7 ? 'text-amber-500' : 'text-slate-400'} />
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Est. Days Remaining</p>
            <p className={cn('text-lg font-extrabold leading-tight', daysColor(item.daysRemaining, severity))}>
              {item.daysRemaining} days
            </p>
          </div>
        </div>
      )}

      {/* Stock breakdown */}
      <div className="px-4 py-3 space-y-2 border-b border-slate-100 mt-2">
        <DetailRow label="Current Stock"   value={`${item.currentStock} units`}  bold />
        <DetailRow label="Reserved Stock"  value={`${item.reservedStock} units`} muted />
        <DetailRow
          label="Available Stock"
          value={`${av} units`}
          bold
          valueColor={severity === 'out' ? 'text-red-600' : severity === 'critical' ? 'text-red-600' : 'text-amber-600'}
        />
        <DetailRow label="Reorder Level"   value={`${item.reorderLevel} units`}  />
      </div>

      {/* Info rows */}
      <div className="px-4 py-3 space-y-2.5 flex-1">
        <InfoRow icon={Building2}    label="Warehouse"     value={item.warehouse}    />
        <InfoRow icon={Truck}        label="Supplier"      value={item.supplier}     />
        <InfoRow icon={Tag}          label="Category"      value={item.category}     />
        <InfoRow icon={CalendarDays} label="Last Purchase" value={item.lastPurchase} />
        <InfoRow icon={BellRing}     label="Alert Since"   value={item.alertSince}   />
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 space-y-2">
        {/* Primary: Create PO (SRS REQ-INV-003) */}
        <button
          onClick={() => {
            toast.info(`Creating purchase order for ${item.product}…`);
            navigate('/purchase-orders');
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold transition-colors shadow-sm shadow-blue-200"
        >
          <FileText size={14} />
          Create Purchase Order
        </button>
        {/* Secondary: Dismiss */}
        <button
          onClick={() => {
            onDismiss(item.id);
            toast.success(`Alert dismissed for ${item.product}`);
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          <CheckCircle2 size={14} />
          Dismiss Alert
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value, bold, muted, valueColor }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={cn('text-xs', muted ? 'text-slate-400' : 'text-slate-500')}>{label}</span>
      <span className={cn('text-xs font-semibold', valueColor || (bold ? 'text-slate-800' : 'text-slate-600'))}>
        {value}
      </span>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={12} className="text-slate-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
        <span className="text-xs text-slate-500 shrink-0">{label}</span>
        <span className="text-xs font-semibold text-slate-700 text-right leading-tight">{value}</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LowStockAlerts() {
  const [alerts,       setAlerts]       = useState(INITIAL_ALERTS);
  const [search,       setSearch]       = useState('');
  const [category,     setCategory]     = useState('All Categories');
  const [warehouse,    setWarehouse]    = useState('All Warehouses');
  const [sevFilter,    setSevFilter]    = useState('All Alerts');
  const [startDate,    setStartDate]    = useState('');
  const [endDate,      setEndDate]      = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [reorderItem,  setReorderItem]  = useState(null);
  const [viewItem,     setViewItem]     = useState(null);

  const hasFilter = search || category !== 'All Categories' || warehouse !== 'All Warehouses' || sevFilter !== 'All Alerts' || startDate || endDate;

  const clearFilters = () => {
    setSearch('');
    setCategory('All Categories');
    setWarehouse('All Warehouses');
    setSevFilter('All Alerts');
    setStartDate('');
    setEndDate('');
  };

  // Only show non-dismissed alerts
  const visible = useMemo(() => alerts.filter(a => !a.acknowledged), [alerts]);

  const filtered = useMemo(() => {
    const q  = search.toLowerCase();
    const sk = SEV_FILTER_MAP[sevFilter];
    return visible.filter(item => {
      const matchQ  = !q  || item.product.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
      const matchC  = category  === 'All Categories' || item.category === category;
      const matchW  = warehouse === 'All Warehouses' || item.warehouse === warehouse;
      const matchS  = !sk || getSeverity(item) === sk;
      const matchD  = inDateRange(item.alertSince, startDate, endDate);
      return matchQ && matchC && matchW && matchS && matchD;
    });
  }, [visible, search, category, warehouse, sevFilter, startDate, endDate]);

  // KPI counts (from all visible alerts, not just filtered)
  const kpis = useMemo(() => {
    const outCount      = visible.filter(a => getSeverity(a) === 'out').length;
    const critCount     = visible.filter(a => getSeverity(a) === 'critical').length;
    const lowCount      = visible.filter(a => getSeverity(a) === 'low').length;
    const reorderCount  = visible.filter(a => getSeverity(a) === 'reorder').length;
    return [
      { label: 'Critical',            sub: '(out of stock)',          value: outCount,     Icon: AlertOctagon,  bg: 'bg-red-50',    icon: 'text-red-600'    },
      { label: 'Low Stock',           sub: 'below reorder',           value: critCount + lowCount, Icon: AlertTriangle, bg: 'bg-amber-50', icon: 'text-amber-600' },
      { label: 'Reorder Suggestions', sub: 'approaching reorder',     value: reorderCount, Icon: RefreshCw,     bg: 'bg-blue-50',   icon: 'text-blue-600'   },
      { label: 'Total Alerts',        sub: 'items need attention',    value: visible.length, Icon: BellRing,    bg: 'bg-violet-50', icon: 'text-violet-600' },
    ];
  }, [visible]);

  function handleDismiss(id) {
    setAlerts(list => list.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    if (selectedItem?.id === id) setSelectedItem(null);
  }

  function handleSetReorder(id, level) {
    setAlerts(list => list.map(a => a.id === id ? { ...a, reorderLevel: level } : a));
    if (selectedItem?.id === id) setSelectedItem(a => a ? { ...a, reorderLevel: level } : a);
  }

  function handleRowClick(item) {
    setSelectedItem(prev => prev?.id === item.id ? null : item);
  }

  return (
    <div className="space-y-5 fade-up">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <PageHeader
        title="Low Stock Alerts"
        description="Monitor critical inventory levels and take immediate reorder action."
      />

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => {
          const Icon = k.Icon;
          return (
            <div
              key={k.label}
              onClick={() => setSevFilter(k.label === 'Critical' ? 'Out of Stock' : k.label === 'Total Alerts' ? 'All Alerts' : k.label === 'Low Stock' ? 'Low Stock' : 'Reorder Due')}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4 flex items-center gap-4 cursor-pointer hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className={cn('w-11 h-11 rounded-full flex items-center justify-center shrink-0', k.bg)}>
                <Icon size={20} className={k.icon} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{k.label}</p>
                <p className="text-2xl font-extrabold text-slate-900 leading-tight">{k.value}</p>
                <p className="text-[10px] text-slate-400 capitalize">{k.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search SKU, products..."
            className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 outline-none focus:border-blue-400 transition-colors"
          />
        </div>
        <FilterSelect value={category}  onChange={setCategory}  options={CATEGORIES_F} />
        <FilterSelect value={warehouse} onChange={setWarehouse} options={WAREHOUSES_F} />
        <FilterSelect value={sevFilter} onChange={setSevFilter} options={SEVERITY_F}   />
        <DateRangeFilter startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e); }} />
        {hasFilter ? (
          <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors">
            <X size={12} /> Clear
          </button>
        ) : (
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">
            <Filter size={12} /> Filter
          </button>
        )}
      </div>

      {/* ── Table + Detail Panel ────────────────────────────────────────────── */}
      <div className="flex gap-4 items-start">

        {/* Table */}
        <div className="flex-1 min-w-0 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {['SKU', 'Product', 'Category', 'Warehouse', 'Available', 'Reorder', 'Days Left', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <TrendingDown size={32} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-slate-400 text-sm">No alerts match the current filters.</p>
                  </td>
                </tr>
              ) : filtered.map(item => {
                const severity   = getSeverity(item);
                const av         = avail(item);
                const isSelected = selectedItem?.id === item.id;

                return (
                  <tr
                    key={item.id}
                    onClick={() => handleRowClick(item)}
                    className={cn(
                      'cursor-pointer transition-colors duration-100',
                      isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-slate-50/70'
                    )}
                  >
                    {/* SKU */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono font-semibold text-slate-600">{item.sku}</span>
                    </td>

                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', SEVERITY_CFG[severity].dot)} />
                        <span className="text-sm font-semibold text-slate-800">{item.product}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">{item.category}</span>
                    </td>

                    {/* Warehouse */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">{item.warehouse}</span>
                    </td>

                    {/* Available Stock */}
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-sm font-bold',
                        severity === 'out' ? 'text-red-600' :
                        severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                      )}>
                        {av}
                      </span>
                    </td>

                    {/* Reorder Level */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500">{item.reorderLevel}</span>
                    </td>

                    {/* Days Left */}
                    <td className="px-4 py-3">
                      <DaysLeftCell days={item.daysRemaining} severity={severity} />
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <SeverityBadge severity={severity} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <ActionMenu
                        item={item}
                        onView={setViewItem}
                        onDismiss={handleDismiss}
                        onSetReorder={setReorderItem}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-100 text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-600">{filtered.length}</span> alerts —{' '}
              click any row to view full details
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedItem && (
          <DetailPanel
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onDismiss={handleDismiss}
          />
        )}
      </div>

      {/* Set Reorder Level modal */}
      {reorderItem && (
        <SetReorderModal
          item={reorderItem}
          onClose={() => setReorderItem(null)}
          onSave={handleSetReorder}
        />
      )}

      {/* View Details modal */}
      {viewItem && <ViewModal item={viewItem} onClose={() => setViewItem(null)} />}
    </div>
  );
}
