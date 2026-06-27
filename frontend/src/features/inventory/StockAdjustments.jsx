import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, Filter, X, ChevronDown, Calendar, Plus, MoreVertical,
  Eye, CheckCircle2, XCircle, Clock, Upload, AlertTriangle,
  Package, Building2, SlidersHorizontal, ArrowRight, Info,
  ShieldAlert, Trash2, RefreshCw, RotateCcw, PlusCircle,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { cn } from '../../utils/cn';
import { toast } from '../../utils/toast';

// ─── Catalog (mock — replace with API) ───────────────────────────────────────

const PRODUCT_CATALOG = [
  { sku: 'SKU-CLO-000123', name: 'Ladies Jeans',              category: 'Clothing',    warehouses: { 'Galle': 50,  'Colombo': 80,  'Kandy': 30  } },
  { sku: 'SKU-GRO-000123', name: 'Bread (White 400g)',         category: 'Grocery',     warehouses: { 'Colombo': 120,'Galle': 90,   'Kandy': 60  } },
  { sku: 'SKU-BEV-000123', name: 'Soft Drink 330ml',           category: 'Beverage',    warehouses: { 'Kandy': 200, 'Colombo': 150, 'Galle': 100 } },
  { sku: 'SKU-STA-000123', name: 'School Bag',                  category: 'Stationery',  warehouses: { 'Nugegoda': 15,'Colombo': 25, 'Kandy': 10  } },
  { sku: 'SKU-ELE-000123', name: 'Samsung Galaxy S24 128GB',   category: 'Electronics', warehouses: { 'Colombo': 50, 'Galle': 30,   'Kandy': 20  } },
  { sku: 'SKU-HH-000500',  name: 'Surf Excel Detergent 2kg',   category: 'Household',   warehouses: { 'Colombo': 14, 'Kandy': 20,   'Galle': 18  } },
  { sku: 'SKU-GRO-000201', name: 'Sunflower Cooking Oil 1L',   category: 'Grocery',     warehouses: { 'Colombo': 18, 'Galle': 12,   'Kandy': 22  } },
  { sku: 'SKU-CLO-000401', name: "Men's Cotton T-Shirt (M)",   category: 'Clothing',    warehouses: { 'Colombo': 80, 'Kandy': 40,   'Galle': 25  } },
];

const BRANCHES = ['Colombo Branch', 'Galle Branch', 'Kandy Branch', 'Nugegoda Branch'];

// ─── Adjustment types ─────────────────────────────────────────────────────────
// SRS REQ-INV-004: reason is mandatory; type determines stock direction

const ADJ_TYPE_CFG = {
  'Damaged':            { dir: -1, color: 'bg-red-100    text-red-700    border-red-200',    Icon: ShieldAlert,   description: 'Damaged — cannot be sold' },
  'Expired':            { dir: -1, color: 'bg-red-100    text-red-700    border-red-200',    Icon: Clock,         description: 'Expired — past sell-by date' },
  'Lost':               { dir: -1, color: 'bg-amber-100  text-amber-700  border-amber-200',  Icon: AlertTriangle, description: 'Misplaced or unaccounted for' },
  'Theft':              { dir: -1, color: 'bg-red-100    text-red-700    border-red-200',    Icon: ShieldAlert,   description: 'Reported as stolen' },
  'Return to Supplier': { dir: -1, color: 'bg-orange-100 text-orange-700 border-orange-200', Icon: RotateCcw,     description: 'Returned to supplier' },
  'Add Stock':          { dir: +1, color: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: PlusCircle, description: 'Manual stock addition / correction' },
  'Cycle Count':        { dir: +1, color: 'bg-blue-100   text-blue-700   border-blue-200',   Icon: RefreshCw,     description: 'Physical count correction' },
};

const ADJ_TYPE_OPTIONS = Object.keys(ADJ_TYPE_CFG);

const STATUS_CFG = {
  'Pending':  { color: 'bg-amber-100  text-amber-700  border-amber-200',  Icon: Clock        },
  'Approved': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  'Rejected': { color: 'bg-red-100    text-red-700    border-red-200',    Icon: XCircle      },
  'Completed':{ color: 'bg-slate-100  text-slate-600  border-slate-200',  Icon: CheckCircle2 },
};

