import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Calendar, MapPin, Download, ChevronDown, CheckCircle, 
  Percent, Sparkles, BarChart3, Users, DollarSign, Award, ShieldAlert
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Card, { CardContent } from '../../components/Card';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import StatCard from '../../components/promotions/StatCard';
import { useAuth } from '../../contexts/AuthContext';

// Inline Toast Utility
const showExportToast = () => {
  const el = document.createElement('div');
  Object.assign(el.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: '9999',
    background: '#EFF6FF',
    border: '1px solid #93C5FD',
    color: '#1E40AF',
    padding: '12px 16px',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    fontWeight: 'bold',
    fontSize: '13px',
    transition: 'opacity 200ms ease'
  });
  el.innerText = '✓ Promotional Analytics exported successfully!';
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 200);
  }, 3000);
};

export default function PromotionAnalyticsPage() {
  const { user, hasRole } = useAuth();
  const isBranchManager = hasRole('BRANCH_MANAGER');

  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('01 Jun 2026 - 14 Jun 2026');
  const [isDateOpen, setIsDateOpen] = useState(false);

  React.useEffect(() => {
    if (isBranchManager) {
      const managerBranch = user?.branchId?.name || 'Downtown Flagship';
      setSelectedBranch(managerBranch);
    }
  }, [isBranchManager, user]);
  const [isChartDropdownOpen, setIsChartDropdownOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('Last week');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [hoveredBarIdx, setHoveredBarIdx] = useState(null);
  const [hoveredRingIdx, setHoveredRingIdx] = useState(null);

  const branches = ['All Branches', 'Downtown Flagship', 'North Branch', 'South Branch'];
  
  const dates = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7days' },
    { label: '01 Jun 2026 - 14 Jun 2026', value: 'june' },
    { label: 'This Month', value: 'month' }
  ];

  // Branch statistics mapping
  const branchData = {
    'All Branches': { rev: 'RS. 125,500', orders: '1842', aov: 'Rs. 278.56', roi: '3.1x' },
    'Downtown Flagship': { rev: 'RS. 62,400', orders: '912', aov: 'Rs. 295.10', roi: '3.4x' },
    'North Branch': { rev: 'RS. 38,200', orders: '540', aov: 'Rs. 268.40', roi: '2.8x' },
    'South Branch': { rev: 'RS. 24,900', orders: '390', aov: 'Rs. 250.20', roi: '2.5x' }
  };

  const currentStats = branchData[selectedBranch] || branchData['All Branches'];

  // Bar chart dataset
  const chartDatasets = {
    'Last week': [
      { day: 'Mon', rev: 110 },
      { day: 'Tue', rev: 170 },
      { day: 'Wed', rev: 160 },
      { day: 'Thu', rev: 230 },
      { day: 'Fri', rev: 250 },
      { day: 'Sat', rev: 330 },
      { day: 'Sun', rev: 290 }
    ],
    'Last Month': [
      { day: 'Wk 1', rev: 280 },
      { day: 'Wk 2', rev: 320 },
      { day: 'Wk 3', rev: 410 },
      { day: 'Wk 4', rev: 380 }
    ],
    'This Month': [
      { day: '01-07', rev: 240 },
      { day: '08-14', rev: 310 },
      { day: '15-21', rev: 190 },
      { day: '22-28', rev: 270 }
    ]
  };

  const currentChartData = chartDatasets[chartPeriod] || chartDatasets['Last week'];

  // ROI Rankings dataset
  const roiRankings = [
    { name: 'Summer Sale', roi: '3.2x', percentage: 85 },
    { name: 'New Year Sale', roi: '2.8x', percentage: 72 },
    { name: 'Flash Sale', roi: '2.4x', percentage: 60 },
    { name: 'Weekend Offer', roi: '2.1x', percentage: 50 }
  ];

  // Doughnut Chart Data details
  const doughnutSegments = [
    { name: 'Main Branch', value: 215450, color: '#2563EB', share: '42%' },
    { name: 'City Branch', value: 128750, color: '#10B981', share: '25%' },
    { name: 'Kandy Branch', value: 81050, color: '#14B8A6', share: '16%' },
    { name: 'Galle Branch', value: 48000, color: '#F59E0B', share: '9%' },
    { name: 'Other Branches', value: 39100, color: '#64748B', share: '8%' }
  ];

  // Doughnut parameters
  const totalDoughnutValue = doughnutSegments.reduce((acc, s) => acc + s.value, 0);

  // SVG Bar Chart coordinates mapping
  const barChartWidth = 480;
  const barChartHeight = 160;
  const barGap = 20;
  const colWidth = (barChartWidth - barGap * (currentChartData.length + 1)) / currentChartData.length;

  const getBarHeight = (value) => {
    return (value / 400) * barChartHeight; // Max scale 400k
  };

  return (
    <div className="space-y-6">
      
      {/* Promotion Analytics Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 mb-6 border-b border-slate-200 gap-4 select-none">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">Promotion Analytics</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Track conversion effectiveness and ROI performance across campaigns</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Branch Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                if (isBranchManager) return;
                setIsBranchOpen(!isBranchOpen);
                setIsDateOpen(false);
              }}
              disabled={isBranchManager}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-full shadow-sm transition-colors focus:outline-none ${
                isBranchManager ? 'opacity-85 cursor-not-allowed bg-slate-50/50' : 'hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{selectedBranch}</span>
              {!isBranchManager && <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {isBranchOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsBranchOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-1.5 overflow-hidden text-xs font-semibold text-slate-700">
                  {branches.map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        setSelectedBranch(b);
                        setIsBranchOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-blue-50/50 hover:text-blue-600 flex items-center gap-2 ${
                        selectedBranch === b ? 'text-blue-600 font-bold bg-blue-50/20' : ''
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full bg-blue-500 ${selectedBranch === b ? 'opacity-100' : 'opacity-0'}`} />
                      {b}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Date Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsDateOpen(!isDateOpen);
                setIsBranchOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-full shadow-sm transition-colors focus:outline-none"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{selectedDate}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isDateOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDateOpen(false)} />
                <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-1.5 overflow-hidden text-xs font-semibold text-slate-700">
                  {dates.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => {
                        setSelectedDate(d.label);
                        setIsDateOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-blue-50/50 hover:text-blue-600 flex items-center gap-2 ${
                        selectedDate === d.label ? 'text-blue-600 font-bold bg-blue-50/20' : ''
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full bg-blue-500 ${selectedDate === d.label ? 'opacity-100' : 'opacity-0'}`} />
                      {d.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export Button */}
          <Button
            onClick={showExportToast}
            variant="outline"
            className="rounded-full px-5 py-2.5 text-xs font-bold shadow-sm flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 select-none">
        <StatCard
          icon={Percent}
          label="Total Revenue from promotions"
          value={currentStats.rev}
          trend="↑ 12% vs previous period"
          colorVariant="blue"
        />
        <StatCard
          icon={Users}
          label="Total orders influenced"
          value={Number(currentStats.orders).toLocaleString()}
          trend="↑ 15% vs previous period"
          colorVariant="amber"
        />
        <StatCard
          icon={DollarSign}
          label="Avg. Order Value"
          value={currentStats.aov}
          trend="↑ 10% vs previous period"
          colorVariant="indigo"
        />
        <StatCard
          icon={Award}
          label="ROI"
          value={currentStats.roi}
          trend="↑ 12% vs previous period"
          colorVariant="emerald"
        />
      </div>

      {/* Middle row: Bar Chart & ROI Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) - SVG Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between select-none relative">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-800">Revenue Comparison</h3>
            
            {/* Chart Period Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsChartDropdownOpen(!isChartDropdownOpen)}
                className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors focus:outline-none"
              >
                <span>{chartPeriod}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isChartDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsChartDropdownOpen(false)} />
                  <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden text-xs font-semibold text-slate-700">
                    {['Last week', 'Last Month', 'This Month'].map((period) => (
                      <button
                        key={period}
                        onClick={() => {
                          setChartPeriod(period);
                          setIsChartDropdownOpen(false);
                          setHoveredBarIdx(null);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${
                          chartPeriod === period ? 'text-blue-600 font-bold bg-blue-50/20' : ''
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* SVG Bar Chart Canvas */}
          <div className="relative h-44 overflow-visible flex items-end">
            <svg viewBox={`0 0 ${barChartWidth} ${barChartHeight}`} className="w-full h-full overflow-visible">
              {/* Y Axis Grid lines */}
              {[0, 100, 200, 300, 400].map((t) => {
                const y = barChartHeight - (t / 400) * barChartHeight;
                return (
                  <g key={t} className="opacity-90">
                    <line x1="45" y1={y} x2={barChartWidth} y2={y} stroke="#F1F5F9" strokeWidth="1" />
                    <text x="35" y={y + 4} textAnchor="end" className="text-[10px] font-bold fill-slate-400">
                      {t === 0 ? '0' : `Rs. ${t}k`}
                    </text>
                  </g>
                );
              })}

              {/* Bar elements */}
              {currentChartData.map((d, idx) => {
                const x = 50 + idx * (colWidth + barGap);
                const h = getBarHeight(d.rev);
                const y = barChartHeight - h;
                const isHovered = hoveredBarIdx === idx;

                return (
                  <g 
                    key={idx}
                    onMouseEnter={() => setHoveredBarIdx(idx)}
                    onMouseLeave={() => setHoveredBarIdx(null)}
                    className="cursor-pointer"
                  >
                    {/* Background hover guide segment */}
                    <rect 
                      x={x - barGap/4} 
                      y="0" 
                      width={colWidth + barGap/2} 
                      height={barChartHeight} 
                      fill="transparent" 
                    />
                    
                    {/* The solid Blue Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={colWidth}
                      height={h}
                      rx="6"
                      fill={isHovered ? '#1D4ED8' : '#2563EB'}
                      className="transition-all duration-300"
                    />

                    {/* Labels under the bars */}
                    <text
                      x={x + colWidth / 2}
                      y={barChartHeight + 15}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-slate-400"
                    >
                      {d.day}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip overlay */}
            {hoveredBarIdx !== null && (
              <div 
                className="absolute bg-slate-900 text-white font-bold font-mono text-[10px] rounded-lg px-2.5 py-1.5 shadow-md pointer-events-none transition-all duration-75 z-10"
                style={{
                  left: `${50 + hoveredBarIdx * (colWidth + barGap) + colWidth / 2 - 40}px`,
                  bottom: `${getBarHeight(currentChartData[hoveredBarIdx].rev) + 12}px`
                }}
              >
                Rs. {currentChartData[hoveredBarIdx].rev},000
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3 width) - ROI Rankings progress list */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 select-none flex flex-col justify-between select-none">
          <div>
            <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3.5 mb-4">
              promotion performance by ROI
            </h3>

            <div className="space-y-4">
              {roiRankings.map((r, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span className="truncate max-w-[130px]">{r.name}</span>
                    <span className="font-extrabold text-slate-900">{r.roi}</span>
                  </div>

                  {/* Horizontal Bar progress */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/40">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${r.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom row: Doughnut Chart & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) - SVG Doughnut Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 select-none">
          <h3 className="text-base font-bold text-slate-800 mb-6">Revenue By Branch</h3>
          
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            {/* SVG Doughnut Circle */}
            <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90 overflow-visible">
                {/* SVG segments computed dynamically */}
                {/* Circumference = 2 * PI * r = 2 * 3.14159 * 42 = 263.89 */}
                {/* Segment shares: 42%, 25%, 16%, 9%, 8% */}
                {[
                  { dashArray: '110.8 263.89', dashOffset: '0', color: '#2563EB' },       // Main: 42%
                  { dashArray: '65.9 263.89', dashOffset: '-110.8', color: '#10B981' },    // City: 25%
                  { dashArray: '42.2 263.89', dashOffset: '-176.7', color: '#14B8A6' },    // Kandy: 16%
                  { dashArray: '23.7 263.89', dashOffset: '-218.9', color: '#F59E0B' },    // Galle: 9%
                  { dashArray: '21.2 263.89', dashOffset: '-242.6', color: '#64748B' }     // Other: 8%
                ].map((seg, idx) => {
                  const isHovered = hoveredRingIdx === idx;
                  return (
                    <circle
                      key={idx}
                      cx="60"
                      cy="60"
                      r="42"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth={isHovered ? '15' : '11'}
                      strokeDasharray={seg.dashArray}
                      strokeDashoffset={seg.dashOffset}
                      onMouseEnter={() => setHoveredRingIdx(idx)}
                      onMouseLeave={() => setHoveredRingIdx(null)}
                      className="transition-all duration-200 cursor-pointer"
                    />
                  );
                })}
              </svg>

              {/* Centre text overlay showing active branch hovered details */}
              <div className="absolute text-center flex flex-col pointer-events-none select-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {hoveredRingIdx !== null ? doughnutSegments[hoveredRingIdx].name : 'Total Share'}
                </span>
                <span className="text-sm font-extrabold text-slate-800 leading-none mt-0.5">
                  {hoveredRingIdx !== null ? doughnutSegments[hoveredRingIdx].share : '100%'}
                </span>
              </div>
            </div>

            {/* Right List Legend */}
            <div className="flex-1 space-y-2.5 max-w-xs font-semibold text-xs text-slate-600 w-full">
              {doughnutSegments.map((segment, idx) => (
                <div 
                  key={idx} 
                  onMouseEnter={() => setHoveredRingIdx(idx)}
                  onMouseLeave={() => setHoveredRingIdx(null)}
                  className={`flex items-center justify-between p-2 rounded-xl border border-transparent transition-all cursor-pointer ${
                    hoveredRingIdx === idx ? 'bg-slate-50 border-slate-200/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: segment.color }} />
                    <span className="truncate max-w-[120px]">{segment.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-800 font-mono">
                    Rs. {segment.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right Column (1/3 width) - AI Insight List */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between select-none select-none">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                <h3 className="text-base font-bold text-slate-800">AI Insight</h3>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                New
              </span>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-slate-800 shrink-0 mt-0.5" />
                <p>Beverage category promotions perform <span className="text-emerald-600 font-bold">22% better</span> on weekends</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-slate-800 shrink-0 mt-0.5" />
                <p>Orders with promotions have <span className="text-emerald-600 font-bold">18% higher</span> average value.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-slate-800 shrink-0 mt-0.5" />
                <p>Flash sales on Fridays show <span className="text-emerald-600 font-bold">31% higher</span> engagement.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsAIModalOpen(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-end gap-1 mt-6 border-t border-slate-50 pt-4"
          >
            <span>View all AI Insights</span>
            <span>&gt;</span>
          </button>
        </div>

      </div>

      {/* AI Recommendations Modal */}
      <Modal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        title="AI Recommendations & Insights"
        size="md"
      >
        <div className="space-y-4 select-none">
          <div className="flex items-start gap-3 p-4 bg-purple-50/50 border border-purple-100 rounded-2xl">
            <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-slate-800 text-sm">Beverage Weekends</h5>
              <p className="text-xs text-slate-600 mt-1">
                Beverage category promotions perform 22% better on weekends. Suggest scheduling beverage discount rules from Friday noon to Sunday midnight.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-slate-800 text-sm">Average Order Value (AOV)</h5>
              <p className="text-xs text-slate-600 mt-1">
                Orders with promotions have 18% higher average value. Offering cross-sell rule rewards (e.g. Free items when purchasing over Rs. 1000) drives the highest ticket sizes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-slate-800 text-sm">Friday Flash Sales</h5>
              <p className="text-xs text-slate-600 mt-1">
                Flash sales on Fridays show 31% higher engagement, specifically during high foot-traffic checkout hours (5:00 PM to 9:00 PM).
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setIsAIModalOpen(false)}
              className="px-5 py-2"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
