import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, ChevronDown, ArrowUpRight,
  ShoppingCart, FileCheck2, ArrowLeftRight, SlidersHorizontal,
  Package, ExternalLink,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ─── Mock data ─────────────────────────────────────────────────────────────────

const BRANCHES = ['Colombo', 'Kandy', 'Galle'];

// Per-branch KPI snapshots — swapped in when user selects a branch
const BRANCH_KPIS = {
  'All Branches': [
    { label: 'Total Inventory Value', value: 'LKR 900,000.00', trend: 5.5, up: true,  badWhenUp: false },
    { label: 'Total SKUs',            value: '4,218',           trend: 2.2, up: true,  badWhenUp: false },
    { label: 'Low Stock Items',       value: '54',              trend: 2.0, up: true,  badWhenUp: true  },
    { label: 'Out of Stock Items',    value: '12',              trend: 0.1, up: true,  badWhenUp: true  },
    { label: 'Stock Turnover',        value: '3.32',            trend: 1.2, up: true,  badWhenUp: false },
  ],
  'Colombo': [
    { label: 'Total Inventory Value', value: 'LKR 420,000.00', trend: 6.1, up: true,  badWhenUp: false },
    { label: 'Total SKUs',            value: '1,980',           trend: 1.8, up: true,  badWhenUp: false },
    { label: 'Low Stock Items',       value: '22',              trend: 3.1, up: true,  badWhenUp: true  },
    { label: 'Out of Stock Items',    value: '5',               trend: 0.5, up: false, badWhenUp: true  },
    { label: 'Stock Turnover',        value: '3.85',            trend: 2.1, up: true,  badWhenUp: false },
  ],
  'Kandy': [
    { label: 'Total Inventory Value', value: 'LKR 290,000.00', trend: 3.4, up: true,  badWhenUp: false },
    { label: 'Total SKUs',            value: '1,340',           trend: 2.5, up: true,  badWhenUp: false },
    { label: 'Low Stock Items',       value: '18',              trend: 1.5, up: true,  badWhenUp: true  },
    { label: 'Out of Stock Items',    value: '4',               trend: 1.0, up: true,  badWhenUp: true  },
    { label: 'Stock Turnover',        value: '3.10',            trend: 0.8, up: false, badWhenUp: false },
  ],
  'Galle': [
    { label: 'Total Inventory Value', value: 'LKR 190,000.00', trend: 7.2, up: true,  badWhenUp: false },
    { label: 'Total SKUs',            value: '898',             trend: 3.0, up: true,  badWhenUp: false },
    { label: 'Low Stock Items',       value: '14',              trend: 0.5, up: false, badWhenUp: true  },
    { label: 'Out of Stock Items',    value: '3',               trend: 2.0, up: false, badWhenUp: true  },
    { label: 'Stock Turnover',        value: '2.80',            trend: 1.5, up: true,  badWhenUp: false },
  ],
};

const STOCK_CATEGORIES = [
  { name: 'Groceries',          value: 25, color: '#22C55E' },
  { name: 'Beverages',          value: 18, color: '#14B8A6' },
  { name: 'Electronics',        value: 20, color: '#8B5CF6' },
  { name: 'Household Items',    value: 12, color: '#F97316' },
  { name: 'Clothing & Fashion', value: 10, color: '#3B82F6' },
  { name: 'Personal Care',      value:  8, color: '#EC4899' },
  { name: 'Stationery',         value:  7, color: '#F59E0B' },
];

const RECENT_MOVEMENTS = [
  { id: 'INV-ELE-001', type: 'Sale',             branch: 'Colombo', date: '27 Jun 2026, 09:15 a.m.', Icon: ShoppingCart,      colorClass: 'bg-emerald-100 text-emerald-600' },
  { id: 'INV-GRO-002', type: 'Purchase Receipt', branch: 'Kandy',   date: '27 Jun 2026, 10:35 a.m.', Icon: FileCheck2,        colorClass: 'bg-blue-100 text-blue-600'       },
  { id: 'INV-CLO-003', type: 'Stock Transfer',   branch: 'Galle',   date: '26 Jun 2026, 11:30 a.m.', Icon: ArrowLeftRight,    colorClass: 'bg-violet-100 text-violet-600'   },
  { id: 'INV-BEV-004', type: 'Adjustment',       branch: 'Colombo', date: '26 Jun 2026, 03:45 p.m.', Icon: SlidersHorizontal, colorClass: 'bg-amber-100 text-amber-600'     },
];

