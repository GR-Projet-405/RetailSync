import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Button from '../components/Button';
import { ArrowLeft, Printer, Store } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; //QR Code generation library

export default function ReceiptPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Get data passed from the previous page
    const { transaction, customer } = location.state || {};

    if (!transaction) {
        return <Navigate to="/payment-processing" replace />;
    }

    const formatCurrency = (amount) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-GB', options).replace(',', '');
    };

    const shortTxnId = `#TXN-${transaction._id.substring(18).toUpperCase()}`;

    // Use actual items or fallback mock items
    const purchasedItems = transaction.items?.length > 0 ? transaction.items : [
        { id: 1, name: 'Logitech MX Master 3S', qty: 1, price: 11000, total: 11000 },
        { id: 2, name: 'Anker USB-C Braided Cable', qty: 2, price: 1150, total: 2300 },
        { id: 3, name: 'Fantech K211 Keyboard', qty: 1, price: 1900, total: 1900 },
    ];

    // The data that will be shown when the QR code is scanned
    const qrVerificationData = `Receipt: ${shortTxnId}\nTotal: Rs.${formatCurrency(transaction.finalTotal)}\nVerify: https://retailos.com/verify/${transaction._id}`;

    return (
        // print:bg-white and print:p-0 ensures it looks perfect when printing
        <div className="min-h-screen p-6 bg-slate-100 print:bg-white print:p-0 fade-in">

            {/* Top Action Bar (Hidden during print) */}
            <div className="flex items-center justify-between max-w-sm mx-auto mb-6 print:hidden">
                <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2 bg-white border-slate-300">
                    <ArrowLeft size={16} /> Back
                </Button>
                <Button variant="primary" onClick={() => window.print()} className="flex items-center gap-2 shadow-md">
                    <Printer size={16} /> Print Receipt
                </Button>
            </div>

            {/* Thermal Receipt Container */}
            <div className="max-w-[380px] mx-auto bg-white p-8 rounded-xl shadow-xl print:shadow-none print:w-full border border-slate-100 print:border-none text-slate-800">

                {/* Header */}
                <div className="flex flex-col items-center mb-6 text-center">
                    <div className="flex items-center justify-center w-12 h-12 mb-3 text-blue-600 bg-blue-100 rounded-full print:border print:border-slate-300">
                        <Store size={24} />
                    </div>
                    <h1 className="text-xl font-extrabold text-slate-900">RetailOS Pro</h1>
                    <p className="text-sm font-medium text-slate-600">Downtown Flagship Store</p>
                    <p className="text-xs text-slate-500">123 Commerce Str, Colombo 03</p>
                    <p className="text-xs text-slate-500">Tel: +94 11 234 5678</p>
                </div>

                {/* Meta Info */}
                <div className="space-y-1 text-xs font-medium">
                    <div className="flex justify-between"><span className="text-slate-500">Date & Time:</span> <span>{formatDate(transaction.createdAt)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Receipt No:</span> <span>{shortTxnId}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Cashier:</span> <span>Nimal Perera</span></div>
                </div>

                <div className="w-full my-4 border-b-2 border-dashed border-slate-200" />

                {/* Items Table Header */}
                <div className="flex justify-between mb-2 text-xs font-bold tracking-wider text-slate-400">
                    <span>ITEM</span>
                    <span>TOTAL (RS)</span>
                </div>

                {/* Items List */}
                <div className="space-y-3 text-sm">
                    {purchasedItems.map((item, idx) => (
                        <div key={idx} className="flex items-start justify-between">
                            <div className="pr-2">
                                <p className="font-semibold text-slate-800">{item.name}</p>
                                <p className="text-xs text-slate-500">{item.qty} x {formatCurrency(item.price)}</p>
                            </div>
                            <span className="font-semibold text-slate-800">{formatCurrency(item.total)}</span>
                        </div>
                    ))}
                </div>

                <div className="w-full my-4 border-b-2 border-dashed border-slate-200" />

                {/* Subtotals */}
                <div className="space-y-1.5 text-sm font-medium">
                    <div className="flex justify-between">
                        <span className="text-slate-600">Subtotal</span>
                        <span>{formatCurrency(transaction.subTotal)}</span>
                    </div>
                    {transaction.memberDiscount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                            <span>Member Discount</span>
                            <span>- {formatCurrency(transaction.memberDiscount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-slate-600">VAT (15%)</span>
                        <span>{formatCurrency(transaction.taxAmount)}</span>
                    </div>
                </div>

                <div className="w-full my-4 border-b-2 border-dashed border-slate-200" />

                {/* Final Total */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-extrabold uppercase">TOTAL PAID</span>
                    <span className="text-xl font-extrabold text-blue-600">Rs. {formatCurrency(transaction.finalTotal)}</span>
                </div>

                {/* Payment Breakdown */}
                <div className="space-y-1 text-xs font-medium text-slate-600">
                    <div className="flex justify-between">
                        <span>Payment Method</span>
                        <span className="capitalize">{transaction.paymentMethod}</span>
                    </div>
                    {transaction.paymentMethod === 'cash' && (
                        <>
                            <div className="flex justify-between">
                                <span>Tendered</span>
                                <span>Rs. {formatCurrency(transaction.tenderedAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Change</span>
                                <span>Rs. {formatCurrency(transaction.changeDue)}</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="w-full my-4 border-b-2 border-dashed border-slate-200" />

                {/* Loyalty Info */}
                {customer && (
                    <div className="flex flex-col items-center mb-4 text-center">
                        <p className="text-sm font-bold text-slate-800">Customer: {customer.name}</p>
                        {transaction.pointsEarned > 0 && (
                            <p className="text-xs font-semibold text-slate-600">Loyalty Points Earned: {transaction.pointsEarned}</p>
                        )}
                        <p className="text-xs font-semibold text-slate-600">
                            New Points Balance: {(customer.loyaltyPoints || 0) + (transaction.pointsEarned || 0)} Pts
                        </p>
                    </div>
                )}

                {/* Real Dynamic QR Code */}
                <div className="flex flex-col items-center mt-6">
                    <div className="p-2 bg-white border rounded-lg border-slate-200">
                        <QRCodeSVG
                            value={qrVerificationData}
                            size={96}
                            level={"M"}
                            includeMargin={false}
                        />
                    </div>
                    <p className="mt-2 text-[10px] tracking-widest text-slate-500 font-mono">
                        {transaction._id.substring(10).toUpperCase()}
                    </p>
                </div>

                {/* Footer Messages */}
                <div className="mt-6 space-y-1 text-center">
                    <p className="text-xs font-semibold text-slate-800">Thank you for shopping with us!</p>
                    <p className="text-[10px] text-slate-500">Keep this receipt for returns within 30 days.</p>
                    <p className="text-[9px] text-slate-400 mt-2">System Generated Document</p>
                </div>

            </div>
        </div>
    );
}