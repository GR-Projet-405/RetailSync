import React, { useState } from 'react';
import { 
  FaChartLine, FaShoppingCart, FaExchangeAlt, FaClock, 
  FaSearch, FaUser, FaCalendarCheck, FaTasks, FaStar, 
  FaChevronRight
} from 'react-icons/fa';

export default function EmployeeDashboard() {
  
  // --- NEW STATE FOR SEARCH ---
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- MOCK DATA TO SEARCH THROUGH ---
  const mockSalesData = [
    { id: 1, customer: "John Doe", amount: "Rs. 5,200", date: "2026-07-04" },
    { id: 2, customer: "Sarah Smith", amount: "Rs. 12,400", date: "2026-07-04" },
    { id: 3, customer: "Michael Brown", amount: "Rs. 3,800", date: "2026-07-03" },
  ];

  // --- FILTER THE DATA BASED ON WHAT YOU TYPE ---
  const filteredSales = mockSalesData.filter(item => 
    item.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- KPI DATA ---
  const kpiData = [
    { title: "Today's Sales", value: "Rs. 25.2K", trend: "+5.2%", icon: <FaChartLine /> },
    { title: "Today's Transactions", value: "18", trend: "Stable", icon: <FaShoppingCart /> },
    { title: "Average Transaction", value: "Rs. 5.5K", trend: "+12.3%", icon: <FaExchangeAlt /> },
    { title: "Shift Progress", value: "6 / 8 hrs", trend: "Stable", icon: <FaClock /> },
  ];

  // --- PERSONAL PERFORMANCE DATA ---
  const performanceData = [
    { label: "ATTENDANCE RATE", value: "92.5%", icon: <FaCalendarCheck /> },
    { label: "TASKS COMPLETED", value: "18", icon: <FaTasks /> },
    { label: "OVERALL PERFORMANCE", value: "9.2 / 10", icon: <FaStar /> },
  ];

  // --- RECENT ACTIVITY DATA ---
  const activityData = [
    { title: "Sale #HV-1023 completed", details: "Amount: Rs. 14,250", time: "2 hours ago", icon: <FaShoppingCart /> },
    { title: "Checked in at 8:00 AM", details: "Shift start", time: "4 hours ago", icon: <FaClock /> },
  ];

  return (
    <div className="space-y-6 w-full pb-10">
      
      {/* --- WELCOME HEADER --- */}
      <div className="mb-2 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back, John!</h1>
          <p className="text-slate-400 text-sm">Here's what's happening across your retail network today.</p>
        </div>
       <button 
  onClick={() => alert("Shift Started at " + new Date().toLocaleTimeString())}
  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
>
  Start New Shift
</button>
      </div>

      {/* --- 1. KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((item, index) => (
          <div key={index} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">{item.title}</p>
                <h3 className="text-xl font-bold text-slate-800">{item.value}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                {item.icon}
              </div>
            </div>
            <div className="mt-3">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full 
                ${item.trend.includes('+') ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-600'}`}>
                {item.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* --- 2. QUICK ACTIONS (NOW INTERACTIVE) --- */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-slate-600"><FaSearch /></span>
          <h3 className="font-bold text-lg text-slate-800">Quick Actions</h3>
        </div>
        
        {/* SEARCH INPUT FIELD */}
        <div className="flex items-center gap-3 border border-slate-300 rounded-lg p-3 bg-white focus-within:ring-2 focus-within:ring-blue-500 transition shadow-sm">
          <span className="text-slate-400"><FaSearch /></span>
          <input 
            type="text" 
            placeholder="Search Sales History or Customers..." 
            className="w-full outline-none text-sm text-slate-700 bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // This makes it live!
          />
        </div>

        {/* DISPLAY SEARCH RESULTS */}
        {searchQuery && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500 mb-2">Search Results for "{searchQuery}":</p>
            {filteredSales.length > 0 ? (
              <ul className="space-y-2">
                {filteredSales.map((sale) => (
                  <li key={sale.id} className="flex justify-between text-sm text-slate-600 bg-slate-50 p-2 rounded">
                    <span>{sale.customer}</span>
                    <span>{sale.amount} - {sale.date}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No records found.</p>
            )}
          </div>
        )}
      </div>

      {/* --- 3. PERSONAL PERFORMANCE SUMMARY --- */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-slate-600"><FaStar /></span>
          <h3 className="font-bold text-lg text-slate-800">Personal Performance Summary</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {performanceData.map((item, index) => (
            <div key={index} className="flex flex-col items-center p-5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xl text-blue-500 mb-2">{item.icon}</div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- 4. RECENT ACTIVITY --- */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-600"><FaClock /></span>
            <h3 className="font-bold text-lg text-slate-800">Recent Activity</h3>
          </div>
        </div>
        
        <div className="space-y-3">
          {activityData.map((act, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  {act.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{act.title}</p>
                  <p className="text-xs text-slate-500">{act.details}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-400">{act.time}</span>
                <FaChevronRight className="text-slate-300 text-xs" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}