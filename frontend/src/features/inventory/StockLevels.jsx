import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, X, CheckCircle2, AlertTriangle, XCircle,
  Package, Truck, Building2, Tag, CalendarDays, FileText,
  ChevronDown, Settings, AlertCircle, MoreVertical, Eye, Calendar, Loader2,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { cn } from '../../utils/cn';
import { toast } from '../../utils/toast';
import { useStockLevels, useUpdateReorderLevel } from '../../hooks/useInventory';

// ─── Mock data 
const MOCK_STOCK = [
  { id:  1, sku: 'SKU-ELE-000123', product: 'Samsung Galaxy S24 128GB',      category: 'Electronics',     warehouse: 'Colombo', currentStock:  50, reservedStock: 10, reorderLevel: 100, supplier: 'Samsung Lanka (Pvt) Ltd',    lastPurchase: '15 March 2026',  image: null },
  { id:  2, sku: 'SKU-ELE-000124', product: 'Lenovo IdeaPad Slim 3',          category: 'Electronics',     warehouse: 'Kandy',   currentStock:  20, reservedStock:  5, reorderLevel:  10, supplier: 'Lenovo Lanka Distributors',   lastPurchase: '02 April 2026',  image: null },
  { id:  3, sku: 'SKU-ELE-000125', product: 'HP LaserJet Printer M110w',      category: 'Electronics',     warehouse: 'Colombo', currentStock:   0, reservedStock:  0, reorderLevel:   5, supplier: 'HP Ceylon Ltd',               lastPurchase: '10 Jan 2026',    image: null },
  { id:  4, sku: 'SKU-CLO-000400', product: "Women's Denim Jeans",            category: 'Clothing',        warehouse: 'Galle',   currentStock: 260, reservedStock: 10, reorderLevel: 100, supplier: 'Fashion Hub (Pvt) Ltd',       lastPurchase: '10 April 2026',  image: null },
  { id:  5, sku: 'SKU-CLO-000401', product: "Men's Cotton T-Shirt (M)",       category: 'Clothing',        warehouse: 'Colombo', currentStock:  80, reservedStock: 20, reorderLevel:  50, supplier: 'Fashion Hub (Pvt) Ltd',       lastPurchase: '18 March 2026',  image: null },
  { id:  6, sku: 'SKU-CLO-000402', product: "Kids' School Uniform Set",        category: 'Clothing',        warehouse: 'Kandy',   currentStock:   6, reservedStock:  0, reorderLevel:  20, supplier: 'KidZone Apparel Ltd',         lastPurchase: '05 Feb 2026',    image: null },
  { id:  7, sku: 'SKU-GRO-000200', product: 'Basmati Rice 5kg',               category: 'Groceries',       warehouse: 'Galle',   currentStock:   0, reservedStock:  0, reorderLevel:  30, supplier: 'Cargills Food City',          lastPurchase: '25 March 2026',  image: null },
  { id:  8, sku: 'SKU-GRO-000201', product: 'Sunflower Cooking Oil 1L',       category: 'Groceries',       warehouse: 'Colombo', currentStock:  18, reservedStock:  6, reorderLevel:  20, supplier: 'Sunrich Lanka (Pvt) Ltd',     lastPurchase: '01 April 2026',  image: null },
  { id:  9, sku: 'SKU-GRO-000202', product: 'Full Cream Milk 1L',             category: 'Groceries',       warehouse: 'Kandy',   currentStock: 120, reservedStock: 10, reorderLevel:  40, supplier: 'Anchor Dairy Lanka',          lastPurchase: '12 April 2026',  image: null },
  { id: 10, sku: 'SKU-BEV-000300', product: 'Coca-Cola 1.5L',                 category: 'Beverages',       warehouse: 'Colombo', currentStock: 200, reservedStock: 30, reorderLevel:  50, supplier: 'Coca-Cola Beverages Lanka',   lastPurchase: '08 April 2026',  image: null },
  { id: 11, sku: 'SKU-BEV-000301', product: 'Red Bull Energy Drink 250ml',    category: 'Beverages',       warehouse: 'Galle',   currentStock:   4, reservedStock:  0, reorderLevel:  15, supplier: 'Red Bull Lanka Dist.',        lastPurchase: '14 Feb 2026',    image: null },
  { id: 12, sku: 'SKU-BEV-000302', product: 'Mineral Water 500ml (24-pack)',  category: 'Beverages',       warehouse: 'Kandy',   currentStock:   0, reservedStock:  0, reorderLevel:  20, supplier: 'Elephant House Ltd',          lastPurchase: '22 Jan 2026',    image: null },
  { id: 13, sku: 'SKU-HH-000500',  product: 'Surf Excel Detergent 2kg',       category: 'Household Items', warehouse: 'Colombo', currentStock:  14, reservedStock:  6, reorderLevel:  15, supplier: 'Unilever Ceylon Ltd',         lastPurchase: '30 March 2026',  image: null },
  { id: 14, sku: 'SKU-HH-000501',  product: 'Colgate Toothpaste 150g',        category: 'Household Items', warehouse: 'Kandy',   currentStock:  45, reservedStock:  5, reorderLevel:  20, supplier: 'Colgate-Palmolive Lanka',     lastPurchase: '19 April 2026',  image: null },
  { id: 15, sku: 'SKU-PC-000600',  product: 'Dove Shampoo 400ml',             category: 'Personal Care',   warehouse: 'Galle',   currentStock:  30, reservedStock:  8, reorderLevel:  15, supplier: 'Unilever Ceylon Ltd',         lastPurchase: '25 April 2026',  image: null },
  { id: 16, sku: 'SKU-PC-000601',  product: 'Nivea Body Lotion 250ml',        category: 'Personal Care',   warehouse: 'Colombo', currentStock:   0, reservedStock:  0, reorderLevel:  12, supplier: 'Nivea Lanka (Pvt) Ltd',       lastPurchase: '10 March 2026',  image: null },
  { id: 17, sku: 'SKU-STA-000010', product: 'A4 Printing Paper (Ream 500)',   category: 'Stationery',      warehouse: 'Kandy',   currentStock:  15, reservedStock:  5, reorderLevel: 500, supplier: 'Kowloon Paper (pvt) ltd',     lastPurchase: '20 April 2026',  image: null },
  { id: 18, sku: 'SKU-STA-000011', product: 'Ballpoint Pen Box (50pcs)',       category: 'Stationery',      warehouse: 'Galle',   currentStock: 100, reservedStock: 20, reorderLevel:  30, supplier: 'Pilot Pens Lanka',            lastPurchase: '05 April 2026',  image: null },
];

