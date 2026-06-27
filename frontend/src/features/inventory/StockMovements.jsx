import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, Filter, X, ChevronDown, Calendar,
  ArrowLeftRight, PackagePlus, Shuffle, SlidersHorizontal,
  CheckCircle2, Clock, Ban, ArrowDownToLine, ArrowUpFromLine,
  RefreshCw, Undo2, Package, User, Building2, Truck,
  AlertTriangle, Info, MoreVertical, Eye, ArrowRight,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { cn } from '../../utils/cn';

// ─── Mock data ────────────────────────────────────────────────────────────────
// Types per SRS REQ-INV-002: Received | Transfer In | Transfer Out | Adjustment | Return
// Reason required for Adjustment per SRS REQ-INV-004 / BR-INV-002

const MOCK_MOVEMENTS = [
  { id:  1, referenceId: 'GRN-000123', sku: 'SKU-ELE-000123', product: 'Samsung Galaxy S24 128GB',    category: 'Electronics',   type: 'Received',     qty: +250, source: 'Supplier (Samsung Lanka)',  destination: 'Main Warehouse',   staff: 'Nimal',   status: 'Completed', date: '19 Jun 2026', time: '10:30 a.m.', reason: null,                                         transferId: null          },
  { id:  2, referenceId: 'TRF-000400', sku: 'SKU-CLO-000400', product: "Women's Jeans",               category: 'Clothing',      type: 'Transfer Out', qty:  -30, source: 'Colombo Branch',            destination: 'Kandy Branch',     staff: 'Kasun',   status: 'Approved',  date: '19 Jun 2026', time: '10:30 a.m.', reason: null,                                         transferId: 'TID0000123'  },
  { id:  3, referenceId: 'ADJ-000510', sku: 'SKU-CLO-000510', product: 'Sport Shoes',                 category: 'Clothing',      type: 'Adjustment',   qty:   -5, source: 'Warehouse A',               destination: 'Galle Branch',     staff: 'Dasun',   status: 'Pending',   date: '19 Jun 2026', time: '11:30 a.m.', reason: 'Damaged goods — quality inspection failed', transferId: null          },
  { id:  4, referenceId: 'GRN-000124', sku: 'SKU-GRO-000201', product: 'Sunflower Cooking Oil 1L',    category: 'Groceries',     type: 'Received',     qty:  +80, source: 'Supplier (Sunrich Lanka)',  destination: 'Colombo Warehouse',staff: 'Ayesha',  status: 'Completed', date: '18 Jun 2026', time: '09:15 a.m.', reason: null,                                         transferId: null          },
  { id:  5, referenceId: 'TRF-000401', sku: 'SKU-BEV-000300', product: 'Coca-Cola 1.5L',              category: 'Beverages',     type: 'Transfer In',  qty:  +50, source: 'Colombo Warehouse',         destination: 'Galle Branch',     staff: 'Rohan',   status: 'Completed', date: '18 Jun 2026', time: '14:00 p.m.', reason: null,                                         transferId: 'TID0000124'  },
  { id:  6, referenceId: 'ADJ-000511', sku: 'SKU-GRO-000202', product: 'Full Cream Milk 1L',          category: 'Groceries',     type: 'Adjustment',   qty:  -12, source: 'Kandy Warehouse',           destination: 'Kandy Warehouse',  staff: 'Priya',   status: 'Completed', date: '17 Jun 2026', time: '08:00 a.m.', reason: 'Expired stock removed — batch EXP2026-06', transferId: null          },
  { id:  7, referenceId: 'RTN-000050', sku: 'SKU-ELE-000124', product: 'Lenovo IdeaPad Slim 3',       category: 'Electronics',   type: 'Return',       qty:   +2, source: 'Customer Return',           destination: 'Main Warehouse',   staff: 'Nimal',   status: 'Completed', date: '17 Jun 2026', time: '11:45 a.m.', reason: 'Customer returned — screen defect',         transferId: null          },
  { id:  8, referenceId: 'TRF-000402', sku: 'SKU-STA-000010', product: 'A4 Printing Paper (Ream)',    category: 'Stationery',    type: 'Transfer Out', qty:  -20, source: 'Kandy Warehouse',           destination: 'Galle Branch',     staff: 'Dasun',   status: 'Pending',   date: '19 Jun 2026', time: '17:30 p.m.', reason: null,                                         transferId: 'TID0000125'  },
  { id:  9, referenceId: 'GRN-000125', sku: 'SKU-HH-000500',  product: 'Surf Excel Detergent 2kg',   category: 'Household',     type: 'Received',     qty:  +60, source: 'Supplier (Unilever Ceylon)',destination: 'Colombo Warehouse',staff: 'Ayesha',  status: 'Completed', date: '16 Jun 2026', time: '09:00 a.m.', reason: null,                                         transferId: null          },
  { id: 10, referenceId: 'ADJ-000512', sku: 'SKU-PC-000601',  product: 'Nivea Body Lotion 250ml',     category: 'Personal Care', type: 'Adjustment',   qty:   +8, source: 'Colombo Warehouse',         destination: 'Colombo Warehouse',staff: 'Kasun',   status: 'Approved',  date: '15 Jun 2026', time: '13:20 p.m.', reason: 'Cycle count correction — miscount in prev audit', transferId: null       },
  { id: 11, referenceId: 'TRF-000403', sku: 'SKU-CLO-000401', product: "Men's Cotton T-Shirt (M)",    category: 'Clothing',      type: 'Transfer In',  qty:  +40, source: 'Colombo Warehouse',         destination: 'Kandy Branch',     staff: 'Rohan',   status: 'Approved',  date: '15 Jun 2026', time: '16:00 p.m.', reason: null,                                         transferId: 'TID0000122'  },
  { id: 12, referenceId: 'RTN-000051', sku: 'SKU-BEV-000301', product: 'Red Bull Energy Drink 250ml', category: 'Beverages',    type: 'Return',       qty:   +6, source: 'Supplier Return',           destination: 'Galle Warehouse',  staff: 'Priya',   status: 'Completed', date: '14 Jun 2026', time: '10:00 a.m.', reason: 'Short expiry — returned to supplier',       transferId: null          },
];