// ─── Mock adjustments ─────────────────────────────────────────────────────────

const INITIAL_ADJUSTMENTS = [
  { id: 1, date: '10 Jun 2026', time: '10:00 a.m.', sku: 'SKU-CLO-000123', product: 'Ladies Jeans',           category: 'Clothing',    warehouse: 'Galle',    branch: 'Galle Branch',    adjType: 'Damaged',   reason: 'Water damage from warehouse flooding',          qty: -10, stockBefore: 60,  stockAfter: 50,  adjustedBy: 'Kasun',  status: 'Rejected'  },
  { id: 2, date: '10 Jun 2026', time: '15:00 p.m.', sku: 'SKU-GRO-000123', product: 'Bread (White 400g)',      category: 'Grocery',     warehouse: 'Colombo',  branch: 'Colombo Branch',  adjType: 'Damaged',   reason: 'Crushed during transit, unsellable',            qty:  -5, stockBefore: 125, stockAfter: 120, adjustedBy: 'Ayesha', status: 'Approved'  },
  { id: 3, date: '11 Jun 2026', time: '10:00 a.m.', sku: 'SKU-BEV-000123', product: 'Soft Drink 330ml',        category: 'Beverage',    warehouse: 'Kandy',    branch: 'Kandy Branch',    adjType: 'Add Stock', reason: 'Cycle count correction — previous count error', qty: +100,stockBefore: 100, stockAfter: 200, adjustedBy: 'Rohan',  status: 'Approved'  },
  { id: 4, date: '11 Jun 2026', time: '11:00 a.m.', sku: 'SKU-STA-000123', product: 'School Bag',               category: 'Stationery',  warehouse: 'Nugegoda', branch: 'Nugegoda Branch', adjType: 'Lost',      reason: 'Items missing after stockroom reorganisation',  qty: -15, stockBefore: 30,  stockAfter: 15,  adjustedBy: 'Priya',  status: 'Pending'   },
  { id: 5, date: '12 Jun 2026', time: '09:30 a.m.', sku: 'SKU-ELE-000123', product: 'Samsung Galaxy S24 128GB', category: 'Electronics', warehouse: 'Colombo',  branch: 'Colombo Branch',  adjType: 'Theft',     reason: 'Security incident — 3 units reported stolen',  qty:  -3, stockBefore: 53,  stockAfter: 50,  adjustedBy: 'Nimal',  status: 'Pending'   },
  { id: 6, date: '12 Jun 2026', time: '14:00 p.m.', sku: 'SKU-GRO-000201', product: 'Sunflower Cooking Oil 1L', category: 'Grocery',     warehouse: 'Galle',    branch: 'Galle Branch',    adjType: 'Expired',   reason: 'Batch EXP2026-06 past expiry, removed from shelf', qty: -8, stockBefore: 20, stockAfter: 12, adjustedBy: 'Dasun',  status: 'Approved'  },
  { id: 7, date: '13 Jun 2026', time: '11:00 a.m.', sku: 'SKU-HH-000500',  product: 'Surf Excel Detergent 2kg', category: 'Household',  warehouse: 'Kandy',    branch: 'Kandy Branch',    adjType: 'Cycle Count', reason: 'Physical count 20 vs system 14, correcting upward', qty: +6, stockBefore: 14, stockAfter: 20, adjustedBy: 'Priya',  status: 'Completed' },
];

// ─── Form initial state ───────────────────────────────────────────────────────

const EMPTY_FORM = {
  productSku: '', branch: '', warehouse: '', adjType: '', qty: '', reason: '', evidence: null,
};

const EMPTY_ERRORS = {
  productSku: '', branch: '', warehouse: '', adjType: '', qty: '', reason: '',
};

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