// Feb–Jun = actual data, Jul–Sep = forecast
const FORECAST_DATA = [
  { month: 'Feb', actual: 10.2, forecast: 9.8  },
  { month: 'Mar', actual: 11.8, forecast: 11.2 },
  { month: 'Apr', actual: 12.5, forecast: 12.0 },
  { month: 'May', actual: 13.1, forecast: 12.5 },
  { month: 'Jun', actual: 12.8, forecast: 13.0 },
  { month: 'Jul', actual: null, forecast: 13.8 },
  { month: 'Aug', actual: null, forecast: 13.2 },
  { month: 'Sep', actual: null, forecast: 14.1 },
];

// ─── SVG Donut Chart ─────────────────────────────────────────────────────────

function DonutChart({ categories }) {
  const [hovered, setHovered] = useState(null);
  const cx = 100, cy = 100, R = 78, r = 50;
  const total = categories.reduce((s, c) => s + c.value, 0);

  const slices = useMemo(() => {
    let angle = -Math.PI / 2;
    return categories.map(cat => {
      const f = cat.value / total;
      const gap = 0.03;
      const s = angle + gap;
      const e = angle + f * 2 * Math.PI - gap;
      angle += f * 2 * Math.PI;
      const large = (e - s) > Math.PI ? 1 : 0;
      const cos = Math.cos, sin = Math.sin;
      const d = [
        `M${(cx + R * cos(s)).toFixed(2)},${(cy + R * sin(s)).toFixed(2)}`,
        `A${R},${R},0,${large},1,${(cx + R * cos(e)).toFixed(2)},${(cy + R * sin(e)).toFixed(2)}`,
        `L${(cx + r * cos(e)).toFixed(2)},${(cy + r * sin(e)).toFixed(2)}`,
        `A${r},${r},0,${large},0,${(cx + r * cos(s)).toFixed(2)},${(cy + r * sin(s)).toFixed(2)}`,
        'Z',
      ].join(' ');
      return { ...cat, d, pct: (f * 100).toFixed(1) };
    });
  }, [categories, total]);

  const active = hovered != null ? slices[hovered] : null;

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {slices.map((s, i) => (
        <path
          key={i}
          d={s.d}
          fill={s.color}
          opacity={hovered === null || hovered === i ? 1 : 0.3}
          className="cursor-pointer transition-opacity duration-150"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        />
      ))}
      <text x="100" y="93" textAnchor="middle" fill="#0F172A" fontSize="13" fontWeight="700">
        {active ? `${active.pct}%` : 'Total'}
      </text>
      <text x="100" y="108" textAnchor="middle" fill="#64748B" fontSize="8.5">
        {active ? active.name : 'Stock Mix'}
      </text>
    </svg>
  );
}

// ─── SVG Line Chart (Forecast) ───────────────────────────────────────────────

function smoothPath(pts) {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`;
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const x0 = i > 0 ? pts[i - 1][0] : pts[i][0];
    const y0 = i > 0 ? pts[i - 1][1] : pts[i][1];
    const x1 = pts[i][0], y1 = pts[i][1];
    const x2 = pts[i + 1][0], y2 = pts[i + 1][1];
    const x3 = i < pts.length - 2 ? pts[i + 2][0] : pts[i + 1][0];
    const y3 = i < pts.length - 2 ? pts[i + 2][1] : pts[i + 1][1];
    const cp1x = x1 + (x2 - x0) / 5;
    const cp1y = y1 + (y2 - y0) / 5;
    const cp2x = x2 - (x3 - x1) / 5;
    const cp2y = y2 - (y3 - y1) / 5;
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)},${cp2x.toFixed(1)},${cp2y.toFixed(1)},${x2.toFixed(1)},${y2.toFixed(1)}`;
  }
  return d;
}

