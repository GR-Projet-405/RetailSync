import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { RefreshCcw, Download, User, Tag, Star, Phone, Mail, Award, ArrowLeft } from 'lucide-react';

export default function TransactionDetailsPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Modal State for Customer Profile
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // Modal State for Cashier Profile 
    const [isCashierModalOpen, setIsCashierModalOpen] = useState(false);

    // Get data passed from the previous page
    const { transaction, customer, isHistory } = location.state || {};

    // If no transaction data is found, send them back to payment page
    if (!transaction) {
        return <Navigate to="/payment-processing" replace />;
    }

    const formatCurrency = (amount) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-GB', options).replace(',', '');
    };

    const shortTxnId = `#${transaction.receiptId}`;

    // Mock Data for Items
    const purchasedItems = transaction.items?.length > 0 ? transaction.items : [
        { id: 1, name: 'Logitech MX Master 3S', category: 'Electronics / Peripherals', sku: 'SKU-1002', qty: 1, originalPrice: 12000, price: 11000, total: 11000 },
        { id: 2, name: 'Anker USB-C Braided Cable', category: 'Accessories', sku: 'SKU-5004', qty: 2, originalPrice: 1150, price: 1150, total: 2300 },
        { id: 3, name: 'Fantech K211 Keyboard', category: 'Electronics / Peripherals', sku: 'SKU-8002', qty: 1, originalPrice: 1900, price: 1900, total: 1900 },
    ];

    // Calculate points based on navigation source (History vs New Payment)
    const displayPointsBalance = isHistory
        ? (customer?.loyaltyPoints || 0)
        : ((customer?.loyaltyPoints || 0) - (transaction.pointsRedeemed || 0) + (transaction.pointsEarned || 0));

    // get cashier and branch details from transaction
    const cashier = transaction.cashierId || {};
    const cashierFirstName = cashier.firstName || 'Nimal';
    const cashierLastName = cashier.lastName || 'Perera';
    const cashierFullName = `${cashierFirstName} ${cashierLastName}`.trim();

    const branchObj = cashier.branchId || {};
    const branchName = branchObj.branchName || branchObj.name || 'Downtown Flagship';

    console.log("Cashier Object:", cashier);
    console.log("Branch ID/Object:", cashier.branchId);

    return (
        <div className="space-y-6 fade-in">

            {/* Dynamic Top Navigation (Breadcrumbs OR Back Button) */}
            <div className="mb-2">
                {isHistory ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/payment-processing')}>Payments</span>
                        <span>&gt;</span>
                        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/payment-history')}>Payment History</span>
                        <span>&gt;</span>
                        <span className="font-bold text-slate-700">Transaction Details</span>
                    </div>
                ) : (
                    <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-1.5 h-auto text-sm border-slate-300 text-slate-600 bg-white hover:bg-slate-50">
                        <ArrowLeft size={16} /> Back
                    </Button>
                )}
            </div>

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-extrabold text-slate-900">Transaction {shortTxnId}</h1>
                    <span className="px-3 py-1 text-xs font-bold text-blue-700 bg-blue-100 rounded-full">Completed</span>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => navigate('/returns-refunds', { state: { autoLoadReceiptId: transaction.receiptId } })}
                        variant="outline"
                        className="flex items-center gap-2 font-bold text-red-600 border-red-200 hover:bg-red-50"
                    >
                        <RefreshCcw size={16} /> Issue Refund
                    </Button>
                    <Button
                        onClick={() => navigate('/receipt', { state: { transaction, customer, isHistory } })}
                        variant="primary"
                        className="flex items-center gap-2 font-bold shadow-md shadow-blue-500/20"
                    >
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
                                {purchasedItems.map((item, index) => (
                                    <div key={item.id || index} className="grid items-center grid-cols-12 gap-4 py-4">
                                        <div className="col-span-5">
                                            <p className="font-bold text-slate-800">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.category}</p>
                                        </div>
                                        <div className="col-span-2 text-sm text-slate-500">{item.sku}</div>
                                        <div className="col-span-1 font-bold text-center text-slate-800">{item.qty}</div>
                                        <div className="col-span-2 text-right">
                                            {item.originalPrice && item.originalPrice !== item.price && (
                                                <p className="text-xs line-through text-slate-400">Rs. {formatCurrency(item.originalPrice)}</p>
                                            )}
                                            <p className={`text-sm font-bold ${(item.originalPrice && item.originalPrice !== item.price) ? 'text-red-500' : 'text-slate-800'}`}>
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
                                    <p className="text-slate-500 mb-0.5">POS Discount</p>
                                    <p className="font-bold text-purple-600">- Rs. {formatCurrency(transaction.posDiscount)}</p>
                                </div>

                                {transaction.pointsRedeemed > 0 && (
                                    <div>
                                        <p className="text-slate-500 mb-0.5">Points Redeemed</p>
                                        <p className="font-bold text-amber-600">-{transaction.pointsRedeemed} Pts</p>
                                    </div>
                                )}

                                {transaction.pointsEarned > 0 && (
                                    <div>
                                        <p className="text-slate-500 mb-0.5">Points Earned</p>
                                        <p className="font-bold text-orange-500">+{transaction.pointsEarned} Pts</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-slate-500 mb-0.5">TAX</p>
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
                                                {/* Safely generate initials */}
                                                {(customer.firstName?.charAt(0) || '') + (customer.lastName?.charAt(0) || '')}
                                            </div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {customer.firstName} {customer.lastName}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsProfileModalOpen(true)}
                                            className="text-xs font-bold text-blue-600 hover:underline"
                                        >
                                            View Profile
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-3 text-sm font-medium border rounded-lg border-slate-200 bg-slate-50 text-slate-500">
                                        Guest Customer
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-bold tracking-wider uppercase text-slate-400">Processed By</p>
                                <div
                                    onClick={() => setIsCashierModalOpen(true)}
                                    className="flex items-center justify-between p-3 transition-all border border-blue-100 rounded-lg cursor-pointer bg-blue-50/50 hover:bg-blue-100/50 hover:border-blue-300 group"
                                >
                                    <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                                        <User size={18} className="text-blue-500 transition-transform group-hover:scale-110" />
                                        <span>
                                            {cashierFullName} <span className="font-normal text-slate-500">({branchName})</span>
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider opacity-80 group-hover:opacity-100 group-hover:underline">
                                        View
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* --- CUSTOMER PROFILE MODAL --- */}
            {customer && (
                <Modal
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                    title="Customer Details"
                    size="sm"
                >
                    <div className="flex flex-col items-center pt-2 pb-4 space-y-4">
                        <div className="flex items-center justify-center w-20 h-20 text-2xl font-extrabold text-blue-700 uppercase bg-blue-100 rounded-full ring-4 ring-blue-50">
                            {/* Safely generate initials */}
                            {(customer.firstName?.charAt(0) || '') + (customer.lastName?.charAt(0) || '')}
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-800">
                                {customer.firstName} {customer.lastName}
                            </h3>
                            <p className="text-sm text-slate-500">Loyalty Member</p>
                        </div>

                        <div className="w-full pt-4 space-y-3 border-t border-slate-100">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                <Phone size={18} className="text-slate-400" />
                                <span className="text-sm font-bold text-slate-700">{customer.phone}</span>
                            </div>
                            {customer.email && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                    <Mail size={18} className="text-slate-400" />
                                    <span className="text-sm font-bold text-slate-700">{customer.email}</span>
                                </div>
                            )}
                            <div className="flex flex-col gap-1 p-3 border rounded-lg bg-amber-50 border-amber-200">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <Award size={18} className="text-amber-500" />
                                        <span className="text-sm font-bold text-amber-800">
                                            {isHistory ? "Current Balance" : "Updated Balance"}
                                        </span>
                                    </div>
                                    <span className="font-extrabold text-amber-700">
                                        {displayPointsBalance} Pts
                                    </span>
                                </div>

                                <div className="flex justify-between text-[11px] font-medium text-amber-700/60 pl-7">
                                    <span>{isHistory ? "Current Database Balance" : `Previous: ${customer.loyaltyPoints || 0}`}</span>
                                    {transaction.pointsEarned > 0 && <span>Earned: +{transaction.pointsEarned}</span>}
                                    {transaction.pointsRedeemed > 0 && <span>Redeemed: -{transaction.pointsRedeemed}</span>}
                                </div>
                            </div>
                        </div>

                        <Button onClick={() => setIsProfileModalOpen(false)} variant="outline" className="w-full mt-2">
                            Close
                        </Button>
                    </div>
                </Modal>
            )}

            {/* --- CASHIER PROFILE MODAL --- */}
            <Modal
                isOpen={isCashierModalOpen}
                onClose={() => setIsCashierModalOpen(false)}
                title="Cashier Profile"
                size="sm"
            >
                <div className="flex flex-col items-center pt-2 pb-4 space-y-4">

                    {cashier.profileImage ? (
                        <img
                            src={cashier.profileImage}
                            alt="Cashier"
                            className="object-cover w-20 h-20 rounded-full ring-4 ring-blue-50"
                        />
                    ) : (
                        <div className="flex items-center justify-center w-20 h-20 text-2xl font-extrabold text-blue-700 uppercase bg-blue-100 rounded-full ring-4 ring-blue-50">
                            {(cashierFirstName.charAt(0) || '') + (cashierLastName.charAt(0) || '')}
                        </div>
                    )}

                    <div className="text-center">
                        <h3 className="text-xl font-bold text-slate-800">
                            {cashierFullName}
                        </h3>
                        <p className="text-sm text-slate-500">@{cashier.username || 'cashier'}</p>

                        {/* Status Badge */}
                        <span className={`inline-block mt-2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${cashier.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                            {cashier.status || 'ACTIVE'}
                        </span>
                    </div>

                    <div className="w-full pt-4 space-y-3 border-t border-slate-100">
                        {/* Employee ID */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                            <Award size={18} className="text-slate-400" />
                            <span className="w-20 text-xs font-semibold text-slate-500">Emp ID:</span>
                            <span className="text-sm font-bold text-slate-700">{cashier.employeeId || 'N/A'}</span>
                        </div>
                        {/* Phone */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                            <Phone size={18} className="text-slate-400" />
                            <span className="w-20 text-xs font-semibold text-slate-500">Phone:</span>
                            <span className="text-sm font-bold text-slate-700">{cashier.phoneNumber || 'N/A'}</span>
                        </div>
                        {/* Email */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                            <Mail size={18} className="text-slate-400" />
                            <span className="w-20 text-xs font-semibold text-slate-500">Email:</span>
                            <span className="text-sm font-bold truncate text-slate-700">{cashier.email || 'N/A'}</span>
                        </div>
                        {/* Branch */}
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50 border-slate-200">
                            <User size={18} className="text-blue-500" />
                            <span className="w-20 text-xs font-semibold text-slate-500">Branch:</span>
                            <span className="text-sm font-bold text-slate-800">{branchName}</span>
                        </div>
                    </div>

                    <Button onClick={() => setIsCashierModalOpen(false)} variant="outline" className="w-full mt-2">
                        Close
                    </Button>
                </div>
            </Modal>

        </div>
    );
}