import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import { ArrowLeft, RefreshCcw, Download, User, MapPin, Tag } from 'lucide-react';

export default function TransactionDetailsPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Get data passed from the success page
    const { transaction, customer } = location.state || {};

    // If no transaction data is found, send them back to payment page
    if (!transaction) {
        return <Navigate to="/payment-processing" replace />;
    }

    const formatCurrency = (amount) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-GB', options).replace(',', '');
    };

    const shortTxnId = `#TXN-${transaction._id.substring(18).toUpperCase()}`;

    // Mock Data for Items (In a real app, this comes from the database transaction.items)
    const purchasedItems = [
        { id: 1, name: 'Logitech MX Master 3S', category: 'Electronics / Peripherals', sku: 'SKU-1002', qty: 1, originalPrice: 12000, price: 11000, total: 11000 },
        { id: 2, name: 'Anker USB-C Braided Cable', category: 'Accessories', sku: 'SKU-5004', qty: 2, originalPrice: 1150, price: 1150, total: 2300 },
        { id: 3, name: 'Fantech K211 Keyboard', category: 'Electronics / Peripherals', sku: 'SKU-8002', qty: 1, originalPrice: 1900, price: 1900, total: 1900 },
    ];

    return (
        <div className="space-y-6 fade-in">

            {/* Top Breadcrumb & Header Area */}
            <div className="flex items-center gap-2 mb-2 text-sm text-slate-500">
                <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/payment-processing')}>Payments</span>
                <span>&gt;</span>
                <span>Payment History</span>
                <span>&gt;</span>
                <span className="font-bold text-slate-700">Transaction Details</span>
            </div>

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-extrabold text-slate-900">Transaction {shortTxnId}</h1>
                    <span className="px-3 py-1 text-xs font-bold text-blue-700 bg-blue-100 rounded-full">Completed</span>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="flex items-center gap-2 font-bold text-red-600 border-red-200 hover:bg-red-50">
                        <RefreshCcw size={16} /> Issue Refund
                    </Button>
                    <Button variant="primary" className="flex items-center gap-2 font-bold shadow-md shadow-blue-500/20">
                        <Download size={16} /> Download Invoice
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-6 mt-4 lg:grid-cols-3">

                {/* Left Column: Purchased Items */}
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader className="pb-4 border-b border-slate-100">
                            <CardTitle className="text-xl font-bold text-slate-800">Purchased Items</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">

                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 py-3 text-xs font-bold tracking-wider uppercase border-b text-slate-400 border-slate-100">
                                <div className="col-span-5">Item Name</div>
                                <div className="col-span-2">SKU</div>
                                <div className="col-span-1 text-center">QTY</div>
                                <div className="col-span-2 text-right">Price</div>
                                <div className="col-span-2 text-right">Total</div>
                            </div>

                            {/* Items List */}
                            <div className="divide-y divide-slate-100">
                                {purchasedItems.map((item) => (
                                    <div key={item.id} className="grid items-center grid-cols-12 gap-4 py-4">
                                        <div className="col-span-5">
                                            <p className="font-bold text-slate-800">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.category}</p>
                                        </div>
                                        <div className="col-span-2 text-sm text-slate-500">{item.sku}</div>
                                        <div className="col-span-1 font-bold text-center text-slate-800">{item.qty}</div>
                                        <div className="col-span-2 text-right">
                                            {item.originalPrice !== item.price && (
                                                <p className="text-xs line-through text-slate-400">Rs. {formatCurrency(item.originalPrice)}</p>
                                            )}
                                            <p className={`text-sm font-bold ${item.originalPrice !== item.price ? 'text-red-500' : 'text-slate-800'}`}>
                                                Rs. {formatCurrency(item.price)}
                                            </p>
                                        </div>
                                        <div className="col-span-2 font-bold text-right text-slate-900">
                                            Rs. {formatCurrency(item.total)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Summaries */}
                <div className="space-y-6 lg:col-span-1">

                    {/* Payment Summary */}
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <p className="mb-1 text-xs font-bold tracking-wider uppercase text-slate-400">Payment Summary</p>
                                <p className="text-3xl font-extrabold text-blue-600">Rs. {formatCurrency(transaction.finalTotal)}</p>
                            </div>

                            <div className="pt-4 space-y-3 text-sm border-t border-slate-100">
                                <div>
                                    <p className="text-slate-500 mb-0.5">Date & Time</p>
                                    <p className="font-bold text-slate-800">{formatDate(transaction.createdAt)}</p>
                                </div>

                                <div>
                                    <p className="text-slate-500 mb-0.5">Payment Method</p>
                                    <div className="flex items-center gap-1.5 font-bold text-slate-800 capitalize">
                                        <Tag size={16} className="text-slate-400" />
                                        {transaction.paymentMethod === 'card' ? `Card ending in ${transaction.cardLastFourDigits}` : transaction.paymentMethod}
                                    </div>
                                </div>

                                {transaction.paymentMethod === 'cash' && (
                                    <>
                                        <div>
                                            <p className="text-slate-500 mb-0.5">Tendered Amount</p>
                                            <p className="font-bold text-slate-800">Rs. {formatCurrency(transaction.tenderedAmount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 mb-0.5">Change Returned</p>
                                            <p className="font-bold text-slate-800">Rs. {formatCurrency(transaction.changeDue)}</p>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <p className="text-slate-500 mb-0.5">Member Discount</p>
                                    <p className="font-bold text-emerald-600">- Rs. {formatCurrency(transaction.memberDiscount)}</p>
                                </div>

                                <div>
                                    <p className="text-slate-500 mb-0.5">VAT(15%)</p>
                                    <p className="font-bold text-red-500">+ Rs. {formatCurrency(transaction.taxAmount)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer & Cashier Profile */}
                    <Card>
                        <CardContent className="pt-6 space-y-5">

                            <div>
                                <p className="mb-3 text-xs font-bold tracking-wider uppercase text-slate-400">Customer Profile</p>
                                {customer ? (
                                    <div className="flex items-center justify-between p-3 border border-blue-100 rounded-lg bg-blue-50/50">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-blue-700 uppercase bg-blue-100 rounded-full">
                                                <User size={16} />
                                            </div>
                                            <p className="text-sm font-semibold text-slate-800">{customer.name}</p>
                                        </div>
                                        <button className="text-xs font-bold text-blue-600 hover:underline">View Profile</button>
                                    </div>
                                ) : (
                                    <div className="p-3 text-sm font-medium border rounded-lg border-slate-200 bg-slate-50 text-slate-500">
                                        Guest Customer
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-bold tracking-wider uppercase text-slate-400">Processed By (Cashier)</p>
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <User size={16} className="text-blue-500" />
                                    Nimal Perera <span className="font-normal text-slate-400">(Downtown Flagship)</span>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}