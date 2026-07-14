import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import toast from '../utils/toast'; 

export default function ReturnHistoryPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/returns-refunds/history');
        if (response.data.success) {
          setHistoryData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
        toast.error('Failed to load history data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

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
      case 'Approved':
      case 'Ready for Refund Processing': return 'bg-blue-100 text-blue-600';
      case 'Pending': return 'bg-amber-100 text-amber-600';
      case 'Refund Issued':
      case 'Refunded':
      case 'Completed': return 'bg-emerald-100 text-emerald-600';
      case 'Rejected': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const filteredData = historyData.filter(row => {
    const matchesSearch = row.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.receipt.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' ? true :
      (statusFilter === 'Refunded' ? (row.status === 'Refund Issued' || row.status === 'Completed' || row.status === 'Refunded') : row.status.includes(statusFilter));

    const matchesDate = (() => {
      if (!row.date) return true;
      
      const rowDate = new Date(row.date);
      rowDate.setHours(0, 0, 0, 0);

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (rowDate < start) return false;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        if (rowDate > end) return false;
      }

      return true;
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleViewClick = (row) => {
    navigate(`/returns/status/${row.id}`, { state: { status: row.status } });
  };

  const handleClearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="p-6 mx-auto space-y-6 max-w-7xl fade-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Return & Refund History</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          View all past return requests, approvals, and refund statuses.
        </p>
      </div>

      <div className="bg-white border shadow-sm border-slate-200 rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-slate-100">
          <div className="relative flex-1 min-w-[300px] max-w-md">
            <Search className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Return ID, Receipt ID..."
              className="w-full py-2 pl-10 pr-4 text-sm transition-all border rounded-lg border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg outline-none cursor-pointer text-slate-700 border-slate-200 hover:bg-slate-50"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Refunded">Refunded</option>
              <option value="Rejected">Rejected</option>
            </select>

            <div className="flex items-center gap-2 px-3 py-1.5 border rounded-lg border-slate-200 bg-white text-sm">
              <Calendar size={16} className="text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent outline-none text-slate-700 text-xs cursor-pointer focus:text-blue-600"
              />
              <span className="text-slate-400 px-0.5 text-xs font-medium">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent outline-none text-slate-700 text-xs cursor-pointer focus:text-blue-600"
              />
              {(startDate || endDate) && (
                <button
                  onClick={handleClearDates}
                  className="text-xs text-red-500 hover:text-red-700 font-bold ml-2 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="mt-3 text-sm font-medium text-slate-500">Loading history data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-slate-100">
                <Search className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-700">No results found</p>
              <p className="mt-1 text-xs text-slate-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left whitespace-nowrap">
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
              <tbody className="font-medium divide-y divide-slate-100 text-slate-700">
                {filteredData.map((row, index) => (
                  <tr key={index} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-900">{row.id}</td>
                    <td className="px-6 py-4">{row.date}</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">{row.receipt}</td>
                    <td className="px-6 py-4">{row.customer}</td>
                    <td className="px-6 py-4">{row.cashier}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      Rs. {row.amount ? row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${getStatusStyle(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewClick(row)}
                        className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 hover:text-blue-600 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between p-4 text-sm border-t border-slate-100 text-slate-500">
          <div>Showing {filteredData.length} of {historyData.length} results</div>
          <div className="flex items-center gap-1">
            <button disabled={filteredData.length === 0} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium disabled:opacity-50">Prev</button>
            <button className="flex items-center justify-center w-8 h-8 font-bold text-blue-600 border border-blue-600 rounded-lg bg-blue-50">1</button>
            <button disabled={filteredData.length === 0} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}