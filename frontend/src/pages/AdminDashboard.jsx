import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  FaBox, FaExclamationTriangle, FaUndo, FaClipboardList, 
  FaShoppingCart, FaUsers, FaChartLine, FaDollarSign 
} from 'react-icons/fa';

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#1d4ed8'];

export default function AdminDashboard() {
  const [viewMode, setViewMode] = useState('weekly');
  const [filterText, setFilterText] = useState(''); // For Filter functionality

  const kpiData = [
    { title: "Total Revenue", value: "Rs. 1.2M", trend: "+12.5%", icon: <FaDollarSign /> },
    { title: "Today's Sales", value: "Rs. 45.2K", trend: "+5.2%", icon: <FaChartLine /> },
    { title: "Total Orders", value: "12.4K", trend: "Stable", icon: <FaShoppingCart /> },
    { title: "Active Branches", value: "24", trend: "+15%", icon: <FaUsers /> },
    { title: "Profit Margin", value: "28.4%", trend: "Target 30%", icon: <FaChartLine /> },
  ];

  const branchPerformanceData = [
    { name: 'Colombo', sales: '342,000', percent: 85 },
    { name: 'Maharagama', sales: '289,500', percent: 70 },
    { name: 'Homagama', sales: '256,500', percent: 60 },
    { name: 'Moratuwa', sales: '179,000', percent: 45 },
    { name: 'Ratnapura', sales: '129,000', percent: 35 },
  ];

  const inventoryData = [
    { label: "TOTAL PRODUCTS", value: "100", color: "text-slate-800" },
    { label: "TOTAL STOCK UNITS", value: "2456", color: "text-slate-800" },
    { label: "LOW STOCK ITEMS", value: "20", color: "text-red-500" },
    { label: "RETURN ITEMS", value: "15", color: "text-slate-800" },
    { label: "PENDING ORDERS", value: "10", color: "text-slate-800" },
  ];

  const weeklyData = [
    { name: 'Week 1', revenue: 1200 }, { name: 'Week 2', revenue: 2100 },
    { name: 'Week 3', revenue: 1800 }, { name: 'Week 4', revenue: 2400 },
    { name: 'Week 5', revenue: 3400 },
  ];

  const monthlyData = [
    { name: 'Jan', revenue: 12000 }, { name: 'Feb', revenue: 14000 },
    { name: 'Mar', revenue: 11000 }, { name: 'Apr', revenue: 19000 },
    { name: 'May', revenue: 22000 }, { name: 'Jun', revenue: 28000 },
    { name: 'Jul', revenue: 25000 }, { name: 'Aug', revenue: 31000 },
    { name: 'Sep', revenue: 29000 }, { name: 'Oct', revenue: 35000 },
    { name: 'Nov', revenue: 33000 }, { name: 'Dec', revenue: 42000 },
  ];

  const revenueTrendData = viewMode === 'weekly' ? weeklyData : monthlyData;

  // --- ACTIVITY DATA ---
  const activityData = [
    { type: "New High-Value Sale", entity: "Downtown Metro", details: "Sale of 4x Premium Workstations (Rs. 40K)", time: "2 mins ago", status: "COMPLETED", bg: "bg-green-100 text-green-700" },
    { type: "Low Stock Alert", entity: "East End Hub", details: "Item: Wireless Earbuds XT-10 units left", time: "15 mins ago", status: "CRITICAL", bg: "bg-red-100 text-red-700" },
    { type: "Employee Login", entity: "North Suburbs", details: "Manager: Sarah Chen clocked in (ID: 8862)", time: "45 mins ago", status: "INACTIVE", bg: "bg-gray-100 text-gray-600" },
    { type: "System Update", entity: "Global Platform", details: "Automated nightly inventory sync completed", time: "3 hours ago", status: "DONE", bg: "bg-blue-100 text-blue-600" },
  ];

  // --- FILTER LOGIC ---
  const filteredActivity = activityData.filter((item) => 
    item.type.toLowerCase().includes(filterText.toLowerCase()) ||
    item.entity.toLowerCase().includes(filterText.toLowerCase()) ||
    item.status.toLowerCase().includes(filterText.toLowerCase())
  );

  // --- EXPORT LOGIC (CSV Download) ---
  const handleExportCSV = () => {
    // Define CSV headers
    const headers = ['Activity Type', 'Branch/Entity', 'Details', 'Timestamp', 'Status'];
    
    // Create CSV rows from filtered data (or all data if no filter)
    const rows = filteredActivity.map(item => [
      item.type, 
      item.entity, 
      item.details, 
      item.time, 
      item.status
    ]);

    // Combine headers and rows into CSV string
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    // Create a download link and trigger click
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `activity_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* --- 0. Welcome Header --- */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, Admin!</h1>
        <p className="text-slate-400 text-sm">Here's what's happening across your retail network today.</p>
      </div>

      {/* --- 1. KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiData.map((item, index) => (
          <div key={index} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-xs font-medium mb-1">{item.title}</p>
                <h3 className="text-xl font-bold text-slate-800">{item.value}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                {item.icon}
              </div>
            </div>
            <div className="mt-3">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full 
                ${item.trend.includes('+') || item.trend.includes('Target') ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-600'}`}>
                {item.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* --- 2. MAIN CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Main Revenue Trend</h3>
              <p className="text-slate-400 text-xs mt-1">Comparative revenue analysis against last quarter</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                  viewMode === 'weekly' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Weekly
              </button>
              <button 
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                  viewMode === 'monthly' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart key={viewMode} data={revenueTrendData}>
                <XAxis dataKey="name" tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center">
          <div className="w-full flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Sales by Category</h3>
              <p className="text-slate-400 text-xs">Distribution of inventory</p>
            </div>
          </div>
          <div className="h-40 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{name: 'Electronics', value: 78}, {name: 'Grocery', value: 40}, {name: 'Clothing', value: 25}]} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value">
                  {[1,2,3].map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full mt-4 text-xs space-y-2">
            <div className="flex justify-between items-center"><span className="text-slate-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Electronics</span><span className="font-medium">78%</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-300"></span> Grocery</span><span className="font-medium">40%</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-100"></span> Clothing</span><span className="font-medium">25%</span></div>
          </div>
        </div>
      </div>

      {/* --- 3. BRANCH PERFORMANCE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <span className="bg-blue-50 p-1 rounded text-blue-600"><FaChartLine /></span> Branch Performance
            </h3>
            <Link to="/branches" className="bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              View All Branches
            </Link>
          </div>
          <div className="space-y-5">
            {branchPerformanceData.map((branch, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{branch.name}</span>
                  <span className="text-slate-600">Rs. {branch.sales}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${branch.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center">
          <h3 className="font-bold text-lg text-slate-800 self-start mb-2">Sales by Branch</h3>
          <p className="text-slate-400 text-xs self-start mb-4">Distribution of inventory sales</p>
          <div className="h-40 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={branchPerformanceData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} dataKey="percent">
                  {branchPerformanceData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full mt-4 text-[10px] space-y-1 text-slate-600">
            {branchPerformanceData.map((item, idx) => (
              <div key={idx} className="flex justify-between"><span><span className="w-2 h-2 inline-block rounded-full mr-1" style={{backgroundColor: COLORS[idx]}}></span> {item.name}</span><span>{item.percent}%</span></div>
            ))}
          </div>
        </div>
      </div>

      {/* --- 4. INVENTORY STATUS CARDS --- */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span className="bg-slate-50 p-1.5 rounded text-slate-600"><FaClipboardList /></span> Inventory Status
          </h3>
          <Link to="/inventory" className="bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            View Inventory
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {inventoryData.map((item, index) => (
            <div key={index} className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.label}</p>
              <p className={`text-2xl font-bold mt-2 ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- 5. RECENT ACTIVITY TABLE WITH FILTER & EXPORT --- */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span className="bg-slate-50 p-1.5 rounded text-slate-600"><FaChartLine /></span> Recent Activity
          </h3>
          
          {/* Filter & Export Area */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
             <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                <span>Filter</span>
                <input 
                  type="text" 
                  placeholder="Type to filter..." 
                  className="w-32 bg-transparent outline-none text-slate-700 text-[11px]"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
             </div>
             
             <button 
               onClick={handleExportCSV}
               className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition cursor-pointer"
             >
               Export
             </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="pb-4 font-semibold pl-2">Activity Type</th>
                <th className="pb-4 font-semibold">Branch/Entity</th>
                <th className="pb-4 font-semibold">Details</th>
                <th className="pb-4 font-semibold">Timestamp</th>
                <th className="pb-4 font-semibold text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredActivity.length > 0 ? (
                filteredActivity.map((act, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
                          <span className="text-xs">
                            {act.type.includes('Sale') ? '🛒' : 
                             act.type.includes('Stock') ? '⚠️' : 
                             act.type.includes('Login') ? '👤' : '⚙️'}
                          </span>
                        </div>
                        <span className="font-medium text-slate-700 text-xs">{act.type}</span>
                      </div>
                    </td>
                    <td className="py-4 text-xs text-slate-500">{act.entity}</td>
                    <td className="py-4 text-xs text-slate-500">{act.details}</td>
                    <td className="py-4 text-xs text-slate-500">{act.time}</td>
                    <td className="py-4 text-right pr-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${act.bg}`}>
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-400 text-sm">
                    No activity found matching "{filterText}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-6 text-center border-t border-slate-50 pt-4">
          <Link to="/audit-log" className="text-blue-600 text-xs font-medium hover:underline">View Full Audit Log</Link>
        </div>
      </div>

    </div>
  );
}