const CATEGORIES  = ['All Categories',  'Electronics', 'Clothing', 'Groceries', 'Beverages', 'Household Items', 'Personal Care', 'Stationery'];
const WAREHOUSES  = ['All Warehouses',  'Colombo', 'Galle', 'Kandy'];
const STATUSES    = ['Stock Status',    'In Stock', 'Low Stock', 'Out of Stock'];

//  Helpers 

function availableStock(item) {
  return Math.max(0, item.currentStock - item.reservedStock);
}

function getStatus(item) {
  const avail = availableStock(item);
  if (avail <= 0) return 'out';
  if (avail < item.reorderLevel) return 'low';
  return 'in';
}

const STATUS_CFG = {
  in:  { label: 'In Stock',     variant: 'success', Icon: CheckCircle2  },
  low: { label: 'Low Stock',    variant: 'warning', Icon: AlertTriangle  },
  out: { label: 'Out of Stock', variant: 'danger',  Icon: XCircle        },
};

const STATUS_FILTER_KEY = {
  'In Stock': 'in', 'Low Stock': 'low', 'Out of Stock': 'out',
};

// Status Badge 

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.Icon;
  const colorMap = {
    in:  'bg-emerald-100 text-emerald-700 border-emerald-200',
    low: 'bg-amber-100  text-amber-700  border-amber-200',
    out: 'bg-red-100    text-red-700    border-red-200',
  };
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border',
      colorMap[status]
    )}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

//  Date helpers 

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
    : 'Last Purchase';

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
          <p className="text-xs font-semibold text-slate-700 mb-3">Filter by Last Purchase</p>
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

//  Filter Select 

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none w-full pl-3 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-blue-400 cursor-pointer"
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

//  Action Menu (three-dot) 

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

//  View Details Modal 

