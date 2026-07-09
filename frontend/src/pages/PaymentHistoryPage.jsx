import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import toast from '../utils/toast';
import { Search, Calendar, Filter, Download, Eye, RotateCcw, MoreVertical, CreditCard, Banknote, QrCode, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/v1/payment-processing';

export default function PaymentHistoryPage() {
    const navigate = useNavigate();

    // --- Data States ---
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- Filter & Search States ---
    const [searchQuery, setSearchQuery] = useState('');
    const [isTodayFilter, setIsTodayFilter] = useState(false);
    const [activeMethodFilter, setActiveMethodFilter] = useState('All'); // All, Cash, Card, QR
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    // --- UI States ---
    const [openActionId, setOpenActionId] = useState(null); // Track which row's action menu is open
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Fetch Real Data from Database
    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
            try {
                // Assuming you have a GET route for transactions in your backend
                const response = await fetch(`${API_BASE_URL}/transactions`);
                const result = await response.json();
                if (result.success) {
                    setTransactions(result.data);
                }
            } catch (error) {
                console.error("Error fetching transactions:", error);
                toast.error("Failed to load payment history.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const formatCurrency = (amount) => amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-GB', options).replace(',', '');
    };

    // Filter Logic
    const filteredTransactions = transactions.filter(txn => {
        const customerName = txn.customerId?.name || 'Guest';
        const txnId = `#${txn.receiptId}`;

        // 1. Search Filter
        const matchesSearch =
            txnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txn.finalTotal.toString().includes(searchQuery);

        // 2. Today Filter
        let matchesToday = true;
        if (isTodayFilter) {
            const today = new Date().toDateString();
            const txnDate = new Date(txn.createdAt).toDateString();
            matchesToday = today === txnDate;
        }

        // 3. Method Filter
        let matchesMethod = true;
        if (activeMethodFilter !== 'All') {
            matchesMethod = txn.paymentMethod.toLowerCase() === activeMethodFilter.toLowerCase();
        }

        return matchesSearch && matchesToday && matchesMethod;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Export CSV Logic
    const handleExportCSV = () => {
        if (filteredTransactions.length === 0) {
            return toast.warning("No data to export!");
        }

        const headers = ['Transaction ID', 'Date', 'Customer', 'Method', 'Amount', 'Status'];
        const csvRows = [headers.join(',')];

        filteredTransactions.forEach(txn => {
            const id = `#${txn.receiptId}`;
            const date = new Date(txn.createdAt).toLocaleString();
            const customer = txn.customerId?.name || 'Guest';
            const method = txn.paymentMethod;
            const amount = txn.finalTotal;
            const status = 'Completed'; // Update if you add status to DB

            // Wrap strings in quotes to avoid commas breaking the CSV
            csvRows.push(`${id},"${date}","${customer}",${method},${amount},${status}`);
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `Payment_History_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success("CSV Exported Successfully!");
    };

    const handleViewDetails = (txn) => {
        navigate('/transaction-details', {
            state: {
                transaction: txn,
                customer: txn.customerId || null,
                isHistory: true
            }
        });
    };

    const renderMethodIcon = (method) => {
        const m = method.toLowerCase();
        if (m === 'card') return <CreditCard size={16} className="text-blue-500" />;
        if (m === 'cash') return <Banknote size={16} className="text-emerald-500" />;
        if (m === 'qr') return <QrCode size={16} className="text-indigo-500" />;
        return <CreditCard size={16} />;
    };

    return (
        <div className="space-y-6 fade-up">
            <div>
                <div className="flex items-center gap-2 mb-2 text-sm text-slate-500">
                    <span className="cursor-pointer hover:text-blue-600">Payments</span>
                    <span>&gt;</span>
                    <span className="font-bold text-slate-700">Payment History</span>
                </div>
                <PageHeader
                    title="Payment History"
                    description="View and manage all branch transactions and payment records."
                />
            </div>

            <Card>
                <CardContent className="p-0">

                    {/* Top Toolbar */}
                    <div className="flex flex-col justify-between gap-4 p-5 border-b md:flex-row md:items-center border-slate-100">
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search size={18} className="text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by Transaction ID, Customer, or Amount..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1); // Reset page on search
                                }}
                                className="w-full py-2.5 pl-10 pr-4 text-sm transition-all bg-white border outline-none text-slate-900 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Today Filter Toggle */}
                            <Button
                                onClick={() => { setIsTodayFilter(!isTodayFilter); setCurrentPage(1); }}
                                variant="outline"
                                className={`flex items-center gap-2 font-semibold transition-colors ${isTodayFilter ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200'}`}
                            >
                                <Calendar size={16} /> {isTodayFilter ? 'Clear Today' : 'Today'}
                            </Button>

                            {/* Method Filters Dropdown */}
                            <div className="relative">
                                <Button
                                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                                    variant="outline"
                                    className={`flex items-center gap-2 font-semibold transition-colors ${activeMethodFilter !== 'All' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200'}`}
                                >
                                    <Filter size={16} /> {activeMethodFilter !== 'All' ? activeMethodFilter : 'Filters'}
                                </Button>

                                {showFilterMenu && (
                                    <div className="absolute right-0 z-10 w-40 mt-2 bg-white border shadow-lg rounded-xl border-slate-100 p-1.5">
                                        {['All', 'Cash', 'Card', 'QR'].map(method => (
                                            <button
                                                key={method}
                                                onClick={() => { setActiveMethodFilter(method); setShowFilterMenu(false); setCurrentPage(1); }}
                                                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeMethodFilter === method ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                {method === 'All' ? 'All Methods' : method}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Button onClick={handleExportCSV} variant="primary" className="flex items-center gap-2 font-bold shadow-md shadow-blue-500/20">
                                <Download size={16} /> Export CSV
                            </Button>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto min-h-[300px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs font-bold tracking-wider uppercase border-b text-slate-400 border-slate-100 bg-slate-50/50">
                                    <th className="p-5 font-bold">Transaction ID</th>
                                    <th className="p-5 font-bold">Date & Time</th>
                                    <th className="p-5 font-bold">Customer</th>
                                    <th className="p-5 font-bold">Method</th>
                                    <th className="p-5 font-bold">Amount</th>
                                    <th className="p-5 font-bold">Status</th>
                                    <th className="p-5 font-bold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr><td colSpan="7" className="py-10 text-center text-slate-500">Loading transactions...</td></tr>
                                ) : paginatedTransactions.length === 0 ? (
                                    <tr><td colSpan="7" className="py-10 text-center text-slate-500">No transactions found.</td></tr>
                                ) : (
                                    paginatedTransactions.map((txn) => {
                                        const txnId = `#${txn.receiptId}`;

                                        return (
                                            <tr key={txn._id} className="transition-colors hover:bg-slate-50/80 group">
                                                <td className="p-5 font-bold text-blue-600">{txnId}</td>
                                                <td className="p-5 font-medium text-slate-600">{formatDate(txn.createdAt)}</td>
                                                <td className="p-5 font-semibold text-slate-700">{txn.customerId?.name || 'Guest'}</td>
                                                <td className="p-5">
                                                    <div className="flex items-center gap-2 font-medium capitalize text-slate-700">
                                                        {renderMethodIcon(txn.paymentMethod)} {txn.paymentMethod}
                                                    </div>
                                                </td>
                                                <td className="p-5 font-extrabold text-slate-900">
                                                    Rs. {formatCurrency(txn.finalTotal)}
                                                </td>
                                                <td className="p-5">
                                                    {/* Using Badge Component */}
                                                    <Badge variant="success">Completed</Badge>
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex items-center justify-center min-w-[70px]">
                                                        {/* ACTION TOGGLE LOGIC */}
                                                        {openActionId === txn._id ? (
                                                            <div className="flex items-center gap-3 px-2 py-1 duration-200 bg-white border rounded-lg shadow-sm border-slate-200 animate-in fade-in zoom-in">
                                                                <button
                                                                    onClick={() => handleViewDetails(txn)}
                                                                    className="transition-colors text-slate-400 hover:text-blue-600"
                                                                    title="View Details"
                                                                >
                                                                    <Eye size={18} />
                                                                </button>
                                                                <button className="transition-colors text-slate-400 hover:text-red-500" title="Refund">
                                                                    <RotateCcw size={18} />
                                                                </button>
                                                                {/* Close Icon to hide actions */}
                                                                <button onClick={() => setOpenActionId(null)} className="pl-1 border-l text-slate-400 hover:text-slate-700 border-slate-200">
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setOpenActionId(txn._id)}
                                                                className="transition-colors text-slate-400 hover:text-slate-700"
                                                                title="More Options"
                                                            >
                                                                <MoreVertical size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between p-5 bg-white border-t border-slate-100 rounded-b-xl">
                        <span className="text-sm font-medium text-slate-500">
                            Showing {filteredTransactions.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} entries
                        </span>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                variant="outline" size="sm" className="font-semibold bg-white text-slate-600 disabled:opacity-50"
                            >
                                Prev
                            </Button>

                            {/* Simple Page Numbers */}
                            {[...Array(totalPages)].map((_, i) => (
                                <Button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    variant="outline" size="sm"
                                    className={`w-9 font-bold ${currentPage === i + 1 ? 'text-blue-600 border-blue-600 bg-blue-50' : 'bg-white text-slate-600'}`}
                                >
                                    {i + 1}
                                </Button>
                            ))}

                            <Button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                variant="outline" size="sm" className="font-semibold bg-white text-slate-600 disabled:opacity-50"
                            >
                                Next
                            </Button>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}