function ForecastLineChart({ data }) {
  const W = 370, H = 140;
  const pad = { t: 12, r: 12, b: 28, l: 46 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const minY = 8, maxY = 16;
  const xS = i => pad.l + (i / (data.length - 1)) * cW;
  const yS = v => pad.t + (1 - (v - minY) / (maxY - minY)) * cH;

  const actualPts = data
    .map((d, i) => (d.actual != null ? [xS(i), yS(d.actual)] : null))
    .filter(Boolean);
  const forecastPts = data.map((d, i) => [xS(i), yS(d.forecast)]);
  const areaBottom = pad.t + cH;

  const areaPath =
    actualPts.length > 1
      ? `${smoothPath(actualPts)} L${actualPts[actualPts.length - 1][0]},${areaBottom} L${actualPts[0][0]},${areaBottom} Z`
      : '';

  const yTicks = [9, 11, 13, 15];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id="inv-actual-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3B82F6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"    />
        </linearGradient>
      </defs>

      {/* Y-axis unit label */}
      <text
        x="8"
        y={pad.t + cH / 2}
        textAnchor="middle"
        fill="#94A3B8"
        fontSize="7"
        transform={`rotate(-90, 8, ${pad.t + cH / 2})`}
      >
        LKR M
      </text>

      {/* Y grid lines + labels */}
      {yTicks.map(v => (
        <g key={v}>
          <line x1={pad.l} y1={yS(v)} x2={W - pad.r} y2={yS(v)} stroke="#E2E8F0" strokeWidth="1" />
          <text x={pad.l - 5} y={yS(v) + 3.5} textAnchor="end" fill="#94A3B8" fontSize="7.5">{v}</text>
        </g>
      ))}

      {/* Area fill under actual line */}
      {areaPath && <path d={areaPath} fill="url(#inv-actual-grad)" />}

      {/* Forecast dashed line */}
      <path d={smoothPath(forecastPts)} fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5,3" />

      {/* Actual solid line */}
      {actualPts.length > 1 && (
        <path d={smoothPath(actualPts)} fill="none" stroke="#3B82F6" strokeWidth="2.5" />
      )}

      {/* Actual data points */}
      {actualPts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#fff" stroke="#3B82F6" strokeWidth="2" />
      ))}

      {/* X-axis month labels */}
      {data.map((d, i) => (
        <text key={i} x={xS(i)} y={H - 5} textAnchor="middle" fill="#94A3B8" fontSize="7.5">
          {d.month}
        </text>
      ))}
    </svg>
  );
}

// ─── Branch Dropdown ─────────────────────────────────────────────────────────

