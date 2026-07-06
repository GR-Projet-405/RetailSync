import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, TrendingUp } from 'lucide-react';
import api from '../../services/api';

export default function PromotionChart() {
  const [granularity, setGranularity] = useState('Monthly');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState({
    labels: [],
    revenue: [],
    orders: []
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/promotions-discounts/analytics', {
        timeout: 45000 // 45s custom timeout to accommodate cold starts / latency of remote Atlas connection
      });
      const data = response.data?.data || {};
      setChartData({
        labels: data.labels || [],
        revenue: data.revenue || [],
        orders: data.orders || []
      });
    } catch (err) {
      console.error('Failed to fetch chart analytics:', err);
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const dataPointsCount = chartData.labels.length;

  // Chart dimensions
  const viewWidth = 600;
  const viewHeight = 240;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = viewWidth - paddingLeft - paddingRight;
  const chartHeight = viewHeight - paddingTop - paddingBottom;

  // Max calculations for coordinate plotting
  const maxRevenue = Math.max(...chartData.revenue, 1000) * 1.1;
  const maxOrders = Math.max(...chartData.orders, 10) * 1.1;

  // Helper to map index & value to coordinate
  const getX = (index) => paddingLeft + index * (chartWidth / Math.max(dataPointsCount - 1, 1));
  const getYRevenue = (val) => viewHeight - paddingBottom - (val / maxRevenue) * chartHeight;
  const getYOrders = (val) => viewHeight - paddingBottom - (val / maxOrders) * chartHeight;

  // Build SVG path strings
  const buildRevenuePath = (values) => {
    return values.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getYRevenue(val)}`).join(' ');
  };

  const buildOrdersPath = (values) => {
    return values.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getYOrders(val)}`).join(' ');
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current || dataPointsCount === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const svgX = (x / rect.width) * viewWidth;
    
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < dataPointsCount; i++) {
      const pointX = getX(i);
      const diff = Math.abs(svgX - pointX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }

    setHoveredIdx(closestIdx);
    setTooltipPos({ x: e.clientX - rect.left + 15, y: e.clientY - rect.top - 70 });
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  // Generate Y-axis grid labels based on dominant metrics
  const yTicksCount = 5;
  const yTicks = Array.from({ length: yTicksCount }).map((_, idx) => {
    const val = (maxRevenue / (yTicksCount - 1)) * idx;
    const displayLabel = val >= 1000 ? `Rs.${(val / 1000).toFixed(0)}k` : `Rs.${val.toFixed(0)}`;
    return {
      value: val,
      y: viewHeight - paddingBottom - (val / maxRevenue) * chartHeight,
      label: displayLabel
    };
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col h-full relative card-hover transition-all duration-200" ref={containerRef}>
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6 select-none">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-800">Promotion Performance Trend</h3>
        </div>

        {/* Granularity Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors focus:outline-none"
          >
            <span>{granularity}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute right-0 mt-1 w-28 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden text-xs font-medium">
                {['Monthly'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setGranularity(opt);
                      setIsDropdownOpen(false);
                      setHoveredIdx(null);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${
                      granularity === opt ? 'text-blue-600 font-semibold bg-blue-50/20' : 'text-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div 
        className="relative flex-1 cursor-crosshair select-none min-h-[180px] flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {error ? (
          <div className="text-center text-xs font-bold text-red-600">
            Error loading performance data: {error}
          </div>
        ) : loading ? (
          <div className="text-center text-xs font-bold text-slate-400">
            Loading performance statistics...
          </div>
        ) : dataPointsCount === 0 ? (
          <div className="text-center text-xs font-bold text-slate-400">
            No promotions analytics found. Create campaigns to see performance trends.
          </div>
        ) : (
          <svg 
            viewBox={`0 0 ${viewWidth} ${viewHeight}`} 
            className="w-full h-full overflow-visible"
          >
            {/* Y Axis Grid Lines & Labels */}
            {yTicks.map((tick, i) => (
              <g key={i} className="opacity-80">
                <text 
                  x={paddingLeft - 10} 
                  y={tick.y + 4} 
                  textAnchor="end" 
                  className="text-[10px] fill-slate-400 font-medium font-sans"
                >
                  {tick.label}
                </text>
                <line 
                  x1={paddingLeft} 
                  y1={tick.y} 
                  x2={viewWidth - paddingRight} 
                  y2={tick.y} 
                  className="stroke-slate-100" 
                  strokeWidth="1"
                  strokeDasharray={i === 0 ? "0" : "4 4"}
                />
              </g>
            ))}

            {/* X Axis Labels */}
            {chartData.labels.map((label, idx) => (
              <text
                key={idx}
                x={getX(idx)}
                y={viewHeight - paddingBottom + 18}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-medium font-sans"
              >
                {label}
              </text>
            ))}

            {/* Trend Lines */}
            <path d={buildRevenuePath(chartData.revenue)} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" className="transition-all duration-300" />
            <path d={buildOrdersPath(chartData.orders)} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" className="transition-all duration-300" />

            {/* Highlight Data Points */}
            {chartData.labels.map((_, idx) => (
              <g key={idx} className="opacity-0 hover:opacity-100 transition-opacity">
                <circle cx={getX(idx)} cy={getYRevenue(chartData.revenue[idx])} r="4" fill="#3B82F6" stroke="#FFF" strokeWidth="1.5" />
                <circle cx={getX(idx)} cy={getYOrders(chartData.orders[idx])} r="4" fill="#10B981" stroke="#FFF" strokeWidth="1.5" />
              </g>
            ))}

            {/* Active hover indicator line */}
            {hoveredIdx !== null && (
              <line
                x1={getX(hoveredIdx)}
                y1={paddingTop}
                x2={getX(hoveredIdx)}
                y2={viewHeight - paddingBottom}
                stroke="#E2E8F0"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            )}

            {/* Active points larger circles on hover */}
            {hoveredIdx !== null && (
              <g>
                <circle cx={getX(hoveredIdx)} cy={getYRevenue(chartData.revenue[hoveredIdx])} r="5" fill="#3B82F6" stroke="#FFF" strokeWidth="2" className="shadow" />
                <circle cx={getX(hoveredIdx)} cy={getYOrders(chartData.orders[hoveredIdx])} r="5" fill="#10B981" stroke="#FFF" strokeWidth="2" className="shadow" />
              </g>
            )}
          </svg>
        )}

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && !loading && !error && dataPointsCount > 0 && (
          <div 
            className="absolute bg-slate-900/95 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-800 backdrop-blur-md z-30 flex flex-col gap-1.5 pointer-events-none min-w-[150px] transition-all duration-75"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
          >
            <p className="font-bold text-[10px] text-slate-400 border-b border-slate-800 pb-1 mb-1">
              Performance - {chartData.labels[hoveredIdx]}
            </p>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Revenue Generated
              </span>
              <span className="font-bold font-mono">Rs. {chartData.revenue[hoveredIdx].toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Orders Influenced
              </span>
              <span className="font-bold font-mono">{chartData.orders[hoveredIdx].toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500 select-none">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          Revenue Generated
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          Orders Influenced
        </span>
      </div>
    </div>
  );
}
