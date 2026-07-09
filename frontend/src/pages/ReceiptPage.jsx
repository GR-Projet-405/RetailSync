import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Button from '../components/Button';
import { ArrowLeft, Printer, Store } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ReceiptPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Retrieve data passed from the previous component
    const { transaction, customer, isHistory } = location.state || {};

    // Redirect to payments page if directly accessed without transaction data
    if (!transaction) {
        return <Navigate to="/payment-processing" replace />;
    }

    // Utility function to format numbers as currency
    const formatCurrency = (amount) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Utility function to format dates
    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-GB', options).replace(',', '');
    };

    // Construct the short transaction ID using the custom receiptId
    const shortTxnId = `#${transaction.receiptId}`;

    // Fallback items array just in case database items are missing
    const purchasedItems = transaction.items?.length > 0 ? transaction.items : [
        { id: 1, name: 'Logitech MX Master 3S', qty: 1, price: 11000, total: 11000 },
        { id: 2, name: 'Anker USB-C Braided Cable', qty: 2, price: 1150, total: 2300 },
        { id: 3, name: 'Fantech K211 Keyboard', qty: 1, price: 1900, total: 1900 },
    ];

    // Clean, structured data for the QR scanner to read easily
    const qrVerificationData = `Receipt ID: ${shortTxnId}\nTotal: Rs. ${formatCurrency(transaction.finalTotal)}\nDate: ${formatDate(transaction.createdAt)}`;

    return (
        <>
            {/* Print-specific CSS to force 80mm POS formatting */}
            <style>
                {`
                    @media print {
                        @page {
                            margin: 0; 
                            size: 80mm auto; /* Standard POS thermal paper width */
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            background-color: white !important;
                            -webkit-print-color-adjust: exact; 
                            print-color-adjust: exact;
                        }
                        
                        /* Hide elements that should not be printed */
                        .no-print {
                            display: none !important;
                        }

                        /* Force the receipt container to strictly fit 80mm */
                        .thermal-receipt-container {
                            width: 80mm !important;
                            max-width: 80mm !important;
                            padding: 5mm !important; /* Standard POS margins */
                            margin: 0 !important; 
                            box-shadow: none !important;
                            border: none !important;
                            page-break-after: auto;
                        }
                        
                        /* Reset background for the wrapper during print */
                        .print-wrapper {
                            min-height: 0 !important;
                            padding: 0 !important;
                            background: white !important;
                            display: block !important;
                        }
                    }
                `}
            </style>

            {/* Main Application Wrapper */}
            <div className="min-h-screen p-6 print-wrapper bg-slate-100 fade-in">

                {/* Top Action Bar (Hidden on actual print) */}
                <div className="flex items-center justify-between max-w-sm mx-auto mb-6 no-print">
                    <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2 bg-white border-slate-300">
                        <ArrowLeft size={16} /> Back
                    </Button>
                    <Button variant="primary" onClick={() => window.print()} className="flex items-center gap-2 shadow-md">
                        <Printer size={16} /> Print Receipt
                    </Button>
                </div>

                {/* Thermal Receipt Container - Styled for B&W POS printing */}
                <div className="thermal-receipt-container max-w-[350px] mx-auto bg-white p-6 rounded-none sm:rounded-xl shadow-xl border border-slate-200 text-black">

                    {/* Store Header */}
                    <div className="flex flex-col items-center mb-5 text-center">
                        <div className="flex items-center justify-center w-12 h-12 mb-2 text-black border-2 border-black rounded-full print:hidden">
                            <Store size={22} />
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight text-black uppercase">RetailOS Pro</h1>
                        <p className="text-xs font-bold text-gray-800 mt-0.5">Downtown Flagship Store</p>
                        <p className="text-[10px] text-gray-600 mt-0.5">123 Commerce Str, Colombo 03</p>
                        <p className="text-[10px] text-gray-600">Tel: +94 11 234 5678</p>
                    </div>

                    {/* Transaction Meta Information */}
                    <div className="space-y-1 text-[11px] font-medium text-black">
                        <div className="flex justify-between"><span>Date:</span> <span className="font-bold">{formatDate(transaction.createdAt)}</span></div>
                        <div className="flex justify-between"><span>Receipt No:</span> <span className="font-bold">{shortTxnId}</span></div>
                        <div className="flex justify-between"><span>Cashier:</span> <span className="font-bold">Nimal Perera</span></div>
                    </div>

                    {/* Standard POS Dashed Line */}
                    <div className="w-full my-3 border-b border-gray-400 border-dashed" />

                    {/* Items Table Header */}
                    <div className="flex justify-between mb-2 text-[10px] font-extrabold tracking-wider uppercase text-black">
                        <span>ITEM</span>
                        <span>TOTAL (RS)</span>
                    </div>

                    {/* Purchased Items List */}
                    <div className="space-y-2.5 text-[12px] text-black">
                        {purchasedItems.map((item, idx) => (
                            <div key={idx} className="flex items-start justify-between">
                                <div className="pr-2 leading-tight">
                                    <p className="font-bold">{item.name}</p>
                                    <p className="text-[10px] font-medium mt-0.5">{item.qty} x {formatCurrency(item.price)}</p>
                                </div>
                                <span className="font-bold pt-0.5">{formatCurrency(item.total)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="w-full my-3 border-b border-gray-400 border-dashed" />

                    {/* Subtotals Section */}
                    <div className="space-y-1 text-[11px] font-bold text-black">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatCurrency(transaction.subTotal)}</span>
                        </div>
                        {transaction.memberDiscount > 0 && (
                            <div className="flex justify-between">
                                <span>Discount</span>
                                <span>- {formatCurrency(transaction.memberDiscount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>VAT (15%)</span>
                            <span>{formatCurrency(transaction.taxAmount)}</span>
                        </div>
                    </div>

                    <div className="w-full my-3 border-b border-gray-400 border-dashed" />

                    {/* Final Total Section */}
                    <div className="flex items-center justify-between mb-3 text-black">
                        <span className="text-[13px] font-extrabold uppercase">TOTAL</span>
                        <span className="text-[16px] font-black">Rs. {formatCurrency(transaction.finalTotal)}</span>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="space-y-0.5 text-[10px] font-bold text-black">
                        <div className="flex justify-between">
                            <span>Method</span>
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

                    <div className="w-full my-3 border-b border-gray-400 border-dashed" />

                    {/* Loyalty Customer Information */}
                    {customer && (
                        <div className="flex flex-col items-center mb-4 text-center text-black">
                            <p className="text-[11px] font-extrabold">Customer: {customer.name}</p>
                            {transaction.pointsEarned > 0 && (
                                <p className="text-[10px] font-bold mt-0.5">Points Earned: +{transaction.pointsEarned}</p>
                            )}
                            {transaction.pointsRedeemed > 0 && (
                                <p className="text-[10px] font-bold">Points Redeemed: -{transaction.pointsRedeemed}</p>
                            )}
                            <p className="mt-1 text-[11px] font-extrabold">
                                Balance: {isHistory
                                    ? (customer.loyaltyPoints || 0)
                                    : ((customer.loyaltyPoints || 0) - (transaction.pointsRedeemed || 0) + (transaction.pointsEarned || 0))
                                } Pts
                            </p>
                        </div>
                    )}

                    {/* Enlarged QR Code for easy scanning */}
                    <div className="flex flex-col items-center mt-5">
                        <QRCodeSVG
                            value={qrVerificationData}
                            size={100} /* Increased size for reliability */
                            level={"M"}
                            includeMargin={false}
                        />
                        <p className="mt-2 text-[9px] tracking-widest text-black font-mono font-bold">
                            {transaction.receiptId}
                        </p>
                    </div>

                    {/* Footer Policy Messages */}
                    <div className="mt-5 space-y-1 text-center text-black">
                        <p className="text-[11px] font-bold">Thank you for shopping!</p>
                        <p className="text-[9px]">Returns valid within 30 days.</p>
                        <p className="text-[8px] font-medium mt-2">System Generated Document</p>
                    </div>

                </div>
            </div>
        </>
    );
}