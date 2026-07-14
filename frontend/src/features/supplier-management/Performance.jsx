import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Download, Calendar, Star } from 'lucide-react';
import { cn } from '../../utils/cn';
import {
  PERFORMANCE_TREND, MONTHLY_SPEND, SUPPLIER_RANKING, CAPABILITY_RADAR
} from './data/mockData';
import { getSuppliers, getSupplierStats } from '../../services/supplierService';

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, iconBg, value, label, change, positive }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5 flex-1 min-w-[160px]">
    <div className="flex items-start justify-between mb-3">
      <div className={cn('p-2.5 rounded-xl', iconBg)}>
        <Icon className="w-5 h-5" />
      </div>
      <span className={cn(
        'inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full',
        positive
          ? 'bg-emerald-50 text-emerald-600'
          : 'bg-red-50 text-red-600'
      )}>
        {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {change}
      </span>
    </div>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
    <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
  </div>
);

// ─── Performance Line Chart (pure SVG) ───────────────────────────────────────
const PerformanceChart = ({ data }) => {
  const w = 600, h = 120, pad = 10;
  const months = data.map(d => d.month);
  const series = [
    { key: 'delivery', color: '#3B82F6', label: 'Delivery' },
    { key: 'quality', color: '#F59E0B', label: 'Quality' },
    { key: 'cost', color: '#6366F1', label: 'Cost Index' },
  ];

  const allVals = data.flatMap(d => [d.delivery, d.quality, d.cost]);
  const minV = Math.min(...allVals) - 2;
  const maxV = Math.max(...allVals) + 2;

  const toX = i => pad + (i / (data.length - 1)) * (w - pad * 2);
  const toY = v => h - pad - ((v - minV) / (maxV - minV)) * (h - pad * 2);

  const toPath = (key) =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(d[key])}`).join(' ');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Performance Trends</h3>
        <div className="flex items-center gap-4 text-xs">
          {series.map(s => (
            <span key={s.key} className="flex items-center gap-1.5 text-slate-500 font-medium">
              <span className="inline-block w-6 h-0.5 rounded" style={{ backgroundColor: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Y-axis ticks */}
        {[minV, (minV + maxV) / 2, maxV].map((v, i) => (
          <text key={i} x={0} y={toY(v) + 4} className="fill-slate-400" fontSize="9" fontFamily="monospace">
            {Math.round(v)}
          </text>
        ))}
        {/* Grid */}
        {data.map((_, i) => (
          <line key={i} x1={toX(i)} y1={pad} x2={toX(i)} y2={h - pad} stroke="#F1F5F9" strokeWidth="1" />
        ))}
        {/* Lines */}
        {series.map(s => (
          <path key={s.key} d={toPath(s.key)} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {/* Month labels */}
        {months.map((m, i) => (
          <text key={i} x={toX(i)} y={h} textAnchor="middle" className="fill-slate-400" fontSize="9" fontFamily="sans-serif">{m}</text>
        ))}
      </svg>
    </div>
  );
};

// ─── Monthly Spend Bar Chart (pure SVG) ──────────────────────────────────────
const SpendChart = ({ data }) => {
  const w = 500, h = 130, pad = 24, barGap = 14;
  const maxVal = Math.max(...data.map(d => d.spend));
  const barW = (w - pad * 2 - barGap * (data.length - 1)) / data.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Monthly Spend ($K)</h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Y-axis labels */}
        {[0, 350, 700, 1050, 1400].map((v, i) => (
          <text key={i} x={4} y={h - pad - ((v / maxVal) * (h - pad * 2)) + 4} className="fill-slate-400" fontSize="8" fontFamily="monospace">
            {v}
          </text>
        ))}
        {data.map((d, i) => {
          const x = pad * 2 + i * (barW + barGap);
          const barH = (d.spend / maxVal) * (h - pad * 2);
          const y = h - pad - barH;
          return (
            <g key={d.month}>
              <rect x={x} y={y} width={barW} height={barH} rx="5" fill="#3B82F6" fillOpacity="0.8" className="hover:fill-opacity-100 transition-all" />
              <text x={x + barW / 2} y={h - 4} textAnchor="middle" className="fill-slate-400" fontSize="9" fontFamily="sans-serif">{d.month}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ─── Capability Radar (pure SVG pentagon) ─────────────────────────────────────
const RadarChart = ({ data }) => {
  const cx = 120, cy = 110, r = 80;
  const labels = ['Delivery', 'Quality', 'Price', 'Support', 'Compliance'];
  const keys = ['delivery', 'quality', 'price', 'support', 'compliance'];
  const angles = labels.map((_, i) => (i * (2 * Math.PI)) / labels.length - Math.PI / 2);

  const point = (angle, val, radius = r) => ({
    x: cx + radius * (val / 100) * Math.cos(angle),
    y: cy + radius * (val / 100) * Math.sin(angle),
  });

  const gridPts = (scale) =>
    angles.map(a => `${cx + r * scale * Math.cos(a)},${cy + r * scale * Math.sin(a)}`).join(' ');

  const dataPts = angles
    .map((a, i) => point(a, data[keys[i]]))
    .map(p => `${p.x},${p.y}`)
    .join(' ');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-2">Capability Radar</h3>
      <svg viewBox="0 0 240 220" className="w-full max-w-[220px] mx-auto">
        {[0.25, 0.5, 0.75, 1].map(s => (
          <polygon key={s} points={gridPts(s)} fill="none" stroke="#E2E8F0" strokeWidth="1" />
        ))}
        {angles.map((a, i) => (
          <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="#E2E8F0" strokeWidth="1" />
        ))}
        <polygon points={dataPts} fill="#3B82F680" stroke="#3B82F6" strokeWidth="2" />
        {angles.map((a, i) => {
          const lx = cx + (r + 20) * Math.cos(a);
          const ly = cy + (r + 20) * Math.sin(a);
          return (
            <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="fill-slate-500" fontSize="9" fontFamily="sans-serif">
              {labels[i]}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

// ─── Supplier Ranking ─────────────────────────────────────────────────────────
const SupplierRanking = ({ data }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
    <h3 className="text-sm font-semibold text-slate-900 mb-4">Supplier Ranking</h3>
    <div className="space-y-3">
      {data.map(s => (
        <div key={s.rank} className="flex items-center gap-3">
          <span className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
            s.rank === 1 ? 'bg-amber-100 text-amber-700' : s.rank === 2 ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-500'
          )}>
            {s.rank}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-800 truncate">{s.name}</span>
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-500 ml-2 shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{s.rating}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${s.score}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Performance Page ──────────────────────────────────────────────────────────────────────────────────────────
const Performance = () => {
  const [quarter, setQuarter] = useState('Q2 2026');
  const [kpis, setKpis] = useState(null);
  const [ranking, setRanking] = useState(SUPPLIER_RANKING);
  const [loadingKpis, setLoadingKpis] = useState(true);

  useEffect(() => {
    const loadKpis = async () => {
      setLoadingKpis(true);
      try {
        const [statsRes, listRes] = await Promise.all([
          getSupplierStats(),
          getSuppliers({ limit: 100 }),
        ]);
        const suppliers = listRes.suppliers ?? [];
        const active = suppliers.filter(s => s.performance);
        const avg = (key) =>
          active.length > 0
            ? (active.reduce((sum, s) => sum + (s.performance?.[key] ?? 0), 0) / active.length).toFixed(1)
            : '0.0';
        setKpis({
          onTimeDelivery: avg('onTimeDelivery'),
          qualityScore: avg('qualityScore'),
          defectRate: avg('defectRate'),
          totalSpendYTD: statsRes.data?.totalSpendYTD ?? 0,
        });
        // Build live ranking from API data
        const sorted = [...suppliers]
          .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
          .slice(0, 5)
          .map((s, i) => ({
            rank: i + 1,
            name: s.name,
            rating: s.rating ?? 0,
            score: Math.round(
              ((s.performance?.onTimeDelivery ?? 0) * 0.4 +
               (s.performance?.qualityScore ?? 0) * 0.4 +
               (100 - (s.performance?.defectRate ?? 0) * 10) * 0.2)
            ),
          }));
        if (sorted.length > 0) setRanking(sorted);
      } catch {
        // silently fall back to mock data if API fails
      } finally {
        setLoadingKpis(false);
      }
    };
    loadKpis();
  }, [quarter]);

  const handleExport = () => {
    if (!ranking || ranking.length === 0) return;
    const headers = ['Rank', 'Supplier Name', 'Rating', 'Score'];
    const rows = ranking.map(s => [s.rank, s.name, s.rating, s.score]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n" 
      + rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `performance_ranking_${quarter.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fmt = (v) => v ?? '—';
  const spendLabel = kpis?.totalSpendYTD
    ? `$${(kpis.totalSpendYTD / 1_000_000).toFixed(1)}M`
    : '—';

  return (
    <div className="space-y-5 fade-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Supplier Performance</h1>
          <p className="text-sm text-slate-500 mt-0.5">Analytics and KPI tracking across all registered suppliers</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative inline-flex items-center">
            <Calendar className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 text-sm font-medium text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl transition-colors outline-none cursor-pointer"
            >
              <option value="Q1 2026">Q1 2026</option>
              <option value="Q2 2026">Q2 2026</option>
              <option value="Q3 2026">Q3 2026</option>
              <option value="Q4 2026">Q4 2026</option>
            </select>
            <span className="absolute right-3 text-slate-400 pointer-events-none text-xs">▾</span>
          </div>
          <button onClick={handleExport} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="flex gap-4 flex-wrap">
        <KpiCard
          icon={() => <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8l4-4m0 0l-4 0m4 0v4"/></svg>}
          iconBg="bg-blue-50"
          value={loadingKpis ? '—' : `${fmt(kpis?.onTimeDelivery)}%`}
          label="Avg. On-Time Delivery"
          change="live"
          positive
        />
        <KpiCard
          icon={() => <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          iconBg="bg-emerald-50"
          value={loadingKpis ? '—' : `${fmt(kpis?.qualityScore)}%`}
          label="Avg. Quality Score"
          change="live"
          positive
        />
        <KpiCard
          icon={() => <svg className="w-5 h-5 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          iconBg="bg-violet-50"
          value={loadingKpis ? '—' : spendLabel}
          label="Total Spend YTD"
          change="live"
          positive
        />
        <KpiCard
          icon={() => <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          iconBg="bg-red-50"
          value={loadingKpis ? '—' : `${fmt(kpis?.defectRate)}%`}
          label="Avg. Defect Rate"
          change="live"
          positive
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PerformanceChart data={PERFORMANCE_TREND} />
        </div>
        <RadarChart data={CAPABILITY_RADAR} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SpendChart data={MONTHLY_SPEND} />
        </div>
        <SupplierRanking data={ranking} />
      </div>
    </div>
  );
};

export default Performance;
