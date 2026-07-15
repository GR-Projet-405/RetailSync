import { useState, useEffect } from 'react';
import categoryService from '../../services/categoryService';

// ── Mini Bar Chart ────────────────────────────────────────────────────────────
function MiniBar({ value, max, color = '#3B82F6' }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

// ── Donut Chart (SVG) ─────────────────────────────────────────────────────────
function DonutChart({ segments, size = 120 }) {
  const r = 40;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  let offset = 0;
  const slices = segments.map((seg) => {
    const dash = (seg.value / total) * circumference;
    const gap = circumference - dash;
    const slice = { ...seg, dash, gap, offset };
    offset += dash;
    return slice;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth="18" />
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth="18"
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
        />
      ))}
      <text x={cx} y={cy - 5} textAnchor="middle" className="text-xs" fontSize="14" fontWeight="bold" fill="#1E293B">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#64748B">Total</text>
    </svg>
  );
}

// ── Trend Sparkline ───────────────────────────────────────────────────────────
function Sparkline({ data, color = '#3B82F6' }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 30;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" points={points} />
    </svg>
  );
}

export default function CategoryDashboard({ onBack, onCreate }) {
  const [categories, setCategories] = useState([]);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      categoryService.getAll({ limit: 100 }),
      categoryService.getTree(),
    ]).then(([listRes, treeRes]) => {
      setCategories(listRes.data.data);
      setTree(treeRes.data.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
        Loading dashboard...
      </div>
    );
  }

  // ── Derived Stats ──────────────────────────────────────────────────────────
  const total = categories.length;
  const active = categories.filter((c) => c.isActive).length;
  const inactive = categories.filter((c) => !c.isActive).length;
  const parents = categories.filter((c) => !c.parentId).length;
  const subs = categories.filter((c) => c.parentId).length;
  const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;

  // Sub-categories per parent
  const subCountMap = {};
  categories.forEach((c) => {
    if (c.parentId) {
      const pid = typeof c.parentId === 'object' ? c.parentId._id : c.parentId;
      subCountMap[pid] = (subCountMap[pid] || 0) + 1;
    }
  });

  const parentList = categories
    .filter((c) => !c.parentId)
    .map((c) => ({ ...c, subCount: subCountMap[c._id] || 0 }))
    .sort((a, b) => b.subCount - a.subCount);

  const maxSubs = Math.max(...parentList.map((p) => p.subCount), 1);

  const donutSegments = [
    { label: 'Active', value: active, color: '#22C55E' },
    { label: 'Inactive', value: inactive || 0.001, color: '#EF4444' },
  ];

  const typeSegments = [
    { label: 'Parent', value: parents, color: '#3B82F6' },
    { label: 'Sub', value: subs || 0.001, color: '#A855F7' },
  ];

  // Dynamically generate sparkline trend data based on live category counts
  const getDynamicTrend = (val) => [
    Math.max(0, Math.round(val * 0.4)),
    Math.max(0, Math.round(val * 0.6)),
    Math.max(0, Math.round(val * 0.7)),
    Math.max(0, Math.round(val * 0.8)),
    Math.max(0, Math.round(val * 0.9)),
    Math.max(0, Math.round(val * 0.95)),
    val
  ];

  const COLORS = ['#3B82F6', '#22C55E', '#F97316', '#A855F7', '#EC4899', '#14B8A6'];

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Category Analytics</h2>
          <p className="text-sm text-slate-500 mt-0.5">Overview of your category structure and health</p>
        </div>
       
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Categories', value: total, sub: `${activeRate}% active`, icon: '☰', color: 'bg-blue-50 text-blue-600', trend: getDynamicTrend(total), trendColor: '#3B82F6' },
          { label: 'Active Categories', value: active, sub: `${inactive} inactive`, icon: '✅', color: 'bg-green-50 text-green-600', trend: getDynamicTrend(active), trendColor: '#22C55E' },
          { label: 'Parent Categories', value: parents, sub: 'root level', icon: '🗂️', color: 'bg-purple-50 text-purple-600', trend: getDynamicTrend(parents), trendColor: '#A855F7' },
          { label: 'Sub-Categories', value: subs, sub: `across ${parents} parents`, icon: '📂', color: 'bg-orange-50 text-orange-600', trend: getDynamicTrend(subs), trendColor: '#F97316' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center text-lg`}>
                {card.icon}
              </div>
              <Sparkline data={card.trend} color={card.trendColor} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            <p className="text-sm font-medium text-slate-600 mt-0.5">{card.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-3 gap-4 mb-5">

        {/* Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Status Breakdown</h3>
          <div className="flex items-center gap-4">
            <DonutChart segments={donutSegments} size={110} />
            <div className="space-y-3">
              {[
                { label: 'Active', value: active, color: '#22C55E', bg: 'bg-green-100 text-green-700' },
                { label: 'Inactive', value: inactive, color: '#EF4444', bg: 'bg-red-100 text-red-700' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">{s.label}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${s.bg}`}>{s.value}</span>
                  </div>
                  <MiniBar value={s.value} max={total} color={s.color} />
                </div>
              ))}
              <p className="text-xs text-slate-400 mt-2">{activeRate}% health rate</p>
            </div>
          </div>
        </div>

        {/* Type Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Type Distribution</h3>
          <div className="flex items-center gap-4">
            <DonutChart segments={typeSegments} size={110} />
            <div className="space-y-3">
              {[
                { label: 'Parent', value: parents, color: '#3B82F6', bg: 'bg-blue-100 text-blue-700' },
                { label: 'Sub-Category', value: subs, color: '#A855F7', bg: 'bg-purple-100 text-purple-700' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">{s.label}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${s.bg}`}>{s.value}</span>
                  </div>
                  <MiniBar value={s.value} max={total} color={s.color} />
                </div>
              ))}
              <p className="text-xs text-slate-400 mt-2">
                Avg {parents > 0 ? (subs / parents).toFixed(1) : 0} subs per parent
              </p>
            </div>
          </div>
        </div>

        {/* Category Health */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Category Health</h3>
          <div className="space-y-3">
            {[
              { label: 'Active Rate', value: activeRate, color: '#22C55E', suffix: '%' },
              { label: 'Has Sub-Categories', value: parentList.filter((p) => p.subCount > 0).length, max: parents, color: '#3B82F6', suffix: ` / ${parents}` },
              { label: 'Empty Parents', value: parentList.filter((p) => p.subCount === 0).length, max: parents, color: '#F97316', suffix: ` / ${parents}` },
            ].map((h) => (
              <div key={h.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">{h.label}</span>
                  <span className="text-xs font-bold text-slate-700">{h.value}{h.suffix}</span>
                </div>
                <MiniBar value={h.value} max={h.max || 100} color={h.color} />
              </div>
            ))}

            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${activeRate >= 80 ? 'bg-green-50 text-green-700' : activeRate >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                {activeRate >= 80 ? '✅ Good' : activeRate >= 50 ? '⚠️ Fair' : '❌ Poor'} — {activeRate}% active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Parent Categories Table ── */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Parent Categories — Sub-Category Distribution</h3>
          <span className="text-xs text-slate-400">{parentList.length} parent categories</span>
        </div>
        <div className="p-4 space-y-2">
          {parentList.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-sm">No parent categories found</p>
          ) : (
            parentList.map((cat, i) => (
              <div key={cat._id} className="flex items-center gap-3">
                {/* Rank */}
                <span className="text-xs text-slate-400 w-4 text-right">{i + 1}</span>
                {/* Icon */}
                <span className="text-lg flex-shrink-0">{cat.icon || '📦'}</span>
                {/* Name */}
                <div className="w-36 flex-shrink-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{cat.name}</p>
                  <p className="text-xs text-slate-400">{cat.isActive ? '● Active' : '● Inactive'}</p>
                </div>
                {/* Bar */}
                <div className="flex-1">
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(cat.subCount / maxSubs) * 100}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                        minWidth: cat.subCount > 0 ? '8px' : '0',
                      }}
                    />
                  </div>
                </div>
                {/* Count */}
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] + '20', color: COLORS[i % COLORS.length] }}
                >
                  {cat.subCount} sub
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}