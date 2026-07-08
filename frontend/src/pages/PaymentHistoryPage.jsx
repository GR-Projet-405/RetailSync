import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge'; // Team Lead හදපු Component එක
import { Search, Calendar, Filter, Download, Eye, RotateCcw, MoreVertical, CreditCard, Banknote, QrCode } from 'lucide-react';

export default function PaymentHistoryPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Mock Data based on your UI design 
    // (In a real scenario, this comes from a GET API call to our backend)
    const transactions = [
        { id: '#TXN-88492A', date: '09 Jun 2026, 14:30', customer: 'Amal Perera', method: 'Card', amount: 16100.00, status: 'Completed', rawDate: '2026-06-09T14:30:00' },
        { id: '#TXN-88491B', date: '09 Jun 2026, 13:10', customer: 'Nimal Perera', method: 'Card', amount: 10100.00, status: 'Completed', rawDate: '2026-06-09T13:10:00' },
        { id: '#TXN-88480C', date: '09 Jun 2026, 12:34', customer: 'Shantha Soyza', method: 'Cash', amount: 320.00, status: 'Refunded', rawDate: '2026-06-09T12:34:00' },
        { id: '#TXN-88475D', date: '09 Jun 2026, 11:30', customer: 'Chandanie P', method: 'Card', amount: 948.59, status: 'Completed', rawDate: '2026-06-09T11:30:00' },
        { id: '#TXN-14247F', date: '08 Jun 2026, 17:52', customer: 'Anura Kasun', method: 'QR Pay', amount: 5100.00, status: 'Pending', rawDate: '2026-06-08T17:52:00' },
    ];

    const formatCurrency = (amount) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Function to render the correct icon based on payment method
    const renderMethodIcon = (method) => {
        switch (method) {
            case 'Card': return <CreditCard size={16} className="text-blue-500" />;
            case 'Cash': return <Banknote size={16} className="text-emerald-500" />;
            case 'QR Pay': return <QrCode size={16} className="text-indigo-500" />;
            default: return <CreditCard size={16} />;
        }
    };

    // Function to determine Badge variant based on status
    const getBadgeVariant = (status) => {
        switch (status) {
            case 'Completed': return 'success';
            case 'Refunded': return 'danger';
            case 'Pending': return 'warning';
            default: return 'default';
        }
    };

    // Handle View Details Click
    const handleViewDetails = (txn) => {
        // We simulate passing the transaction data to the details page
        const mockTransactionData = {
            _id: `mockid123456789${txn.id.replace('#TXN-', '').toLowerCase()}`,
            createdAt: txn.rawDate,
            finalTotal: txn.amount,
            paymentMethod: txn.method.toLowerCase().replace(' pay', ''),
            tenderedAmount: txn.amount > 10000 ? 20000 : txn.amount, // Just mock logic
            changeDue: txn.amount > 10000 ? 20000 - txn.amount : 0,
            subTotal: txn.amount,
            taxAmount: 0,
            memberDiscount: 0,
            cardLastFourDigits: '4242'
        };

        navigate('/transaction-details', {
            state: {
                transaction: mockTransactionData,
                customer: { name: txn.customer, phone: '077xxxxxxx', loyaltyPoints: 0 }
            }
        });
    };

    return (
        <div className="space-y-6 fade-up">

            {/* Header section with Breadcrumbs */}
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

                    {/* Top Toolbar (Search & Filters) */}
                    <div className="flex flex-col justify-between gap-4 p-5 border-b md:flex-row md:items-center border-slate-100">
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search size={18} className="text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by Transaction ID, Customer, or Amount..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-2.5 pl-10 pr-4 text-sm transition-all bg-white border outline-none text-slate-900 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="flex items-center gap-2 font-semibold bg-white text-slate-600 border-slate-200">
                                <Calendar size={16} /> Today
                            </Button>
                            <Button variant="outline" className="flex items-center gap-2 font-semibold bg-white text-slate-600 border-slate-200">
                                <Filter size={16} /> Filters
                            </Button>
                            <Button variant="primary" className="flex items-center gap-2 font-bold shadow-md shadow-blue-500/20">
                                <Download size={16} /> Export CSV
                            </Button>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto">
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
                                {transactions.map((txn, index) => (
                                    <tr key={index} className="transition-colors hover:bg-slate-50/80 group">
                                        <td className="p-5 font-bold text-blue-600">{txn.id}</td>
                                        <td className="p-5 font-medium text-slate-600">{txn.date}</td>
                                        <td className="p-5 font-semibold text-slate-700">{txn.customer}</td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 font-medium text-slate-700">
                                                {renderMethodIcon(txn.method)} {txn.method}
                                            </div>
                                        </td>
                                        <td className="p-5 font-extrabold text-slate-900">
                                            Rs. {formatCurrency(txn.amount)}
                                        </td>
                                        <td className="p-5">
                                            <Badge variant={getBadgeVariant(txn.status)}>
                                                {txn.status}
                                            </Badge>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleViewDetails(txn)}
                                                    className="transition-colors text-slate-400 hover:text-blue-600"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {txn.status === 'Completed' ? (
                                                    <button className="transition-colors text-slate-400 hover:text-red-500" title="Refund">
                                                        <RotateCcw size={18} />
                                                    </button>
                                                ) : (
                                                    <span className="w-[18px]"></span> // Placeholder for alignment
                                                )}
                                                <button className="transition-colors text-slate-400 hover:text-slate-700" title="More Options">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between p-5 bg-white border-t border-slate-100 rounded-b-xl">
                        <span className="text-sm font-medium text-slate-500">
                            Showing 1 to 5 of 240 entries
                        </span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="font-semibold bg-white text-slate-600">Prev</Button>
                            <Button variant="outline" size="sm" className="font-bold text-blue-600 border-blue-600 bg-blue-50 w-9">1</Button>
                            <Button variant="outline" size="sm" className="font-semibold bg-white text-slate-600 w-9">2</Button>
                            <Button variant="outline" size="sm" className="font-semibold bg-white text-slate-600">Next</Button>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}