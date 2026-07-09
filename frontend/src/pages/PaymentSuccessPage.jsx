import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Button from '../components/Button';
import { CheckCircle, Printer, Mail, Plus, ArrowRight, Star } from 'lucide-react';
import toast from '../utils/toast';
import { Download } from 'lucide-react';


export default function PaymentSuccessPage() {

    const API_BASE_URL = 'http://localhost:5000/api/v1/payment-processing';

    const location = useLocation();
    const navigate = useNavigate();

    // Get transaction details passed from the checkout page
    const { transaction, customer } = location.state || {};

    // If someone tries to open this page directly without a transaction, redirect them back
    if (!transaction) {
        return <Navigate to="/payment-processing" replace />;
    }

    // Format currency
    const formatCurrency = (amount) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Format Date (e.g., 09 Jun 2026, 14:30)
    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-GB', options).replace(',', '');
    };

    // Generate a short readable TXN ID from the MongoDB ObjectId
    const shortTxnId = `#TXN-${transaction._id.substring(18).toUpperCase()}`;

    const handlePrint = () => {
        window.print();
    };

    const handleEmail = async () => {
        // 1. check if customer email exists
        if (!customer || !customer.email) {
            toast.error("Customer email not found!");
            return;
        }

        toast.info("Sending email... Please wait.");

        // 3. send a POST request to the backend to send the email
        try {
            const response = await fetch(`${API_BASE_URL}/email-receipt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactionId: transaction._id,
                    email: customer.email,
                    shortTxnId: shortTxnId
                })
            });

            const result = await response.json();

            if (result.success) {
                toast.success(`Receipt sent to ${customer.email} successfully!`);
            } else {
                toast.error("Failed to send email. Please try again.");
            }
        } catch (error) {
            console.error("Error sending email:", error);
            toast.error("Server error. Could not send the email.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] p-4 bg-slate-50/50">

            {/* Receipt Card Wrapper */}
            <div className="w-full max-w-lg overflow-hidden bg-white border shadow-xl border-slate-200 rounded-2xl">

                {/* Top Blue Bar & Checkmark */}
                <div className="flex flex-col items-center pt-8 pb-4">
                    <div className="flex items-center justify-center w-24 h-24 mb-4 text-blue-600 bg-blue-100 rounded-full ring-8 ring-blue-50">
                        <CheckCircle size={48} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-800">Payment Successful!</h2>
                    <p className="mt-1 text-slate-500">The transaction has been completed securely.</p>
                </div>

                {/* Transaction Details Box */}
                <div className="px-8 py-6">
                    <div className="p-5 space-y-4 border rounded-xl bg-slate-50 border-slate-100">

                        {/* Row 1: ID & Date */}
                        <div className="flex justify-between">
                            <div>
                                <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">Transaction ID</p>
                                <p className="font-bold text-slate-800">{shortTxnId}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">Date & Time</p>
                                <p className="font-medium text-slate-700">{formatDate(transaction.createdAt)}</p>
                            </div>
                        </div>

                        <div className="w-full h-px bg-slate-200" />

                        {/* Row 2: Payment Method & Total */}
                        <div className="flex justify-between">
                            <div>
                                <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">Payment Method</p>
                                <p className="font-bold capitalize text-slate-800">
                                    {transaction.paymentMethod === 'card' ? `Card ending in ${transaction.cardLastFourDigits}` :
                                        transaction.paymentMethod === 'qr' ? 'LankaQR / Mobile App' : 'Cash'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">Amount Paid</p>
                                <p className="font-bold text-blue-600">Rs. {formatCurrency(transaction.finalTotal)}</p>
                            </div>
                        </div>

                        {/* Row 3: Conditional for Cash */}
                        {transaction.paymentMethod === 'cash' && (
                            <>
                                <div className="flex w-full h-px bg-slate-200" />
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">Tendered Amount</p>
                                        <p className="font-bold text-slate-800">Rs. {formatCurrency(transaction.tenderedAmount)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">Change</p>
                                        <p className="font-bold text-emerald-600">Rs. {formatCurrency(transaction.changeDue)}</p>
                                    </div>
                                </div>
                            </>
                        )}

                    </div>

                    {/* Loyalty Points Banner (Only shows if points were earned) */}
                    {transaction.pointsEarned > 0 && customer && (
                        <div className="flex items-center justify-center gap-2 p-3 mt-4 text-orange-600 border border-orange-200 rounded-lg bg-orange-50">
                            <Star size={18} className="text-orange-500 fill-orange-500" />
                            <p className="text-sm font-semibold">
                                Customer Earned +{transaction.pointsEarned} Loyalty Points!
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-8">
                        <Button onClick={handleEmail} variant="outline" className="flex items-center justify-center flex-1 h-12 gap-2 font-bold border-slate-300 text-slate-700 hover:bg-slate-50">
                            <Mail size={18} /> Email Receipt
                        </Button>
                        <Button
                            onClick={() => navigate('/receipt', { state: { transaction, customer } })}

                            variant="primary" className="flex items-center justify-center flex-1 h-12 gap-2 font-bold shadow-md shadow-blue-500/20">
                            <Printer size={18} /> Print Receipt
                        </Button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center justify-between mt-6">
                        <button onClick={() => navigate('/payment-processing')} className="flex items-center gap-1 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700">
                            <Plus size={16} /> New Sale
                        </button>
                        <button
                            onClick={() => navigate('/transaction-details', { state: { transaction, customer } })}
                            className="flex items-center gap-1 text-sm font-bold transition-colors text-slate-500 hover:text-slate-700"
                        >
                            Go to Details <ArrowRight size={16} />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}