// All transfer tracker data — keyed by Transfer ID (REQ-INV-003)
const TRACKERS = {
  TID0000122: {
    id: 'TID0000122',
    from: 'Colombo Warehouse',
    to: 'Kandy Branch',
    product: "Men's Cotton T-Shirt (M) × 40",
    steps: [
      { label: 'Requested',  done: true,  date: '15 Jun', time: '14:00 p.m.' },
      { label: 'Approved',   done: true,  date: '15 Jun', time: '16:00 p.m.' },
      { label: 'Dispatched', done: false, date: null,     time: 'Pending'     },
      { label: 'Received',   done: false, date: null,     time: 'Pending'     },
    ],
  },
  TID0000123: {
    id: 'TID0000123',
    from: 'Colombo Branch',
    to: 'Kandy Branch',
    product: "Women's Jeans × 30",
    steps: [
      { label: 'Requested',  done: true,  date: '19 Jun', time: '08:30 a.m.' },
      { label: 'Approved',   done: true,  date: '19 Jun', time: '10:30 a.m.' },
      { label: 'Dispatched', done: true,  date: '19 Jun', time: '11:30 a.m.' },
      { label: 'Received',   done: false, date: null,     time: 'Pending'     },
    ],
  },
  TID0000124: {
    id: 'TID0000124',
    from: 'Colombo Warehouse',
    to: 'Galle Branch',
    product: 'Coca-Cola 1.5L × 50',
    steps: [
      { label: 'Requested',  done: true, date: '18 Jun', time: '12:00 p.m.' },
      { label: 'Approved',   done: true, date: '18 Jun', time: '13:00 p.m.' },
      { label: 'Dispatched', done: true, date: '18 Jun', time: '13:30 p.m.' },
      { label: 'Received',   done: true, date: '18 Jun', time: '14:00 p.m.' },
    ],
  },
  TID0000125: {
    id: 'TID0000125',
    from: 'Kandy Warehouse',
    to: 'Galle Branch',
    product: 'A4 Printing Paper × 20',
    steps: [
      { label: 'Requested',  done: true,  date: '19 Jun', time: '17:30 p.m.' },
      { label: 'Approved',   done: false, date: null,     time: 'Pending'     },
      { label: 'Dispatched', done: false, date: null,     time: 'Pending'     },
      { label: 'Received',   done: false, date: null,     time: 'Pending'     },
    ],
  },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['All Categories', 'Electronics', 'Clothing', 'Groceries', 'Beverages', 'Household', 'Personal Care', 'Stationery'];
const WAREHOUSES = ['All Warehouses', 'Colombo Branch', 'Kandy Branch', 'Galle Branch', 'Main Warehouse', 'Colombo Warehouse', 'Kandy Warehouse', 'Galle Warehouse'];
const TYPES      = ['All Types', 'Received', 'Transfer In', 'Transfer Out', 'Adjustment', 'Return'];

// ─── Type config ──────────────────────────────────────────────────────────────

const TYPE_CFG = {
  'Received':     { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: ArrowDownToLine  },
  'Transfer In':  { color: 'bg-blue-100    text-blue-700    border-blue-200',    Icon: ArrowDownToLine  },
  'Transfer Out': { color: 'bg-orange-100  text-orange-700  border-orange-200',  Icon: ArrowUpFromLine  },
  'Adjustment':   { color: 'bg-violet-100  text-violet-700  border-violet-200',  Icon: SlidersHorizontal},
  'Return':       { color: 'bg-amber-100   text-amber-700   border-amber-200',   Icon: Undo2            },
};

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG = {
  'Completed': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  'Approved':  { color: 'bg-blue-100    text-blue-700    border-blue-200',    Icon: CheckCircle2 },
  'Pending':   { color: 'bg-amber-100   text-amber-700   border-amber-200',   Icon: Clock        },
  'Rejected':  { color: 'bg-red-100     text-red-700     border-red-200',     Icon: Ban          },
};

// ─── KPI data derived from MOCK_MOVEMENTS ─────────────────────────────────────

function buildKpis(movements) {
  const received    = movements.filter(m => m.type === 'Received').reduce((s, m) => s + m.qty, 0);
  const transferred = movements.filter(m => m.type === 'Transfer Out').reduce((s, m) => s + Math.abs(m.qty), 0);
  const adjusted    = movements.filter(m => m.type === 'Adjustment').length;
  return [
    { label: 'Total Movements', value: movements.length, sub: 'Transactions',  Icon: ArrowLeftRight,    iconCls: 'text-blue-600',    bgCls: 'bg-blue-50'    },
    { label: 'Stock Received',  value: received,          sub: 'Units',         Icon: PackagePlus,       iconCls: 'text-emerald-600', bgCls: 'bg-emerald-50' },
    { label: 'Transferred',     value: transferred,       sub: 'Units',         Icon: Shuffle,           iconCls: 'text-violet-600',  bgCls: 'bg-violet-50'  },
    { label: 'Adjustments',     value: adjusted,          sub: 'Transactions',  Icon: SlidersHorizontal, iconCls: 'text-orange-600',  bgCls: 'bg-orange-50'  },
  ];
}

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

function TypeBadge({ type }) {
  const cfg = TYPE_CFG[type];
  if (!cfg) return <span className="text-xs text-slate-500">{type}</span>;
  const Icon = cfg.Icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border', cfg.color)}>
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
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border', cfg.color)}>
      <Icon size={9} />
      {status}
    </span>
  );
}

