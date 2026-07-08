import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaBox, FaClipboardList, FaUsers, FaChartLine, FaUserCheck, 
  FaUserClock, FaUserPlus, FaShoppingCart, FaExclamationTriangle, FaDollarSign
} from 'react-icons/fa';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, Tooltip 
} from 'recharts';

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#1d4ed8'];

export default function ManagerDashboard() {
  // --- STATE TO TRACK BUTTON TOGGLE ---
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'yearly'

  // --- STATES TO HOLD BACKEND DATA ---
  const [inventory, setInventory] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH REAL DATA ON PAGE LOAD ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, empRes] = await Promise.all([
          axios.get('http://localhost:5000/api/v1/inventory-management/stats'),
          axios.get('http://localhost:5000/api/v1/employee-management/activity')
        ]);
        
        setInventory(invRes.data);
        setEmployees(empRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- TOP KPI DATA ---
  const kpiData = [
    { title: "TOTAL REVENUE", value: "Rs. 1.2M", trend: "+12.5%", icon: <FaDollarSign />, isGreen: true },
    { title: "TODAY'S SALES", value: "Rs. 45.2K", trend: "+5.2%", icon: <FaChartLine />, isGreen: true },
    { title: "TOTAL ORDERS", value: "1.4K", trend: "Stable", icon: <FaShoppingCart />, isGreen: false },
    { title: "ACTIVE EMPLOYEES", value: "9", trend: "+15%", icon: <FaUsers />, isGreen: true },
    { title: "GROWTH RATE", value: "28.4%", trend: "+2.5%", icon: <FaChartLine />, isGreen: true },
  ];

  // --- TWO DATA ARRAYS FOR CHART TOGGLE ---
  const monthlyData = [
    { name: 'Jan', revenue: 12000 }, { name: 'Feb', revenue: 14000 },
    { name: 'Mar', revenue: 11000 }, { name: 'Apr', revenue: 19000 },
    { name: 'May', revenue: 22000 }, { name: 'Jun', revenue: 28000 },
    { name: 'Jul', revenue: 25000 }, { name: 'Aug', revenue: 31000 },
    { name: 'Sep', revenue: 29000 }, { name: 'Oct', revenue: 35000 },
    { name: 'Nov', revenue: 33000 }, { name: 'Dec', revenue: 42000 },
  ];

  const yearlyData = [
    { name: '2022', revenue: 150000 }, { name: '2023', revenue: 210000 },
    { name: '2024', revenue: 280000 }, { name: '2025', revenue: 350000 },
    { name: '2026', revenue: 420000 },
  ];

  const revenueTrendData = viewMode === 'yearly' ? yearlyData : monthlyData;

  // --- EMPLOYEE STATUS ---
  const employeeStatusData = [
    { label: "TOTAL EMPLOYEES", value: "12", icon: <FaUsers />, color: "text-blue-600" },
    { label: "ACTIVE", value: "9", icon: <FaUserCheck />, color: "text-green-600" },
    { label: "ON LEAVE", value: "3", icon: <FaUserClock />, color: "text-orange-500" },
    { label: "NEW HIRES/MONTH", value: "0", icon: <FaUserPlus />, color: "text-slate-800" },
  ];

  // --- BRANCH SALES ---
  const branchSalesData = [
    { name: 'Colombo', value: 35 }, { name: 'Maharagama', value: 25 },
    { name: 'Homagama', value: 20 }, { name: 'Moratuwa', value: 12 },
    { name: 'Ratnapura', value: 8 },
  ];

  // --- GLOBAL ACTIVITY ---
  const globalActivityData = [
    { icon: <FaShoppingCart className="text-blue-600" />, type: "New High-Value Sale", entity: "Downtown Metro", details: "Sale of 4x Premium Workstations", time: "2 mins ago", status: "COMPLETED", bg: "bg-green-100 text-green-700" },
    { icon: <FaExclamationTriangle className="text-red-600" />, type: "Low Stock Alert", entity: "East End Hub", details: "Wireless Earbuds XT-10 low stock", time: "15 mins ago", status: "CRITICAL", bg: "bg-red-100 text-red-700" },
  ];

  // Show loading spinner while fetching
  if (loading) {
    return <div className="p-10 text-center text-blue-600 font-semibold">Loading Dashboard Data...</div>;
  }

  return (
    <div className="space-y-6 w-full pb-10">
      
      {/* --- WELCOME HEADER --- */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, Branch Manager!</h1>
        <p className="text-slate-400 text-sm">Here's what's happening across your retail network today.</p>
      </div>

      {/* --- TOP 5 KPI BOXES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiData.map((item, index) => (
          <div key={index} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">{item.title}</p>
                <h3 className="text-xl font-bold text-slate-800">{item.value}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-lg">
                {item.icon}
              </div>
            </div>
            <div className="mt-3">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full 
                ${item.isGreen ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-600'}`}>
                {item.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* --- SALES ANALYTICS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Main Revenue Trend</h3>
              <p className="text-slate-400 text-xs mt-1">Comparative revenue analysis against last quarter</p>
            </div>
            <div className="flex gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <button 
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                  viewMode === 'monthly' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setViewMode('yearly')}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                  viewMode === 'yearly' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                Year
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
              <p className="text-slate-400 text-xs">Distribution of inventory sales</p>
            </div>
          </div>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={branchSalesData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} dataKey="value">
                  {branchSalesData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full mt-4 text-xs space-y-2">
             <div className="flex justify-between items-center"><span className="text-slate-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Electronics</span><span className="font-medium">78%</span></div>
             <div className="flex justify-between items-center"><span className="text-slate-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-300"></span> Grocery</span><span className="font-medium">40%</span></div>
          </div>
        </div>
      </div>

      {/* --- EMPLOYEE STATUS CARDS --- */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span className="bg-slate-50 p-1.5 rounded text-slate-600"><FaUsers /></span> Employee Status
          </h3>
          <Link 
            to="/employees"
            className="bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            View Employees
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {employeeStatusData.map((item, index) => (
            <div key={index} className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-lg text-slate-400 mb-1">{item.icon}</div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.label}</p>
              <p className={`text-2xl font-bold mt-1 ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- EMPLOYEE RECENT ACTIVITY --- */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span className="bg-slate-50 p-1.5 rounded text-slate-600"><FaChartLine /></span> Recent Activity
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="pb-4 font-semibold pl-2">Employee</th>
                <th className="pb-4 font-semibold">Department</th>
                <th className="pb-4 font-semibold">Check In</th>
                <th className="pb-4 font-semibold">Check Out</th>
                <th className="pb-4 font-semibold">Working Hours</th>
                <th className="pb-4 font-semibold text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees && employees.map((emp, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-bold">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-slate-700">{emp.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-slate-500">{emp.dept}</td>
                  <td className="py-4 text-slate-500">{emp.checkIn}</td>
                  <td className="py-4 text-slate-500">{emp.checkOut}</td>
                  <td className="py-4 text-slate-500">{emp.hours}</td>
                  <td className="py-4 text-right pr-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${emp.bg}`}>
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-between items-center border-t border-slate-50 pt-4 text-[10px] text-slate-400">
          <span>Showing {employees ? employees.length : 0} of 1248 records</span>
          <Link to="/audit-log" className="text-blue-600 font-medium hover:underline">View All →</Link>
        </div>
      </div>

      {/* --- INVENTORY STATUS --- */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span className="bg-slate-50 p-1.5 rounded text-slate-600"><FaClipboardList /></span> Inventory Status
          </h3>
          {/* CHANGED: <button> to <Link> */}
          <Link 
            to="/inventory"
            className="bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            View Inventory
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">TOTAL PRODUCTS</p>
            <p className="text-2xl font-bold text-slate-800 mt-2">{inventory.totalProducts}</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">TOTAL STOCK UNITS</p>
            <p className="text-2xl font-bold text-slate-800 mt-2">{inventory.totalStockUnits}</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">LOW STOCK ITEMS</p>
            <p className="text-2xl font-bold text-red-500 mt-2">{inventory.lowStockItems}</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">RETURN ITEMS</p>
            <p className="text-2xl font-bold text-slate-800 mt-2">{inventory.returnItems}</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PENDING ORDERS</p>
            <p className="text-2xl font-bold text-slate-800 mt-2">{inventory.pendingOrders}</p>
          </div>
        </div>
      </div>

      {/* --- GLOBAL RECENT ACTIVITY --- */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span className="bg-slate-50 p-1.5 rounded text-slate-600"><FaChartLine /></span> Recent Global Activity
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="pb-4 font-semibold pl-2">Activity Type</th>
                <th className="pb-4 font-semibold">Branch Entity</th>
                <th className="pb-4 font-semibold">Details</th>
                <th className="pb-4 font-semibold">Timestamp</th>
                <th className="pb-4 font-semibold text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {globalActivityData.map((act, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                        {act.icon}
                      </div>
                      <span className="font-medium text-slate-700">{act.type}</span>
                    </div>
                  </td>
                  <td className="py-4 text-slate-500">{act.entity}</td>
                  <td className="py-4 text-slate-500">{act.details}</td>
                  <td className="py-4 text-slate-500">{act.time}</td>
                  <td className="py-4 text-right pr-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${act.bg}`}>
                      {act.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-center border-t border-slate-50 pt-4">
          <Link to="/audit-log" className="text-blue-600 text-xs font-medium hover:underline">View Full Audit Log</Link>
        </div>
      </div>

    </div>
  );
}