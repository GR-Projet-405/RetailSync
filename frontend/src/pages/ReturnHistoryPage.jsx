import React, { useState, useEffect } from 'react';
import { Search, Building2, Filter, Calendar } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ReturnHistoryPage() {
  const navigate = useNavigate();
  const location = useLocation();

  
  const initialData = [
    { id: 'RET-0091', date: '09 Jun 2026', receipt: 'TXN-88492A', customer: 'Nimal Silva', cashier: 'Nuwan Silva', amount: '17,480.00', status: 'Approved' },
    { id: 'RET-0090', date: '08 Jun 2026', receipt: 'TXN-88110B', customer: 'Amali Fernando', cashier: 'Kamal Dias', amount: '4,500.00', status: 'Pending' },
    { id: 'RET-0089', date: '07 Jun 2026', receipt: 'TXN-88005C', customer: 'Kasun Perera', cashier: 'Nuwan Silva', amount: '0.00', status: 'Refunded' },
    { id: 'RET-0088', date: '05 Jun 2026', receipt: 'TXN-87999D', customer: 'Walk-in Customer', cashier: 'Kamal Dias', amount: '1,200.00', status: 'Rejected' },
    { id: 'RET-0087', date: '03 Jun 2026', receipt: 'TXN-87668D', customer: 'Nimali Perera', cashier: 'Nuwan Silva', amount: '3,100.00', status: 'Refunded' },
  ];

  const [historyData, setHistoryData] = useState(initialData);

  
  useEffect(() => {
    if (location.state?.updatedReturnId && location.state?.updatedStatus) {
      setHistoryData(prevData =>
        prevData.map(item =>
          item.id === location.state.updatedReturnId
            ? { ...item, status: location.state.updatedStatus }
            : item
        )
      );
    }
  }, [location.state]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved': return 'bg-blue-100 text-blue-600';
      case 'Pending': return 'bg-amber-100 text-amber-600';
      case 'Refunded': return 'bg-emerald-100 text-emerald-600';
      case 'Rejected': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const handleViewClick = (row) => {
    navigate(`/returns/status/${row.id}`, { state: { status: row.status } });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Return & Refund History</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          View all past return requests, approvals, and refund statuses.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[300px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search by Return ID, Receipt ID..." className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"><Building2 size={16} className="text-slate-500"/> Select Branch</button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"><Filter size={16} className="text-slate-500"/> Filter Status</button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"><Calendar size={16} className="text-slate-500"/> Date Range</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Return ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Original Receipt</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Cashier</th>
                <th className="px-6 py-4">Refund Amt</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {historyData.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{row.id}</td>
                  <td className="px-6 py-4">{row.date}</td>
                  <td className="px-6 py-4">{row.receipt}</td>
                  <td className="px-6 py-4">{row.customer}</td>
                  <td className="px-6 py-4">{row.cashier}</td>
                  <td className="px-6 py-4 font-bold">Rs. {row.amount}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${getStatusStyle(row.status)}`}>{row.status}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleViewClick(row)} 
                      className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <div>Showing 5 of 91 results</div>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium">Prev</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-blue-600 bg-blue-50 text-blue-600 font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 font-medium">2</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}