// ─── Date + time sorter ───────────────────────────────────────────────────────

function parseDatetime(date, time) {
  // date: '19 Jun 2026'  time: '10:30 a.m.' | '14:00 p.m.'
  const t = time.replace(' a.m.', ' AM').replace(' p.m.', ' PM');
  return new Date(`${date} ${t}`);
}

// Recent activity card (bottom-left section)
function ActivityCard({ item }) {
  const cfg  = TYPE_CFG[item.type] || {};
  const Icon = cfg.Icon || Package;
  const isPositive = item.qty > 0;

  const LABELS = {
    'Received':     'Stock Received',
    'Transfer In':  'Transfer In',
    'Transfer Out': 'Transfer Out',
    'Adjustment':   'Inventory Adjustment',
    'Return':       'Stock Return',
  };
  const label = LABELS[item.type] || item.type;

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors">
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5', cfg.color || 'bg-slate-100 text-slate-500')}>
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-semibold text-slate-700 truncate">{label}</span>
          <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">{item.date.replace(' 2026', '')}, {item.time}</span>
        </div>
        <p className={cn('text-xs font-bold mt-0.5 truncate', isPositive ? 'text-emerald-600' : 'text-red-600')}>
          {isPositive ? '+' : ''}{item.qty} · {item.product}
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-[10px] font-mono text-slate-400">{item.sku}</p>
          <StatusBadge status={item.status} />
        </div>
      </div>
    </div>
  );
}

