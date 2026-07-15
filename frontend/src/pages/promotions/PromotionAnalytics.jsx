import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, Calendar, MapPin, Download, ChevronDown, CheckCircle, 
  Percent, Sparkles, BarChart3, Users, DollarSign, Award, ShieldAlert,
  Tag, Layers, ShoppingCart, Ticket, Search, X, Plus, Sliders, Columns, MoreVertical
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Card, { CardContent } from '../../components/Card';
import Badge from '../../components/Badge';
import StatCard from '../../components/promotions/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function PromotionAnalyticsPage() {
  const { user, hasRole, activeBranch } = useAuth();
  const isBranchManager = hasRole('BRANCH_MANAGER');
  const navigate = useNavigate();

  // Filter States
  const selectedBranch = activeBranch || 'All Branches';
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('All Time');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dropdown Open States
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Live Data States
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPromotions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/promotions-discounts', {
        params: { limit: 1000 }, // High limit to load all records for full client-side aggregation
        timeout: 45000 // 45s custom timeout to accommodate cold starts / latency of remote Atlas connection
      });
      const data = response.data?.data?.promotions || [];
      const mappedData = data.map(p => ({
        ...p,
        id: p._id,
        branch: p.branchId ? p.branchId.name : 'All Branches',
        orders: p.ordersCount || 0,
        usage: p.usagesCount || 0,
        startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '',
        endDate: p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : ''
      }));
      setPromotions(mappedData);
    } catch (err) {
      console.error('Failed to load promotions for analytics:', err);
      setError(err.message || 'Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  useEffect(() => {
    if (isBranchManager) {
      const managerBranch = user?.branchId?.name || 'Downtown Flagship';
      setSelectedBranch(managerBranch);
    }
  }, [isBranchManager, user]);

  // Color Palette for charts
  const COLOR_PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  // Parse ROI string e.g. "3.2x" to 3.2
  const parseROI = (roiStr) => {
    if (!roiStr) return 0;
    const num = parseFloat(roiStr.replace(/[^\d.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  // List of branches for the filter
  const branchOptions = useMemo(() => {
    const list = new Set(['All Branches']);
    promotions.forEach(p => {
      if (p.branch) list.add(p.branch);
    });
    return Array.from(list);
  }, [promotions]);

  // Filtered List calculation
  const filteredPromotions = useMemo(() => {
    return promotions.filter(promo => {
      // 1. Search filter
      const matchesSearch = 
        promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.type.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Branch filter
      const matchesBranch = 
        selectedBranch === 'All Branches' || 
        promo.branch === selectedBranch ||
        promo.branch === 'All Branches';

      // 3. Status filter
      const matchesStatus = 
        selectedStatus === 'All' || 
        promo.status === selectedStatus;

      // 4. Date Range filter
      let matchesDate = true;
      if (promo.startDate) {
        const promoDate = new Date(promo.startDate);
        const today = new Date();
        today.setHours(0,0,0,0);

        if (selectedDateRange === 'Today') {
          const promoStartStr = new Date(promo.startDate).toDateString();
          matchesDate = promoStartStr === new Date().toDateString();
        } else if (selectedDateRange === 'Last 7 Days') {
          const diffTime = Math.abs(today - promoDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          matchesDate = diffDays <= 7;
        } else if (selectedDateRange === 'This Month') {
          matchesDate = 
            promoDate.getMonth() === today.getMonth() && 
            promoDate.getFullYear() === today.getFullYear();
        }
      }

      return matchesSearch && matchesBranch && matchesStatus && matchesDate;
    });
  }, [promotions, searchTerm, selectedBranch, selectedStatus, selectedDateRange]);

  // KPI calculations (4 Cards matching layout specs)
  const kpis = useMemo(() => {
    const activePromotions = filteredPromotions.filter(p => p.status === 'Active').length;
    const totalRevenue = filteredPromotions.reduce((sum, p) => sum + (p.revenue || 0), 0);
    const totalOrders = filteredPromotions.reduce((sum, p) => sum + (p.orders || 0), 0);
    
    const roiValues = filteredPromotions.map(p => parseROI(p.roi)).filter(val => val > 0);
    const avgROI = roiValues.length > 0 
      ? (roiValues.reduce((sum, val) => sum + val, 0) / roiValues.length).toFixed(1)
      : '0.0';

    return {
      activePromotions,
      totalRevenue,
      totalOrders,
      avgROI
    };
  }, [filteredPromotions]);

  // Chart 1: Revenue by Promotion (Vertical Bar Chart - Top 5)
  const verticalBarChart = useMemo(() => {
    const items = [...filteredPromotions].sort((a,b) => (b.revenue || 0) - (a.revenue || 0)).slice(0, 5); 
    const maxRev = Math.max(...items.map(p => p.revenue || 0), 1000) * 1.2;
    return { items, maxRev };
  }, [filteredPromotions]);

  // Chart 2: Orders Influenced by Promotion (Horizontal SVG Bar Chart - Top 5)
  const horizontalBarChart = useMemo(() => {
    const items = [...filteredPromotions].sort((a,b) => (b.orders || 0) - (a.orders || 0)).slice(0, 5);
    const maxOrd = Math.max(...items.map(p => p.orders || 0), 10) * 1.15;
    return { items, maxOrd };
  }, [filteredPromotions]);

  // Chart 3: Coupon Usage Distribution (Donut Chart - Top 5)
  const donutChart = useMemo(() => {
    const items = [...filteredPromotions].filter(p => p.usage > 0).sort((a,b) => b.usage - a.usage).slice(0, 5);
    const totalUsages = items.reduce((sum, p) => sum + p.usage, 0);
    return { items, totalUsages };
  }, [filteredPromotions]);

  // Chart 4: ROI Ranking (Progress Bars - Top 5)
  const roiRanking = useMemo(() => {
    const sorted = [...filteredPromotions]
      .map(p => ({ ...p, parsedRoi: parseROI(p.roi) }))
      .sort((a, b) => b.parsedRoi - a.parsedRoi)
      .slice(0, 5);
    const maxROI = Math.max(...sorted.map(p => p.parsedRoi), 1) * 1.1;
    return { sorted, maxROI };
  }, [filteredPromotions]);

  // Pagination Table
  const totalItems = filteredPromotions.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedPromotions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    // Sorted by Revenue descending
    const sorted = [...filteredPromotions].sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
    return sorted.slice(startIndex, startIndex + pageSize);
  }, [filteredPromotions, currentPage]);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Name,Status,Revenue,Orders,Usage,ROI,Branch,Start Date,End Date"]
        .concat(filteredPromotions.map(p => 
          `"${p.name}","${p.status}",${p.revenue},${p.orders},${p.usage},"${p.roi}","${p.branch}","${p.startDate}","${p.endDate}"`
        )).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `promotion_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 fade-up">
      {/* Page Header */}
      <PageHeader
        title="Promotion Analytics"
        description="Monitor campaign performance, coupon usage, revenue generation, and ROI across all promotions."
        actions={
          <div className="flex flex-wrap items-center gap-3">

            {/* Date Range Selector */}
            <div className="relative">
              <button
                onClick={() => setIsDateOpen(!isDateOpen)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl transition-all shadow-sm focus:outline-none hover:bg-slate-50"
              >
                <Calendar size={14} className="text-slate-400" />
                <span>{selectedDateRange}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {isDateOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDateOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 overflow-hidden text-xs font-semibold select-none">
                    {['All Time', 'Today', 'Last 7 Days', 'This Month'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSelectedDateRange(opt);
                          setIsDateOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors ${
                          selectedDateRange === opt ? 'text-blue-600 font-bold bg-blue-50/20' : 'text-slate-600'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Export Button */}
            <Button
              onClick={handleExport}
              disabled={filteredPromotions.length === 0}
              variant="outline"
              className="rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </Button>
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold select-none">
          Error loading analytics dashboard: {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-xs font-bold text-slate-400 select-none">
          Loading promotions analytics dashboard...
        </div>
      ) : promotions.length === 0 ? (
        /* Empty state when no promotions are present in DB */
        <div className="bg-white border border-slate-200 rounded-[18px] shadow-sm p-12 text-center select-none flex flex-col items-center max-w-md mx-auto">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-4">
            <BarChart3 size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No promotion analytics available</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1.5 mb-6">
            Create a campaign or promotion code in the system to begin tracking real-time sales and coupon performance metrics.
          </p>
          <Button
            onClick={() => navigate('/promotions')}
            variant="primary"
            className="rounded-full px-6 py-2.5 text-xs font-bold shadow-md shadow-blue-500/10 flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Create Promotion</span>
          </Button>
        </div>
      ) : (
        /* Dashboard Container */
        <div className="space-y-6">
          {/* TOP KPI CARDS (Exactly 4 Cards matching screenshot layout specs) */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 select-none">
            <StatCard
              icon={Tag}
              label="Active Promotions"
              value={kpis.activePromotions}
              trend="↑ 20% vs last 7 days"
              trendDirection="up"
              colorVariant="blue"
            />
            <StatCard
              icon={TrendingUp}
              label="Revenue Generated"
              value={`Rs. ${kpis.totalRevenue.toLocaleString()}`}
              trend="↑ 22% vs last 7 days"
              trendDirection="up"
              colorVariant="indigo"
            />
            <StatCard
              icon={ShoppingCart}
              label="Orders Influenced"
              value={kpis.totalOrders.toLocaleString()}
              trend="↑ 16% vs last 7 days"
              colorVariant="emerald"
            />
            <StatCard
              icon={Award}
              label="Average ROI"
              value={`${kpis.avgROI}x`}
              trend="↑ 10% vs last 7 days"
              trendDirection="up"
              colorVariant="amber"
            />
          </div>

          {/* MAIN CHARTS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Revenue by Promotion */}
            <div className="bg-white border border-slate-200 rounded-[18px] shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 select-none">
                  <h3 className="text-sm font-bold text-slate-800">Revenue by Promotion</h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1 cursor-pointer">
                    Top 5 <ChevronDown size={12} />
                  </span>
                </div>
                {verticalBarChart.items.length === 0 ? (
                  <div className="text-center py-16 text-xs font-bold text-slate-400">No data to display</div>
                ) : (
                  <div className="relative min-h-[220px] select-none pt-4">
                    {(() => {
                      const viewWidth = 500;
                      const viewHeight = 220;
                      const paddingLeft = 55;
                      const paddingRight = 20;
                      const paddingTop = 30; // extra padding for labels on top of columns
                      const paddingBottom = 35;

                      const chartWidth = viewWidth - paddingLeft - paddingRight;
                      const chartHeight = viewHeight - paddingTop - paddingBottom;

                      const maxVal = verticalBarChart.maxRev;
                      const items = verticalBarChart.items;
                      const dataCount = items.length;

                      const ticksCount = 5;
                      const ticks = Array.from({ length: ticksCount }).map((_, idx) => {
                        const val = (maxVal / (ticksCount - 1)) * idx;
                        const label = val >= 1000 ? `Rs. ${(val / 1000).toFixed(0)}k` : `Rs. ${val.toFixed(0)}`;
                        return {
                          y: viewHeight - paddingBottom - (val / maxVal) * chartHeight,
                          label
                        };
                      });

                      return (
                        <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full h-full overflow-visible">
                          {/* Grid Lines */}
                          {ticks.map((tick, i) => (
                            <g key={i} className="opacity-80">
                              <text x={paddingLeft - 10} y={tick.y + 3.5} textAnchor="end" className="text-[10px] fill-slate-400 font-bold font-sans">
                                {tick.label}
                              </text>
                              <line x1={paddingLeft} y1={tick.y} x2={viewWidth - paddingRight} y2={tick.y} className="stroke-slate-100" strokeWidth="1" strokeDasharray={i === 0 ? "0" : "4 4"} />
                            </g>
                          ))}
                          {/* Bars */}
                          {items.map((p, idx) => {
                            const barWidth = 35;
                            const spacing = chartWidth / dataCount;
                            const x = paddingLeft + idx * spacing + (spacing - barWidth) / 2;
                            const valHeight = ((p.revenue || 0) / maxVal) * chartHeight;
                            const y = viewHeight - paddingBottom - valHeight;
                            const color = '#3B82F6'; // Blue columns matching screenshot

                            return (
                              <g key={p.id} className="group cursor-pointer">
                                {/* Value indicator directly above column */}
                                <text
                                  x={x + barWidth / 2}
                                  y={y - 6}
                                  textAnchor="middle"
                                  className="text-[9px] fill-slate-800 font-black font-sans"
                                >
                                  Rs. {p.revenue.toLocaleString()}
                                </text>
                                <rect
                                  x={x}
                                  y={y}
                                  width={barWidth}
                                  height={Math.max(valHeight, 4)}
                                  fill={color}
                                  rx="4"
                                  className="transition-all duration-300 hover:opacity-90"
                                />
                                <text
                                  x={x + barWidth / 2}
                                  y={viewHeight - paddingBottom + 16}
                                  textAnchor="middle"
                                  className="text-[10px] fill-slate-500 font-bold font-sans"
                                >
                                  {p.name.length > 12 ? `${p.name.substring(0, 11)}…` : p.name}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Promotion ROI Ranking */}
            <div className="bg-white border border-slate-200 rounded-[18px] shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 select-none">
                  <h3 className="text-sm font-bold text-slate-800">Promotion ROI Ranking</h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1 cursor-pointer">
                    Top 5 <ChevronDown size={12} />
                  </span>
                </div>
                {roiRanking.sorted.length === 0 ? (
                  <div className="text-center py-16 text-xs font-bold text-slate-400">No campaigns to evaluate</div>
                ) : (
                  <div className="space-y-7 py-2 select-none">
                    {roiRanking.sorted.map((p, idx) => {
                      const widthPercent = `${Math.min((p.parsedRoi / roiRanking.maxROI) * 100, 100)}%`;
                      return (
                        <div key={p.id} className="flex items-center justify-between gap-4 text-xs font-bold text-slate-600">
                          <span className="w-24 truncate text-left">{p.name}</span>
                          <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50 relative">
                            <div 
                              className="h-full rounded-full transition-all duration-300 bg-[#8B5CF6]" // Purple ROI bars matching screenshot
                              style={{ width: widthPercent }}
                            />
                          </div>
                          <span className="w-10 text-right font-black text-slate-800 font-mono">{p.roi || '0.0x'}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Chart 3: Orders Influenced by Promotion (Green horizontal bars with ticks) */}
            <div className="bg-white border border-slate-200 rounded-[18px] shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 select-none">
                  <h3 className="text-sm font-bold text-slate-800">Orders Influenced by Promotion</h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1 cursor-pointer">
                    Top 5 <ChevronDown size={12} />
                  </span>
                </div>
                {horizontalBarChart.items.length === 0 ? (
                  <div className="text-center py-16 text-xs font-bold text-slate-400">No data to display</div>
                ) : (
                  <div className="relative min-h-[200px] select-none pt-2">
                    {(() => {
                      const viewWidth = 500;
                      const viewHeight = 200;
                      const paddingLeft = 100;
                      const paddingRight = 45;
                      const paddingTop = 15;
                      const paddingBottom = 30;

                      const chartWidth = viewWidth - paddingLeft - paddingRight;
                      const chartHeight = viewHeight - paddingTop - paddingBottom;

                      const maxVal = horizontalBarChart.maxOrd;
                      const items = horizontalBarChart.items;
                      const dataCount = items.length;

                      const ticksCount = 6;
                      const tickStep = maxVal / (ticksCount - 1);
                      const ticks = Array.from({ length: ticksCount }).map((_, idx) => {
                        const val = tickStep * idx;
                        return {
                          x: paddingLeft + (val / maxVal) * chartWidth,
                          label: Math.round(val)
                        };
                      });

                      return (
                        <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full h-full overflow-visible">
                          {/* Grid Ticks */}
                          {ticks.map((tick, i) => (
                            <g key={i} className="opacity-80">
                              <line
                                x1={tick.x}
                                y1={paddingTop}
                                x2={tick.x}
                                y2={viewHeight - paddingBottom}
                                className="stroke-slate-100"
                                strokeWidth="1"
                              />
                              <text
                                x={tick.x}
                                y={viewHeight - paddingBottom + 16}
                                textAnchor="middle"
                                className="text-[9px] fill-slate-400 font-bold font-sans"
                              >
                                {tick.label}
                              </text>
                            </g>
                          ))}
                          {/* Green Horizontal Bars */}
                          {items.map((p, idx) => {
                            const barHeight = 8;
                            const spacing = chartHeight / dataCount;
                            const y = paddingTop + idx * spacing + (spacing - barHeight) / 2;
                            const valWidth = ((p.orders || 0) / maxVal) * chartWidth;
                            const color = '#10B981'; // Green color matching screenshot

                            return (
                              <g key={p.id}>
                                <text
                                  x={paddingLeft - 12}
                                  y={y + barHeight / 2 + 3}
                                  textAnchor="end"
                                  className="text-[10px] fill-slate-500 font-bold font-sans"
                                >
                                  {p.name.length > 12 ? `${p.name.substring(0, 11)}…` : p.name}
                                </text>
                                <rect
                                  x={paddingLeft}
                                  y={y}
                                  width={Math.max(valWidth, 4)}
                                  height={barHeight}
                                  fill={color}
                                  rx="4"
                                  className="transition-all duration-300 hover:opacity-90"
                                />
                                <text
                                  x={paddingLeft + valWidth + 8}
                                  y={y + barHeight / 2 + 3}
                                  textAnchor="start"
                                  className="text-[10px] fill-slate-700 font-black font-sans"
                                >
                                  {p.orders}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Chart 4: Coupon Usage by Promotion */}
            <div className="bg-white border border-slate-200 rounded-[18px] shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 select-none">
                  <h3 className="text-sm font-bold text-slate-800">Coupon Usage by Promotion</h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1 cursor-pointer">
                    Top 5 <ChevronDown size={12} />
                  </span>
                </div>
                {donutChart.items.length === 0 ? (
                  <div className="text-center py-16 text-xs font-bold text-slate-400">No coupons used yet</div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4 select-none">
                    {/* SVG Donut */}
                    <div className="relative w-36 h-36 shrink-0">
                      <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
                        {(() => {
                          const radius = 55;
                          const circ = 2 * Math.PI * radius; // 345.57
                          let accumulated = 0;
                          return donutChart.items.map((p, idx) => {
                            const percent = p.usage / donutChart.totalUsages;
                            const strokeLength = percent * circ;
                            const strokeOffset = circ - strokeLength + accumulated;
                            accumulated -= strokeLength;
                            const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];

                            return (
                              <circle
                                key={p.id}
                                cx="80"
                                cy="80"
                                r={radius}
                                fill="none"
                                stroke={color}
                                strokeWidth="18"
                                strokeDasharray={`${strokeLength} ${circ}`}
                                strokeDashoffset={strokeOffset}
                                className="transition-all duration-300"
                              />
                            );
                          });
                        })()}
                        <circle cx="80" cy="80" r="42" fill="#FFF" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase">Total Usage</span>
                        <span className="text-xl font-black text-slate-800 font-mono">{donutChart.totalUsages}</span>
                      </div>
                    </div>

                    {/* Donut Legend matching the screenshot */}
                    <div className="flex-1 space-y-3 w-full">
                      {donutChart.items.map((p, idx) => {
                        const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];
                        const pct = ((p.usage / donutChart.totalUsages) * 100).toFixed(1);
                        return (
                          <div key={p.id} className="flex items-center justify-between text-xs font-bold text-slate-500 w-full">
                            <span className="flex items-center gap-2.5 truncate">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                              <span className="truncate max-w-[120px]">{p.code || p.name}</span>
                            </span>
                            <span className="font-sans text-slate-700 shrink-0 font-medium">{p.usage} ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* TABLE CARD */}
          <div className="bg-white border border-slate-200 rounded-[18px] shadow-sm overflow-hidden flex flex-col select-none">
            {/* Table Header and Search */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-sm font-black text-slate-800">Promotion Performance Overview</h3>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative max-w-xs w-full sm:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[2.25]" />
                  <input
                    type="text"
                    placeholder="Search promotion..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none text-xs font-semibold text-slate-800 placeholder-slate-400 transition-all"
                  />
                </div>
                
                {/* Filter button */}
                <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm">
                  <Sliders size={14} className="text-slate-400" />
                  <span>Filter</span>
                </button>

                {/* Columns button */}
                <button className="p-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-400">
                  <Columns size={14} />
                </button>
              </div>
            </div>

            {/* Table layout */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4 font-bold">Promotion Name</th>
                    <th className="px-6 py-4 font-bold text-center">Status</th>
                    <th className="px-6 py-4 font-bold">Revenue (Rs.)</th>
                    <th className="px-6 py-4 font-bold">Orders Influenced</th>
                    <th className="px-6 py-4 font-bold">Coupon Usage</th>
                    <th className="px-6 py-4 font-bold text-center">ROI</th>
                    <th className="px-6 py-4 font-bold">Branch</th>
                    <th className="px-6 py-4 font-bold">Start Date</th>
                    <th className="px-6 py-4 font-bold">End Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {paginatedPromotions.length > 0 ? (
                    paginatedPromotions.map((p) => {
                      let badgeVar = 'neutral';
                      if (p.status === 'Active') badgeVar = 'success';
                      else if (p.status === 'Scheduled') badgeVar = 'primary';
                      else if (p.status === 'Expired') badgeVar = 'danger';

                      return (
                        <tr key={p.id} className="hover:bg-blue-50/10 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">
                            {p.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <Badge variant={badgeVar}>{p.status}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-extrabold text-slate-800 font-mono">
                            {p.revenue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-600 font-mono">
                            {p.orders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-600 font-mono">
                            {p.usage}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center font-extrabold text-blue-600 font-mono">
                            {p.roi}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-semibold">
                            {p.branch}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium font-mono">
                            {p.startDate ? new Date(p.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium font-mono">
                            {p.endDate ? new Date(p.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center text-slate-400 select-none">
                        No promotions found matching the active filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/20 flex items-center justify-between text-xs font-bold text-slate-400 select-none">
                <span>Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} Campaigns</span>
                
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-55 flex items-center justify-center transition-colors hover:bg-slate-50"
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    const isActive = currentPage === page;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-lg border transition-all ${
                          isActive
                            ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-55 flex items-center justify-center transition-colors hover:bg-slate-50"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