function ViewModal({ item, onClose }) {
  useEffect(() => {
    function handler(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const avail  = availableStock(item);
  const status = getStatus(item);
  const cfg    = STATUS_CFG[status];

  const stockPct = item.reorderLevel > 0
    ? Math.min(100, Math.round((avail / item.reorderLevel) * 100))
    : 100;

  const barColor = status === 'out' ? 'bg-red-500' : status === 'low' ? 'bg-amber-400' : 'bg-emerald-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Stock Level Details</h2>
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
            <StatusBadge status={status} />
          </div>

          {/* Stock visual */}
          <div className="bg-slate-50 rounded-xl px-4 py-4">
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-xs text-slate-400">Available Stock</p>
                <p className={cn('text-3xl font-extrabold leading-tight',
                  status === 'out' ? 'text-red-600' : status === 'low' ? 'text-amber-600' : 'text-emerald-600'
                )}>{avail}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">units</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Reorder Level</p>
                <p className="text-xl font-bold text-slate-500">{item.reorderLevel}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">threshold</p>
              </div>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${stockPct}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{stockPct}% of reorder threshold</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Current Stock',  `${item.currentStock} units`],
              ['Reserved Stock', `${item.reservedStock} units`],
              ['Warehouse',      item.warehouse],
              ['Category',       item.category],
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

        <div className="px-6 pb-5">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

//  Set Reorder Level Modal 

function SetReorderModal({ item, onClose, onSave }) {
  const [level, setLevel] = useState(String(item.reorderLevel));
  const [err,   setErr]   = useState('');

  function submit() {
    const n = parseInt(level, 10);
    if (!level || isNaN(n) || n < 1) { setErr('Enter a valid positive number'); return; }
    onSave(item.id, n);
    toast.success(`Reorder level updated to ${n} units for ${item.product}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-slate-900">Set Reorder Level</h3>
          <button onClick={onClose} className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100">
            <X size={13} />
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-0.5">{item.product}</p>
        <p className="text-[10px] font-mono text-slate-400 mb-4">{item.sku} · {item.warehouse}</p>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Reorder Level (units) <span className="text-red-500">*</span>
        </label>
        <input
          type="number" min="1" value={level}
          onChange={e => { setLevel(e.target.value); setErr(''); }}
          className={cn('w-full px-3 py-2 text-sm border rounded-lg outline-none', err ? 'border-red-300' : 'border-slate-200 focus:border-blue-400')}
          autoFocus
        />
        {err && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10}/>{err}</p>}
        <p className="text-[10px] text-slate-400 mt-1.5">Current reorder level: {item.reorderLevel} units</p>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={submit} className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
}

//  Product Detail Panel 

function ProductDetailPanel({ item, onClose, onPurchaseOrder, onSetReorder }) {
  const avail  = availableStock(item);
  const status = getStatus(item);

  return (
    <div className="w-72 shrink-0 bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgba(15,23,42,0.08)] flex flex-col overflow-hidden fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Product Details</h3>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
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
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">{item.sku}</p>
          <div className="mt-2">
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      {/* Stock breakdown */}
      <div className="px-4 py-3 space-y-2.5 border-b border-slate-100">
        <DetailRow label="Current Stock"   value={`${item.currentStock} units`}  bold />
        <DetailRow label="Reserved Stock"  value={`${item.reservedStock} units`} muted />
        <DetailRow
          label="Available Stock"
          value={`${avail} units`}
          bold
          valueColor={status === 'out' ? 'text-red-600' : status === 'low' ? 'text-amber-600' : 'text-emerald-600'}
        />
        <DetailRow label="Reorder Level"   value={`${item.reorderLevel} units`}  />
      </div>

      {/* Info fields */}
      <div className="px-4 py-3 space-y-2.5 flex-1">
        <InfoRow icon={Building2}   label="Warehouse"     value={item.warehouse}    />
        <InfoRow icon={Truck}       label="Supplier"      value={item.supplier}     />
        <InfoRow icon={Tag}         label="Category"      value={item.category}     />
        <InfoRow icon={CalendarDays} label="Last Purchase" value={item.lastPurchase} />
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 space-y-2">
        <button
          onClick={() => { onPurchaseOrder(item); }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold transition-colors shadow-sm shadow-blue-200"
        >
          <FileText size={14} />
          Create Purchase Order
        </button>
        <button
          onClick={() => onSetReorder(item)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
        >
          <Settings size={14} />
          Set Reorder Level
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
      <Icon size={13} className="text-slate-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
        <span className="text-xs text-slate-500 shrink-0">{label}</span>
        <span className="text-xs font-semibold text-slate-700 text-right leading-tight">{value}</span>
      </div>
    </div>
  );
}

// Main Component 

export default function StockLevels() {
  const navigate = useNavigate();
  const { data: slData, isLoading } = useStockLevels();
  const updateReorder = useUpdateReorderLevel();
  const stocks = slData?.items?.length ? slData.items : MOCK_STOCK;

  const [search,        setSearch]        = useState('');
  const [category,      setCategory]      = useState('All Categories');
  const [warehouse,     setWarehouse]     = useState('All Warehouses');
  const [statusFilter,  setStatusFilter]  = useState('Stock Status');
  const [selectedItem,  setSelectedItem]  = useState(null);
  const [reorderItem,   setReorderItem]   = useState(null);
  const [viewItem,      setViewItem]      = useState(null);
  const [startDate,     setStartDate]     = useState('');
  const [endDate,       setEndDate]       = useState('');

  function handleUpdateReorderLevel(id, level) {
    updateReorder.mutate({ id, reorderLevel: level });
    setSelectedItem(prev => prev?.id === id ? { ...prev, reorderLevel: level } : prev);
  }

  function handlePurchaseOrder(item) {
    toast.info(`Creating purchase order for ${item.product}…`);
    navigate('/purchase-orders');
  }

  // ── Filter logic
  const filtered = useMemo(() => {
    const sk = STATUS_FILTER_KEY[statusFilter];
    const q  = search.toLowerCase();
    return stocks.filter(item => {
      const matchSearch    = !q  || item.product.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
      const matchCategory  = category  === 'All Categories' || item.category  === category;
      const matchWarehouse = warehouse === 'All Warehouses' || item.warehouse  === warehouse;
      const matchStatus    = !sk || getStatus(item) === sk;
      const matchD         = inDateRange(item.lastPurchase, startDate, endDate);
      return matchSearch && matchCategory && matchWarehouse && matchStatus && matchD;
    });
  }, [search, category, warehouse, statusFilter, startDate, endDate]);

  const hasActiveFilter = search || category !== 'All Categories' || warehouse !== 'All Warehouses' || statusFilter !== 'Stock Status' || startDate || endDate;

  const clearFilters = () => {
    setSearch('');
    setCategory('All Categories');
    setWarehouse('All Warehouses');
    setStatusFilter('Stock Status');
    setStartDate('');
    setEndDate('');
  };

  const handleRowClick = (item) => {
    setSelectedItem(prev => prev?.id === item.id ? null : item);
  };

  return (
    <div className="space-y-5 fade-up">

      {/*  Header  */}
      <PageHeader
        title="Stock Levels"
        description="View and manage current stock levels across all locations."
      />

      {/*  Main content: table + detail panel  */}
      <div className={cn('flex gap-4 items-start transition-all duration-300')}>

        {/* Left: filters + table */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Filter bar */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
            <div className="relative flex items-center flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search SKU, products..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 transition-colors"
              />
            </div>

            {/* Category */}
            <FilterSelect value={category}     onChange={setCategory}     options={CATEGORIES} />
            {/* Warehouse */}
            <FilterSelect value={warehouse}    onChange={setWarehouse}    options={WAREHOUSES} />
            {/* Status */}
            <FilterSelect value={statusFilter} onChange={setStatusFilter} options={STATUSES}   />
            {/* Date Range */}
            <DateRangeFilter startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e); }} />

            {/* Filter / Clear button */}
            {hasActiveFilter ? (
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

          {/* Table */}
          <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {['SKU', 'Product', 'Category', 'Warehouse', 'Available', 'Reorder', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} className="px-4 py-3.5">
                          <div className="h-4 bg-slate-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-14 text-center text-slate-400">
                      No stock records match the current filters.
                    </td>
                  </tr>
                ) : filtered.map(item => {
                  const avail  = availableStock(item);
                  const status = getStatus(item);
                  const isSelected = selectedItem?.id === item.id;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className={cn(
                        'cursor-pointer transition-colors duration-100',
                        isSelected
                          ? 'bg-blue-50 border-l-2 border-l-blue-500'
                          : 'hover:bg-slate-50/70'
                      )}
                    >
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-mono font-semibold text-slate-500">{item.sku}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-semibold text-slate-800">{item.product}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-slate-600">{item.category}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-slate-600">{item.warehouse}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn(
                          'text-sm font-bold',
                          status === 'out' ? 'text-red-600'   :
                          status === 'low' ? 'text-amber-600' : 'text-slate-800'
                        )}>
                          {avail}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-slate-500">{item.reorderLevel}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <ActionMenu item={item} onView={setViewItem} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer count */}
            {filtered.length > 0 && (
              <div className="px-4 py-2.5 border-t border-slate-100 text-xs text-slate-400">
                Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-600">{stocks.length}</span> records
              </div>
            )}
          </div>
        </div>

        {/* Right: Product detail panel */}
        {selectedItem && (
          <ProductDetailPanel
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onPurchaseOrder={handlePurchaseOrder}
            onSetReorder={setReorderItem}
          />
        )}
      </div>

      {/* Set Reorder Level Modal */}
      {reorderItem && (
        <SetReorderModal
          item={reorderItem}
          onClose={() => setReorderItem(null)}
          onSave={handleUpdateReorderLevel}
        />
      )}

      {/* View Details Modal */}
      {viewItem && (
        <ViewModal item={viewItem} onClose={() => setViewItem(null)} />
      )}
    </div>
  );
}
