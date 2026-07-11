import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, Clock, ChevronRight, Loader2, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from '../utils/toast'; 

export default function ReturnApprovalsPage() {
    const navigate = useNavigate();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPendingApprovals = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/returns-refunds/history');
                if (response.data.success) {
                    const pendingOnly = response.data.data.filter(
                        (item) => item.status === 'Pending' || item.status === 'Ready for Refund Processing'
                    );
                    setPendingRequests(pendingOnly);
                }
            } catch (error) {
                console.error("Failed to fetch approvals:", error);
                toast.error('Failed to load pending approvals. Please check your connection.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPendingApprovals();
    }, []);

    const filteredRequests = pendingRequests.filter(row =>
        row.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.receipt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 mx-auto space-y-6 max-w-7xl fade-up">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Return Approvals</h1>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                        Review and manage pending customer return requests.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 text-sm font-bold border shadow-sm bg-amber-100 text-amber-700 rounded-xl border-amber-200">
                    <Clock size={18} className="animate-pulse" />
                    {pendingRequests.length} Pending Requests
                </div>
            </div>

            <div className="overflow-hidden bg-white border shadow-sm border-slate-200 rounded-xl">

                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by Return ID or Receipt ID..."
                            className="w-full py-2 pl-10 pr-4 text-sm transition-all bg-white border rounded-lg border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-[400px]">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                            <p className="mt-4 text-sm font-medium text-slate-500">Loading pending requests...</p>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[400px] text-center">
                            <div className="flex items-center justify-center w-16 h-16 mb-4 border rounded-full bg-emerald-50 border-emerald-100">
                                <ClipboardCheck className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">All Caught Up!</h3>
                            <p className="mt-1 text-sm text-slate-500">There are no pending return requests to review at the moment.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Return ID</th>
                                    <th className="px-6 py-4">Request Date</th>
                                    <th className="px-6 py-4">Original Receipt</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Cashier</th>
                                    <th className="px-6 py-4 text-right">Est. Refund</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="font-medium divide-y divide-slate-100 text-slate-700">
                                {filteredRequests.map((row, index) => (
                                    <tr key={index} className="transition-colors hover:bg-blue-50/30 group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                                <span className="font-bold text-slate-900">{row.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{row.date}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-600">{row.receipt}</td>
                                        <td className="px-6 py-4">{row.customer}</td>
                                        <td className="px-6 py-4">{row.cashier}</td>
                                        <td className="px-6 py-4 font-bold text-right text-slate-800">
                                            Rs. {row.amount ? row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => navigate(`/returns/approval/${row.id}`)}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm group-hover:border-blue-600"
                                            >
                                                Review <ChevronRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}