function BranchDropdown({ activeBranch, onChange }) {
  const [open, setOpen] = useState(false);
  const options = ['All Branches', ...BRANCHES];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-400 transition-colors"
      >
        {activeBranch}
        <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 fade-in overflow-hidden">
            {options.map(b => (
              <button
                key={b}
                onClick={() => { onChange(b); setOpen(false); }}
                className={cn(
                  'w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 hover:text-blue-700',
                  b === activeBranch ? 'text-blue-700 font-semibold bg-blue-50' : 'text-slate-700'
                )}
              >
                {b}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KPICard({ label, value, trend, up, badWhenUp, onClick, linkLabel }) {
  const isBad = (up && badWhenUp) || (!up && !badWhenUp);
  const trendColor = isBad ? 'text-red-500' : 'text-emerald-600';
  const Icon = up ? TrendingUp : TrendingDown;

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl border p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all hover:shadow-md',
        badWhenUp && up ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-200',
        onClick && 'cursor-pointer hover:border-blue-300 hover:-translate-y-0.5'
      )}
    >
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 leading-tight">{label}</p>
      <p className="text-[18px] font-bold text-slate-900 leading-snug mb-2">{value}</p>
      <div className="flex items-center justify-between">
        <div className={cn('flex items-center gap-1 text-xs font-semibold', trendColor)}>
          <Icon size={13} />
          <span>{trend}% vs last week</span>
        </div>
        {onClick && linkLabel && (
          <span className="text-[10px] text-blue-500 font-semibold flex items-center gap-0.5 hover:underline">
            {linkLabel} <ExternalLink size={9} />
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main Inventory Dashboard ─────────────────────────────────────────────────

export default function InventoryDashboard() {
  const navigate = useNavigate();
  const [activeBranch, setActiveBranch] = useState('All Branches');

  const kpiData = BRANCH_KPIS[activeBranch];
  const visibleMovements = activeBranch === 'All Branches'
    ? RECENT_MOVEMENTS
    : RECENT_MOVEMENTS.filter(m => m.branch === activeBranch);

  return (
    <div className="space-y-5 fade-up">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <span>Inventory</span>
            <span className="text-slate-300">/</span>
            <span className="text-blue-600 font-semibold">Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Dashboard</h1>
        </div>
        <BranchDropdown activeBranch={activeBranch} onChange={setActiveBranch} />
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {kpiData.map((kpi, i) => (
          <KPICard
            key={i}
            {...kpi}
            onClick={
              kpi.label === 'Low Stock Items'       ? () => navigate('/low-stock-alerts') :
              kpi.label === 'Out of Stock Items'    ? () => navigate('/low-stock-alerts') :
              kpi.label === 'Total Inventory Value' ? () => navigate('/stock-levels')     :
              kpi.label === 'Total SKUs'            ? () => navigate('/stock-levels')     :
              undefined
            }
            linkLabel={
              kpi.label === 'Low Stock Items' || kpi.label === 'Out of Stock Items'
                ? 'View alerts'
                : kpi.label === 'Total Inventory Value' || kpi.label === 'Total SKUs'
                ? 'View levels'
                : undefined
            }
          />
        ))}
      </div>

      {/* ── Middle row: Stock Overview + Recent Movements ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Stock Overview */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Stock Overview</h2>
            <span className="px-3 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 rounded-full">This Week</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-44 h-44 shrink-0">
              <DonutChart categories={STOCK_CATEGORIES} />
            </div>
            <div className="flex flex-col gap-2.5 flex-1 w-full">
              {STOCK_CATEGORIES.map(cat => (
                <div key={cat.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-slate-600 flex-1">{cat.name}</span>
                  <span className="text-xs font-bold text-slate-700">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Movements */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Recent Movements</h2>
            <button
              onClick={() => navigate('/stock-movements')}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-0.5"
            >
              View All <ArrowUpRight size={11} />
            </button>
          </div>

          {visibleMovements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <Package size={28} className="mb-2 opacity-40" />
              <p className="text-xs font-medium">No recent movements for {activeBranch}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {visibleMovements.map(({ id, type, branch, date, Icon, colorClass }) => (
                <div
                  key={id}
                  onClick={() => navigate('/stock-movements')}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', colorClass)}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{type}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{id} · {branch}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 shrink-0 text-right leading-tight">{date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom row: Forecast Chart + AI Product Card ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Inventory Value Forecast */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Inventory Value Forecast</h2>
            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-5 h-[2px] bg-blue-500 rounded" />
                Actual
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block w-5"
                  style={{ borderTop: '2px dashed #94A3B8' }}
                />
                Forecast
              </span>
            </div>
          </div>
          <div className="h-36">
            <ForecastLineChart data={FORECAST_DATA} />
          </div>
        </div>

        {/* Top Forecasted Product */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5 flex flex-col">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Top Forecasted Product</h2>

          <div className="flex gap-4 mb-5">
            <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              <Package size={28} className="text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900 leading-tight">Lenovo IdeaPad Slim 3</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">Expected Demand</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <TrendingUp size={20} className="text-emerald-500" />
                <span className="text-[26px] font-bold text-emerald-600 leading-none">18%</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Recommended Reorder</p>
            <p className="text-xl font-bold text-blue-700">250 Units</p>
          </div>

          <button
            onClick={() => navigate('/stock-levels')}
            className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold transition-colors shadow-sm shadow-blue-200"
          >
            View Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