// Inter-branch transfer stepper (bottom-right section)
function TransferTracker({ tracker }) {
  const doneCount   = tracker.steps.filter(s => s.done).length;
  const currentIdx  = tracker.steps.findIndex(s => !s.done); // first pending step = "in progress"
  const isComplete  = doneCount === tracker.steps.length;

  return (
    <div className="flex flex-col gap-3">
      {/* Transfer ID + product */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-mono font-semibold text-blue-600">{tracker.id}</p>
          <p className="text-xs text-slate-600 font-semibold mt-0.5">{tracker.product}</p>
        </div>
        <span className={cn(
          'text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0',
          isComplete
            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
            : 'bg-amber-100 text-amber-700 border-amber-200'
        )}>
          {isComplete ? 'Completed' : `${doneCount}/${tracker.steps.length} steps`}
        </span>
      </div>

      {/* From → To */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg min-w-0 flex-1">
          <Building2 size={11} className="text-blue-500 shrink-0" />
          <span className="font-semibold text-slate-700 truncate">{tracker.from}</span>
        </div>
        <div className="shrink-0 border-t-2 border-dashed border-slate-300 w-5 relative">
          <Shuffle size={10} className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 bg-white" />
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg min-w-0 flex-1 justify-end">
          <Building2 size={11} className="text-violet-500 shrink-0" />
          <span className="font-semibold text-slate-700 truncate">{tracker.to}</span>
        </div>
      </div>

      {/* Steps */}
      <div>
        {tracker.steps.map((step, i) => {
          const isLast    = i === tracker.steps.length - 1;
          const isCurrent = i === currentIdx; // next step = "in progress"
          return (
            <div key={step.label} className="flex gap-3">
              {/* Dot + connector line */}
              <div className="flex flex-col items-center w-5 shrink-0">
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                  step.done
                    ? 'bg-blue-600 border-blue-600'
                    : isCurrent
                      ? 'bg-white border-amber-400'
                      : 'bg-white border-slate-300'
                )}>
                  {step.done
                    ? <CheckCircle2 size={8} className="text-white" />
                    : isCurrent
                      ? <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      : null
                  }
                </div>
                {!isLast && (
                  <div
                    className={cn('w-0.5 my-0.5', step.done ? 'bg-blue-300' : 'bg-slate-200')}
                    style={{ minHeight: 22 }}
                  />
                )}
              </div>

              {/* Label + time */}
              <div className="pb-4 min-w-0">
                <p className={cn(
                  'text-xs font-semibold',
                  step.done ? 'text-slate-800' : isCurrent ? 'text-amber-700' : 'text-slate-400'
                )}>
                  {step.label}
                  {isCurrent && <span className="ml-1.5 text-[10px] font-medium text-amber-600">In Progress</span>}
                </p>
                {step.date
                  ? <p className="text-[10px] text-slate-400">{step.date}, {step.time}</p>
                  : <p className="text-[10px] text-slate-400 italic">{step.time}</p>
                }
              </div>
            </div>
          );
        })}
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

// ─── Date Range Filter chip ───────────────────────────────────────────────────

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

// ─── Action Menu (three-dot) ─────────────────────────────────────────────────

function ActionMenu({ item, onView }) {
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
            <h2 className="text-base font-bold text-slate-900">Movement Details</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{item.referenceId}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Product + badges */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-bold text-slate-800">{item.product}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{item.sku}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <TypeBadge type={item.type} />
              <StatusBadge status={item.status} />
            </div>
          </div>

          {/* Source → Qty → Destination visual */}
          <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">From</p>
              <div className="flex items-center gap-1.5">
                <Building2 size={12} className="text-blue-500 shrink-0" />
                <p className="text-sm font-semibold text-slate-700 truncate">{item.source}</p>
              </div>
            </div>
            <div className="text-center shrink-0 px-2">
              <ArrowRight size={16} className="text-slate-300 mx-auto" />
              <p className={cn('text-base font-extrabold mt-0.5', isPositive ? 'text-emerald-600' : 'text-red-600')}>
                {isPositive ? '+' : ''}{item.qty}
              </p>
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">To</p>
              <div className="flex items-center justify-end gap-1.5">
                <p className="text-sm font-semibold text-slate-700 truncate">{item.destination}</p>
                <Building2 size={12} className="text-violet-500 shrink-0" />
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Category',   item.category],
              ['Staff',      item.staff],
              ['Date',       item.date],
              ['Time',       item.time],
            ].map(([label, val]) => (
              <div key={label} className="bg-slate-50 rounded-lg px-3 py-2.5">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{val}</p>
              </div>
            ))}
          </div>

          {/* Transfer ID (if transfer type) */}
          {item.transferId && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Transfer ID</p>
              <p className="mt-1 text-sm font-semibold text-blue-700 font-mono">{item.transferId}</p>
            </div>
          )}

          {/* Reason (adjustment) */}
          {item.reason && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1.5">Reason / Notes</p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2.5 leading-relaxed">{item.reason}</p>
            </div>
          )}
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function StockMovements() {
  const [search,          setSearch]          = useState('');
  const [category,        setCategory]        = useState('All Categories');
  const [warehouse,       setWarehouse]       = useState('All Warehouses');
  const [typeFilter,      setTypeFilter]      = useState('All Types');
  const [startDate,       setStartDate]       = useState('');
  const [endDate,         setEndDate]         = useState('');
  const [activeTransferId,setActiveTransferId]= useState('TID0000123');
  const [viewItem,        setViewItem]        = useState(null);

  const hasFilter = search || category !== 'All Categories' || warehouse !== 'All Warehouses' || typeFilter !== 'All Types' || startDate || endDate;

  const clearFilters = () => {
    setSearch('');
    setCategory('All Categories');
    setWarehouse('All Warehouses');
    setTypeFilter('All Types');
    setStartDate('');
    setEndDate('');
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_MOVEMENTS.filter(m => {
      const matchQ  = !q || m.product.toLowerCase().includes(q) || m.sku.toLowerCase().includes(q) || m.referenceId.toLowerCase().includes(q);
      const matchC  = category  === 'All Categories' || m.category === category;
      const matchW  = warehouse === 'All Warehouses' || m.source.includes(warehouse) || m.destination.includes(warehouse);
      const matchT  = typeFilter === 'All Types'     || m.type     === typeFilter;
      const matchD  = inDateRange(m.date, startDate, endDate);
      return matchQ && matchC && matchW && matchT && matchD;
    });
  }, [search, category, warehouse, typeFilter, startDate, endDate]);

  const kpis         = useMemo(() => buildKpis(filtered), [filtered]);
  const recentItems  = useMemo(() => (
    [...MOCK_MOVEMENTS]
      .sort((a, b) => parseDatetime(b.date, b.time) - parseDatetime(a.date, a.time))
      .slice(0, 4)
  ), []);

  return (
    <div className="space-y-5 fade-up">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <PageHeader
        title="Stock Movements"
        description="Track all inventory transactions — receipts, transfers, adjustments, and returns."
      />

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => {
          const Icon = k.Icon;
          return (
            <div key={k.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4 flex items-center gap-4">
              <div className={cn('w-11 h-11 rounded-full flex items-center justify-center shrink-0', k.bgCls)}>
                <Icon size={20} className={k.iconCls} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{k.label}</p>
                <p className="text-2xl font-extrabold text-slate-900 leading-tight">{k.value}</p>
                <p className="text-xs text-slate-400">{k.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search SKU, products, reference..."
            className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 transition-colors"
          />
        </div>

        <FilterSelect value={category}   onChange={setCategory}   options={CATEGORIES} />
        <FilterSelect value={warehouse}  onChange={setWarehouse}  options={WAREHOUSES} />
        <FilterSelect value={typeFilter} onChange={setTypeFilter} options={TYPES}      />

        <DateRangeFilter startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e); }} />

        {hasFilter ? (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
          >
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
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {['SKU / Ref', 'Product', 'Category', 'Type', 'Qty', 'Source', 'Destination', 'Staff', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-14 text-center text-slate-400">
                  No movements match the current filters.
                </td>
              </tr>
            ) : filtered.map(m => (
              <tr
                key={m.id}
                onClick={m.transferId ? () => setActiveTransferId(m.transferId) : undefined}
                className={cn(
                  'transition-colors',
                  m.transferId
                    ? 'cursor-pointer hover:bg-blue-50/60'
                    : 'hover:bg-slate-50/70',
                  m.transferId === activeTransferId && m.transferId
                    ? 'bg-blue-50 border-l-2 border-l-blue-500'
                    : ''
                )}
              >
                {/* SKU + Ref ID */}
                <td className="px-4 py-3">
                  <p className="text-xs font-mono font-semibold text-slate-700">{m.sku}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">{m.referenceId}</p>
                </td>

                {/* Product */}
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">{m.product}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{m.date}, {m.time}</p>
                </td>

                {/* Category */}
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">{m.category}</span>
                </td>

                {/* Type + reason tooltip for Adjustment */}
                <td className="px-4 py-3">
                  <TypeBadge type={m.type} />
                  {/* SRS REQ-INV-004: reason mandatory for adjustments */}
                  {m.reason && (
                    <p className="text-[10px] text-slate-400 italic mt-1 max-w-[130px] leading-tight" title={m.reason}>
                      {m.reason.length > 38 ? m.reason.slice(0, 38) + '…' : m.reason}
                    </p>
                  )}
                </td>

                {/* Qty */}
                <td className="px-4 py-3">
                  <span className={cn(
                    'text-sm font-bold tabular-nums',
                    m.qty > 0 ? 'text-emerald-600' : 'text-red-600'
                  )}>
                    {m.qty > 0 ? '+' : ''}{m.qty}
                  </span>
                </td>

                {/* Source */}
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">{m.source}</span>
                </td>

                {/* Destination */}
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">{m.destination}</span>
                </td>

                {/* Staff — audit trail (REQ-INV-005) */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                      {m.staff[0]}
                    </div>
                    <span className="text-sm text-slate-700">{m.staff}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <StatusBadge status={m.status} />
                </td>

                {/* Actions */}
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <ActionMenu item={m} onView={setViewItem} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-100 text-xs text-slate-400">
            Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-600">{MOCK_MOVEMENTS.length}</span> movements
          </div>
        )}
      </div>

      {/* ── Bottom row: Recent Activities + Transfer Tracker ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800">Recent Activities</h3>
            <span className="text-[11px] text-blue-500 font-semibold">4 most recent</span>
          </div>
          <div className="space-y-1">
            {recentItems.map(item => (
              <ActivityCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Inter Branch Transfer Tracker */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-4">
          {/* Header */}
          <div>
            <h3 className="text-sm font-bold text-slate-800">Inter Branch Transfer Tracker</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Click a Transfer row in the table above to switch</p>
          </div>

          {/* Quick-switch chips */}
          <div className="flex flex-wrap gap-1.5">
            {Object.values(TRACKERS).map(t => {
              const isComplete = t.steps.every(s => s.done);
              const isActive   = t.id === activeTransferId;
              const doneCount  = t.steps.filter(s => s.done).length;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTransferId(t.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                  )}
                >
                  {t.id}
                  <span className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0',
                    isComplete ? 'bg-emerald-400' : doneCount === 0 ? 'bg-slate-300' : 'bg-amber-400'
                  )} />
                </button>
              );
            })}
          </div>

          {/* Tracker detail */}
          {TRACKERS[activeTransferId]
            ? <TransferTracker tracker={TRACKERS[activeTransferId]} />
            : (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Info size={20} className="text-slate-300" />
                <p className="text-sm text-slate-400 text-center">
                  Click a <span className="font-semibold text-slate-600">Transfer In / Out</span> row to track its progress.
                </p>
              </div>
            )
          }
        </div>
      </div>

      {/* View Details Modal */}
      {viewItem && <ViewModal item={viewItem} onClose={() => setViewItem(null)} />}
    </div>
  );
}
