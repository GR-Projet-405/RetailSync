import React, { useState, useRef } from 'react';
import { ChevronDown, TrendingUp } from 'lucide-react';

export default function PromotionChart() {
  const [granularity, setGranularity] = useState('Daily');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const dataset = {
    Daily: {
      labels: ['01 Jun', '03 Jun', '05 Jun', '07 Jun', '09 Jun', '11 Jun', '13 Jun', '15 Jun'],
      fullLabels: ['01 Jun 2026', '02 Jun 2026', '03 Jun 2026', '04 Jun 2026', '05 Jun 2026', '06 Jun 2026', '07 Jun 2026', '08 Jun 2026', '09 Jun 2026', '10 Jun 2026', '11 Jun 2026', '12 Jun 2026', '13 Jun 2026', '14 Jun 2026', '15 Jun 2026'],
      lines: {
        summer: [30, 42, 38, 51, 48, 58, 58, 62, 60, 60, 65, 71, 71, 74, 78], // Red
        newYear: [15, 23, 31, 28, 33, 40, 42, 36, 46, 42, 49, 59, 50, 52, 59], // Green
        flash: [18, 12, 21, 38, 41, 46, 43, 46, 36, 46, 32, 48, 45, 41, 61], // Blue
        weekend: [12, 8, 11, 15, 12, 22, 16, 25, 20, 15, 26, 21, 19, 28, 35], // Orange/Yellow
      }
    },
    Weekly: {
      labels: ['Wk 21', 'Wk 22', 'Wk 23', 'Wk 24', 'Wk 25', 'Wk 26'],
      fullLabels: ['Week 21, 2026', 'Week 22, 2026', 'Week 23, 2026', 'Week 24, 2026', 'Week 25, 2026', 'Week 26, 2026'],
      lines: {
        summer: [120, 180, 140, 210, 230, 280],
        newYear: [80, 95, 110, 130, 160, 195],
        flash: [90, 70, 120, 150, 110, 175],
        weekend: [50, 40, 65, 80, 95, 120],
      }
    },
    Monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      fullLabels: ['January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026'],
      lines: {
        summer: [420, 510, 480, 680, 720, 890],
        newYear: [300, 340, 410, 490, 520, 610],
        flash: [280, 240, 390, 450, 490, 550],
        weekend: [180, 150, 220, 280, 310, 390],
      }
    }
  };

  const currentData = dataset[granularity];
  const dataPointsCount = currentData.fullLabels.length;

  // Chart dimensions
  const viewWidth = 600;
  const viewHeight = 240;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = viewWidth - paddingLeft - paddingRight;
  const chartHeight = viewHeight - paddingTop - paddingBottom;

  // Maximum value calculation for y-scaling
  const allValues = Object.values(currentData.lines).flat();
  const maxValue = Math.max(...allValues, 10) * 1.1; // 10% headroom

  // Helper to map index & value to coordinate
  const getX = (index) => paddingLeft + index * (chartWidth / (dataPointsCount - 1));
  const getY = (val) => viewHeight - paddingBottom - (val / maxValue) * chartHeight;

  // Build SVG path string for a line
  const buildPath = (values) => {
    return values.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(val)}`).join(' ');
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert mouse X to relative SVG coordinate
    const svgX = (x / rect.width) * viewWidth;
    
    // Find closest data point index
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

  // Label configuration for X-axis (avoid crowding)
  const shouldShowLabel = (idx) => {
    if (granularity !== 'Daily') return true;
    return idx % 2 === 0; // Show alternate labels for daily view
  };

  // Generate Y-axis grid labels
  const yTicksCount = 5;
  const yTicks = Array.from({ length: yTicksCount }).map((_, idx) => {
    const val = (maxValue / (yTicksCount - 1)) * idx;
    return {
      value: val,
      y: getY(val),
      label: `Rs.${val.toFixed(0)}k`
    };
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col h-full relative card-hover transition-all duration-200" ref={containerRef}>
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6 select-none">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-800">Promotion Revenue Trend</h3>
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
                {['Daily', 'Weekly', 'Monthly'].map((opt) => (
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
        className="relative flex-1 cursor-crosshair select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
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
          {currentData.fullLabels.map((label, idx) => {
            const isLabelVisible = shouldShowLabel(idx);
            // Display formatted short labels for X Axis
            const displayLabel = granularity === 'Daily' 
              ? currentData.labels[Math.floor(idx / 2)] 
              : currentData.labels[idx];

            return isLabelVisible && granularity === 'Daily' && idx % 2 === 0 ? (
              <text
                key={idx}
                x={getX(idx)}
                y={viewHeight - paddingBottom + 18}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-medium font-sans"
              >
                {currentData.fullLabels[idx].substring(0, 6)}
              </text>
            ) : granularity !== 'Daily' ? (
              <text
                key={idx}
                x={getX(idx)}
                y={viewHeight - paddingBottom + 18}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-medium font-sans"
              >
                {displayLabel}
              </text>
            ) : null;
          })}

          {/* Trend Lines */}
          <path d={buildPath(currentData.lines.summer)} fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" className="transition-all duration-300" />
          <path d={buildPath(currentData.lines.newYear)} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" className="transition-all duration-300" />
          <path d={buildPath(currentData.lines.flash)} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" className="transition-all duration-300" />
          <path d={buildPath(currentData.lines.weekend)} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" className="transition-all duration-300" />

          {/* Highlight Data Points */}
          {currentData.fullLabels.map((_, idx) => (
            <g key={idx} className="opacity-0 hover:opacity-100 transition-opacity">
              <circle cx={getX(idx)} cy={getY(currentData.lines.summer[idx])} r="4" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
              <circle cx={getX(idx)} cy={getY(currentData.lines.newYear[idx])} r="4" fill="#10B981" stroke="#FFF" strokeWidth="1.5" />
              <circle cx={getX(idx)} cy={getY(currentData.lines.flash[idx])} r="4" fill="#3B82F6" stroke="#FFF" strokeWidth="1.5" />
              <circle cx={getX(idx)} cy={getY(currentData.lines.weekend[idx])} r="4" fill="#F59E0B" stroke="#FFF" strokeWidth="1.5" />
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
              <circle cx={getX(hoveredIdx)} cy={getY(currentData.lines.summer[hoveredIdx])} r="5" fill="#EF4444" stroke="#FFF" strokeWidth="2" className="shadow" />
              <circle cx={getX(hoveredIdx)} cy={getY(currentData.lines.newYear[hoveredIdx])} r="5" fill="#10B981" stroke="#FFF" strokeWidth="2" className="shadow" />
              <circle cx={getX(hoveredIdx)} cy={getY(currentData.lines.flash[hoveredIdx])} r="5" fill="#3B82F6" stroke="#FFF" strokeWidth="2" className="shadow" />
              <circle cx={getX(hoveredIdx)} cy={getY(currentData.lines.weekend[hoveredIdx])} r="5" fill="#F59E0B" stroke="#FFF" strokeWidth="2" className="shadow" />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && (
          <div 
            className="absolute bg-slate-900/95 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-800 backdrop-blur-md z-30 flex flex-col gap-1.5 pointer-events-none min-w-[150px] transition-all duration-75"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
          >
            <p className="font-bold text-[10px] text-slate-400 border-b border-slate-800 pb-1 mb-1">
              {currentData.fullLabels[hoveredIdx]}
            </p>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Summer Sale
              </span>
              <span className="font-bold font-mono">Rs. ${(currentData.lines.summer[hoveredIdx] * 1000).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                New Year Sale
              </span>
              <span className="font-bold font-mono">Rs. ${(currentData.lines.newYear[hoveredIdx] * 1000).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Flash Sale
              </span>
              <span className="font-bold font-mono">Rs. ${(currentData.lines.flash[hoveredIdx] * 1000).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Weekend Offer
              </span>
              <span className="font-bold font-mono">Rs. ${(currentData.lines.weekend[hoveredIdx] * 1000).toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500 select-none">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          Summer Sale
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          New Year Sale
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          Flash Sale
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          Weekend Offer
        </span>
      </div>
    </div>
  );
}