function AdjTypeBadge({ type }) {
  const cfg = ADJ_TYPE_CFG[type];
  if (!cfg) return <span className="text-xs text-slate-500">{type}</span>;
  const Icon = cfg.Icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border', cfg.color)}>
      <Icon size={9} />
      {type}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status];
  if (!cfg) return <span className="text-xs text-slate-500">{status}</span>;
  const Icon = cfg.Icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border', cfg.color)}>
      <Icon size={9} />
      {status}
    </span>
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
          <p className="text-xs font-semibold text-slate-700 mb-3">Filter by Date</p>
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
function ActionMenu({ item, onView, onApprove, onReject }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
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
        <div className="absolute right-0 top-8 z-30 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 fade-in">
          <button
            onClick={() => { onView(item); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Eye size={13} /> View Details
          </button>
          {item.status === 'Pending' && (
            <>
              <button
                onClick={() => { onApprove(item.id); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <CheckCircle2 size={13} /> Approve
              </button>
              <button
                onClick={() => { onReject(item.id); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <XCircle size={13} /> Reject
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── View Details Modal ───────────────────────────────────────────────────────

function ViewModal({ item, onClose }) {
  useEffect(() => {
    function handler(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const isPositive = item.qty > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Adjustment Details</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{item.sku}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Product + Status */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-bold text-slate-800">{item.product}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.category} · {item.warehouse}</p>
            </div>
            <StatusBadge status={item.status} />
          </div>

          {/* Before → After stock (SRS REQ-INV-005) */}
          <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-slate-400">Stock Before</p>
              <p className="text-2xl font-extrabold text-slate-700">{item.stockBefore}</p>
              <p className="text-[10px] text-slate-400">units</p>
            </div>
            <div className="flex-1 text-center">
              <ArrowRight size={18} className="mx-auto text-slate-300" />
              <p className={cn('text-sm font-bold mt-0.5', isPositive ? 'text-emerald-600' : 'text-red-600')}>
                {isPositive ? '+' : ''}{item.qty}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">Stock After</p>
              <p className={cn('text-2xl font-extrabold', isPositive ? 'text-emerald-700' : 'text-red-700')}>{item.stockAfter}</p>
              <p className="text-[10px] text-slate-400">units</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Adjustment Type', <AdjTypeBadge type={item.adjType} />],
              ['Branch',          item.branch],
              ['Adjusted By',     item.adjustedBy],
              ['Date & Time',     `${item.date}, ${item.time}`],
            ].map(([label, val]) => (
              <div key={label} className="bg-slate-50 rounded-lg px-3 py-2.5">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                <div className="mt-1 text-sm font-semibold text-slate-700">{val}</div>
              </div>
            ))}
          </div>

          {/* Reason (SRS REQ-INV-004) */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1.5">Reason / Notes</p>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2.5 leading-relaxed">{item.reason}</p>
          </div>
        </div>

        <div className="px-6 pb-5">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Adjustment Modal ──────────────────────────────────────────────────

function CreateModal({ onClose, onSave }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const fileRef             = useRef(null);

  useEffect(() => {
    function handler(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Resolve selected product
  const product = PRODUCT_CATALOG.find(p => p.sku === form.productSku) || null;

  // Available warehouses based on product + branch selection
  const availableWarehouses = product
    ? Object.keys(product.warehouses).filter(w => !form.branch || w.startsWith(form.branch.replace(' Branch', '')))
    : [];

  const currentStock = product && form.warehouse ? (product.warehouses[form.warehouse] ?? 0) : null;
  const adjCfg       = form.adjType ? ADJ_TYPE_CFG[form.adjType] : null;
  const qtyNum       = parseInt(form.qty, 10) || 0;
  const signedQty    = adjCfg ? adjCfg.dir * qtyNum : 0;
  const stockAfter   = currentStock !== null ? currentStock + signedQty : null;

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  function validate() {
    const e = { ...EMPTY_ERRORS };
    if (!form.productSku) e.productSku = 'Select a product';
    if (!form.branch)     e.branch     = 'Select a branch';
    if (!form.warehouse)  e.warehouse  = 'Select a warehouse';
    if (!form.adjType)    e.adjType    = 'Select an adjustment type';
    if (!form.qty || qtyNum <= 0) e.qty = 'Enter a positive quantity';
    if (!form.reason.trim()) e.reason  = 'Reason is required (SRS BR-INV-002)';
    if (adjCfg?.dir === -1 && stockAfter !== null && stockAfter < 0)
      e.qty = 'Quantity exceeds current stock';
    setErrors(e);
    return Object.values(e).every(v => !v);
  }

  function handleSubmit() {
    if (!validate()) return;
    const now = new Date();
    onSave({
      date:        now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }).replace(/ /g, ' '),
      time:        now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:true }),
      sku:         product.sku,
      product:     product.name,
      category:    product.category,
      warehouse:   form.warehouse,
      branch:      form.branch,
      adjType:     form.adjType,
      reason:      form.reason,
      qty:         signedQty,
      stockBefore: currentStock,
      stockAfter:  stockAfter,
      adjustedBy:  'Current User',
      status:      'Pending',
      evidence:    form.evidence?.name || null,
    });
    onClose();
  }

  function FieldError({ field }) {
    return errors[field] ? (
      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
        <AlertTriangle size={10} /> {errors[field]}
      </p>
    ) : null;
  }

  function Label({ children, required }) {
    return (
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    );
  }

  const inputCls = (field) => cn(
    'w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors',
    errors[field]
      ? 'border-red-300 bg-red-50 focus:border-red-400'
      : 'border-slate-200 bg-white focus:border-blue-400'
  );

  const selectCls = (field) => cn(
    'w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors appearance-none cursor-pointer',
    errors[field]
      ? 'border-red-300 bg-red-50 focus:border-red-400'
      : 'border-slate-200 bg-white focus:border-blue-400'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-bold text-slate-900">Create New Adjustment</h2>
            <p className="text-xs text-slate-400 mt-0.5">All fields marked * are required</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Form body */}
        <div className="px-6 py-5 space-y-5">

          {/* Row 1: Product + Branch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label required>Product</Label>
              <div className="relative">
                <select
                  value={form.productSku}
                  onChange={e => {
                    set('productSku', e.target.value);
                    set('warehouse', '');
                  }}
                  className={selectCls('productSku')}
                >
                  <option value="">Select Product</option>
                  {PRODUCT_CATALOG.map(p => (
                    <option key={p.sku} value={p.sku}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <FieldError field="productSku" />
            </div>
            <div>
              <Label required>Branch</Label>
              <div className="relative">
                <select value={form.branch} onChange={e => { set('branch', e.target.value); set('warehouse', ''); }} className={selectCls('branch')}>
                  <option value="">Select Branch</option>
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <FieldError field="branch" />
            </div>
          </div>

          {/* Row 2: SKU (auto) + Warehouse */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>SKU</Label>
              <input
                type="text"
                value={product?.sku ?? ''}
                readOnly
                placeholder="Auto-filled from product"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
              />
            </div>
            <div>
              <Label required>Warehouse</Label>
              <div className="relative">
                <select
                  value={form.warehouse}
                  onChange={e => set('warehouse', e.target.value)}
                  disabled={availableWarehouses.length === 0}
                  className={cn(selectCls('warehouse'), availableWarehouses.length === 0 && 'opacity-50 cursor-not-allowed')}
                >
                  <option value="">Select Warehouse</option>
                  {availableWarehouses.map(w => (
                    <option key={w}>{w}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <FieldError field="warehouse" />
            </div>
          </div>

          {/* Row 3: Category (auto) + Current Stock (auto) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Product Category</Label>
              <input
                type="text"
                value={product?.category ?? ''}
                readOnly
                placeholder="Auto-filled from product"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
              />
            </div>
            <div>
              <Label>Current Stock</Label>
              <input
                type="text"
                value={currentStock !== null ? `${currentStock} units` : ''}
                readOnly
                placeholder="Select product & warehouse"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
              />
            </div>
          </div>

          {/* Row 4: Adjustment Type + Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label required>Adjustment Type</Label>
              <div className="relative">
                <select value={form.adjType} onChange={e => set('adjType', e.target.value)} className={selectCls('adjType')}>
                  <option value="">Select Adjustment Type</option>
                  <optgroup label="Remove from Stock">
                    {['Damaged','Expired','Lost','Theft','Return to Supplier'].map(t => <option key={t}>{t}</option>)}
                  </optgroup>
                  <optgroup label="Add to Stock">
                    {['Add Stock','Cycle Count'].map(t => <option key={t}>{t}</option>)}
                  </optgroup>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {adjCfg && (
                <p className={cn('text-[11px] mt-1 flex items-center gap-1 font-medium', adjCfg.dir === -1 ? 'text-red-500' : 'text-emerald-600')}>
                  <Info size={10} />
                  {adjCfg.dir === -1 ? 'Will REMOVE units from stock' : 'Will ADD units to stock'}
                </p>
              )}
              <FieldError field="adjType" />
            </div>
            <div>
              <Label required>Quantity</Label>
              <input
                type="number"
                min="1"
                value={form.qty}
                onChange={e => set('qty', e.target.value)}
                placeholder="Enter units to adjust"
                className={inputCls('qty')}
              />
              <FieldError field="qty" />
            </div>
          </div>

          {/* Stock before → after preview (SRS REQ-INV-005: before/after values) */}
          {adjCfg && qtyNum > 0 && currentStock !== null && (
            <div className={cn(
              'flex items-center gap-4 px-4 py-3 rounded-xl border',
              stockAfter < 0
                ? 'bg-red-50 border-red-200'
                : 'bg-slate-50 border-slate-200'
            )}>
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Before</p>
                <p className="text-xl font-extrabold text-slate-700">{currentStock}</p>
                <p className="text-[10px] text-slate-400">units</p>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <ArrowRight size={16} className="text-slate-400" />
                <p className={cn('text-xs font-bold', signedQty > 0 ? 'text-emerald-600' : 'text-red-600')}>
                  {signedQty > 0 ? '+' : ''}{signedQty}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">After</p>
                <p className={cn('text-xl font-extrabold', stockAfter < 0 ? 'text-red-600' : stockAfter < 10 ? 'text-amber-600' : 'text-emerald-700')}>
                  {stockAfter}
                </p>
                <p className="text-[10px] text-slate-400">units</p>
              </div>
            </div>
          )}

          {/* Reason — REQUIRED per SRS BR-INV-002 */}
          <div>
            <Label required>Reason / Notes</Label>
            <textarea
              rows={3}
              value={form.reason}
              onChange={e => set('reason', e.target.value)}
              placeholder="Describe the reason for this adjustment (required for audit trail)"
              className={cn(inputCls('reason'), 'resize-none leading-relaxed')}
            />
            <FieldError field="reason" />
          </div>

          {/* Upload Evidence */}
          <div>
            <Label>Upload Evidence</Label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl px-4 py-4 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
            >
              <Upload size={16} className="mx-auto text-slate-400 mb-1" />
              <p className="text-xs text-slate-500">
                {form.evidence ? (
                  <span className="text-blue-600 font-semibold">{form.evidence.name}</span>
                ) : (
                  <>Click to upload <span className="font-semibold text-slate-600">photos or documents</span></>
                )}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, PDF up to 10MB</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={e => set('evidence', e.target.files[0] || null)}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 pb-5 pt-2 border-t border-slate-100 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-blue-200"
          >
            Save Adjustment
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const CATEGORIES_FILTER = ['All Categories', 'Clothing', 'Grocery', 'Beverage', 'Stationery', 'Electronics', 'Household'];
const WAREHOUSES_FILTER = ['All Warehouses', 'Colombo', 'Galle', 'Kandy', 'Nugegoda'];
const STATUSES_FILTER   = ['All Statuses', 'Pending', 'Approved', 'Rejected', 'Completed'];

export default function StockAdjustments() {
  const [adjustments,  setAdjustments]  = useState(INITIAL_ADJUSTMENTS);
  const [search,       setSearch]       = useState('');
  const [category,     setCategory]     = useState('All Categories');
  const [warehouse,    setWarehouse]    = useState('All Warehouses');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [startDate,    setStartDate]    = useState('');
  const [endDate,      setEndDate]      = useState('');
  const [showCreate,   setShowCreate]   = useState(false);
  const [viewItem,     setViewItem]     = useState(null);

  const hasFilter = search || category !== 'All Categories' || warehouse !== 'All Warehouses' || statusFilter !== 'All Statuses' || startDate || endDate;

  const clearFilters = () => {
    setSearch('');
    setCategory('All Categories');
    setWarehouse('All Warehouses');
    setStatusFilter('All Statuses');
    setStartDate('');
    setEndDate('');
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return adjustments.filter(a => {
      const matchQ  = !q || a.product.toLowerCase().includes(q) || a.sku.toLowerCase().includes(q);
      const matchC  = category      === 'All Categories' || a.category.toLowerCase().includes(category.toLowerCase());
      const matchW  = warehouse     === 'All Warehouses' || a.warehouse === warehouse;
      const matchS  = statusFilter  === 'All Statuses'   || a.status    === statusFilter;
      const matchD  = inDateRange(a.date, startDate, endDate);
      return matchQ && matchC && matchW && matchS && matchD;
    });
  }, [adjustments, search, category, warehouse, statusFilter, startDate, endDate]);

  function handleApprove(id) {
    setAdjustments(list => list.map(a => a.id === id ? { ...a, status: 'Approved' } : a));
    toast.success('Adjustment approved successfully');
  }
  function handleReject(id) {
    setAdjustments(list => list.map(a => a.id === id ? { ...a, status: 'Rejected' } : a));
    toast.error('Adjustment rejected');
  }
  function handleSave(newItem) {
    setAdjustments(list => [{ id: Date.now(), ...newItem }, ...list]);
    toast.success('Adjustment submitted for approval');
  }

  return (
    <div className="space-y-5 fade-up">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <PageHeader
        title="Inventory Adjustments"
        description="Manage manual stock corrections, damage reports, and cycle count adjustments."
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-blue-200"
          >
            <Plus size={14} /> Create New Adjustment
          </button>
        }
      />

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search SKU, products..."
            className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 transition-colors"
          />
        </div>
        <FilterSelect value={category}     onChange={setCategory}     options={CATEGORIES_FILTER} />
        <FilterSelect value={warehouse}    onChange={setWarehouse}    options={WAREHOUSES_FILTER} />
        <FilterSelect value={statusFilter} onChange={setStatusFilter} options={STATUSES_FILTER}   />
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

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse min-w-[820px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {['Date', 'SKU', 'Product', 'Category', 'Warehouse', 'Adj. Type', 'Qty', 'Adj. By', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-14 text-center text-slate-400">
                  No adjustments match the current filters.
                </td>
              </tr>
            ) : filtered.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                {/* Date */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="text-xs font-semibold text-slate-700">{item.date}</p>
                  <p className="text-[10px] text-slate-400">{item.time}</p>
                </td>
                {/* SKU */}
                <td className="px-4 py-3">
                  <span className="text-xs font-mono font-semibold text-slate-600">{item.sku}</span>
                </td>
                {/* Product */}
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-slate-800">{item.product}</span>
                </td>
                {/* Category */}
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">{item.category}</span>
                </td>
                {/* Warehouse */}
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">{item.warehouse}</span>
                </td>
                {/* Adj. Type */}
                <td className="px-4 py-3">
                  <AdjTypeBadge type={item.adjType} />
                </td>
                {/* Qty — signed + colored */}
                <td className="px-4 py-3">
                  <div>
                    <span className={cn(
                      'text-sm font-bold tabular-nums',
                      item.qty > 0 ? 'text-emerald-600' : 'text-red-600'
                    )}>
                      {item.qty > 0 ? '+' : ''}{item.qty}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {item.stockBefore} → {item.stockAfter}
                    </p>
                  </div>
                </td>
                {/* Adjusted By — audit trail (REQ-INV-005) */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                      {item.adjustedBy[0]}
                    </div>
                    <span className="text-sm text-slate-700">{item.adjustedBy}</span>
                  </div>
                </td>
                {/* Status */}
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                {/* Actions */}
                <td className="px-4 py-3">
                  <ActionMenu
                    item={item}
                    onView={setViewItem}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-100 text-xs text-slate-400">
            Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-600">{adjustments.length}</span> adjustments
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onSave={handleSave} />}
      {viewItem   && <ViewModal  item={viewItem}                      onClose={() => setViewItem(null)} />}
    </div>
  );
}
