import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import { Wallet, User, ShoppingBag, Lock, Banknote, CreditCard, QrCode, Loader2 } from 'lucide-react';

export default function PaymentProcessingPage() {
  // State to manage the selected payment method (cash, card, qr)
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // States for Cash Payment
  const [tenderedInput, setTenderedInput] = useState('');

  // States for Card Payment
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Fixed total amount for now (later this will come from the cart)
  const amountDue = 16100;

  // --- Cash Calculation Logic ---
  const numericTendered = parseFloat(tenderedInput.replace(/,/g, '')) || 0;
  const changeDue = numericTendered >= amountDue ? numericTendered - amountDue : 0;
  const isSufficient = numericTendered >= amountDue;

  // --- Card Validation Logic ---
  const isCardValid = cardName.trim() !== '' && cardNumber.length >= 19 && cardExpiry.length === 5 && cardCvv.length >= 3;

  // Format currency with commas and 2 decimals
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Handle Quick Cash Buttons
  const handleQuickCash = (amount) => {
    setTenderedInput(formatCurrency(amount).replace('.00', ''));
  };

  // Check if the final process button should be disabled
  const isProcessDisabled =
    (paymentMethod === 'cash' && !isSufficient) ||
    (paymentMethod === 'card' && !isCardValid) ||
    (paymentMethod === 'qr'); // Disable button for QR (waiting for mobile scan)

  return (
    <div className="space-y-6 fade-up">
      {/* Page Header Component */}
      <PageHeader
        title="Checkout & Payment"
        description="Select a payment method and process the final transaction."
      />

      {/* Main Grid Layout: 3 columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Left Column: Payment Method Area (Spans 2 columns) */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="min-h-[550px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>

              {/* Payment Method Tabs */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {/* Cash Tab */}
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${paymentMethod === 'cash'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                >
                  <Banknote className="w-6 h-6" />
                  <span className="text-sm font-bold">Cash Pay</span>
                </button>

                {/* Card Tab */}
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-sm font-bold">Credit/Debit Card</span>
                </button>

                {/* QR Tab */}
                <button
                  onClick={() => setPaymentMethod('qr')}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${paymentMethod === 'qr'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                >
                  <QrCode className="w-6 h-6" />
                  <span className="text-sm font-bold">Mobile / QR</span>
                </button>
              </div>

              {/* --- CASH PAYMENT UI --- */}
              {paymentMethod === 'cash' && (
                <div className="space-y-6 fade-in">
                  <div className="flex items-center justify-between p-4 border border-blue-100 bg-blue-50 rounded-xl">
                    <span className="text-lg font-bold text-blue-800">Amount Due:</span>
                    <span className="text-2xl font-bold text-blue-600">Rs. {formatCurrency(amountDue)}</span>
                  </div>

                  <div>
                    <label className="block mb-3 text-xs font-bold tracking-wider uppercase text-slate-500">
                      Quick Cash
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      <Button onClick={() => handleQuickCash(amountDue)} variant="outline" className="h-12 font-bold text-slate-700 border-slate-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50">Exact</Button>
                      <Button onClick={() => handleQuickCash(16500)} variant="outline" className="h-12 font-bold text-slate-700 border-slate-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50">16,500</Button>
                      <Button onClick={() => handleQuickCash(17000)} variant="outline" className="h-12 font-bold text-slate-700 border-slate-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50">17,000</Button>
                      <Button onClick={() => handleQuickCash(20000)} variant="outline" className="h-12 font-bold text-slate-700 border-slate-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50">20,000</Button>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">
                      Tendered Amount (Rs.)
                    </label>
                    <input
                      type="text"
                      value={tenderedInput}
                      onChange={(e) => {
                        let rawValue = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = rawValue.split('.');
                        if (parts[0]) {
                          parts[0] = parseInt(parts[0], 10).toLocaleString('en-US');
                        }
                        const formattedValue = parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
                        setTenderedInput(formattedValue);
                      }}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 text-xl font-bold transition-all border-2 outline-none text-slate-800 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <div className={`flex justify-between items-center p-4 border rounded-xl transition-colors ${numericTendered > 0 && !isSufficient
                    ? 'bg-red-50 border-red-200'
                    : 'bg-emerald-50 border-emerald-100'
                    }`}>
                    <span className={`font-bold text-lg ${numericTendered > 0 && !isSufficient ? 'text-red-800' : 'text-emerald-800'}`}>
                      {numericTendered > 0 && !isSufficient ? 'Insufficient Amount:' : 'Change Due:'}
                    </span>
                    <span className={`text-2xl font-bold ${numericTendered > 0 && !isSufficient ? 'text-red-600' : 'text-emerald-600'}`}>
                      Rs. {formatCurrency(changeDue)}
                    </span>
                  </div>
                </div>
              )}

              {/* --- CARD PAYMENT UI --- */}
              {paymentMethod === 'card' && (
                <div className="space-y-5 fade-in">
                  <h3 className="mb-4 text-base font-bold text-slate-800">Card Information</h3>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Amal Perera"
                      className="w-full px-4 py-2.5 text-sm transition-all border-2 outline-none text-slate-800 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  {/* Card Number */}
                  <div>
                    <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => {
                        // Format as 0000 0000 0000 0000
                        const val = e.target.value.replace(/\D/g, '');
                        const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                        if (formatted.length <= 19) setCardNumber(formatted);
                      }}
                      placeholder="0000 0000 0000 0000"
                      className="w-full px-4 py-2.5 text-sm transition-all border-2 outline-none text-slate-800 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 tracking-widest"
                    />
                  </div>

                  {/* Expiry Date & CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => {
                          // Format as MM/YY
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length >= 3) {
                            val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                          }
                          if (val.length <= 5) setCardExpiry(val);
                        }}
                        placeholder="MM/YY"
                        className="w-full px-4 py-2.5 text-sm transition-all border-2 outline-none text-slate-800 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 4) setCardCvv(val);
                        }}
                        placeholder="•••"
                        className="w-full px-4 py-2.5 text-sm transition-all border-2 outline-none text-slate-800 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 tracking-widest"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* --- QR PAYMENT UI --- */}
              {paymentMethod === 'qr' && (
                <div className="flex flex-col items-center justify-center py-6 space-y-5 fade-in">
                  <h3 className="text-base font-bold text-slate-800">Scan to Pay via LankaQR / Mobile App</h3>

                  {/* QR Code Graphic Box */}
                  <div className="p-6 bg-white border-2 shadow-sm border-slate-200 rounded-3xl">
                    <QrCode className="w-40 h-40 text-indigo-900" strokeWidth={1.5} />
                  </div>

                  <div className="px-6 py-2 bg-blue-100 rounded-full">
                    <span className="text-lg font-bold text-blue-700">Amount Due: Rs. {formatCurrency(amountDue)}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-sm font-medium text-slate-500">
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    Waiting for customer to scan and pay...
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Customer Profile & Order Summary */}
        <div className="space-y-6 lg:col-span-1">

          {/* Customer Profile Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Customer Profile
                </CardTitle>
                <Button variant="danger" size="sm" className="text-[10px] px-2 py-1 h-auto flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Change / Remove
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 border border-blue-100 rounded-lg bg-blue-50/50">
                <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-blue-700 bg-blue-100 rounded-full">
                  AP
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Amal Perera</p>
                  <p className="text-xs text-slate-500">+9477 123 4567</p>
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-amber-50 border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-800">Loyalty Points Balance:</span>
                  <span className="text-sm font-bold text-amber-700">450 Pts</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Points to redeem"
                    className="w-full text-xs px-2 py-1.5 border border-amber-300 rounded outline-none focus:ring-1 focus:ring-amber-400 bg-white"
                  />
                  <Button variant="primary" size="sm" className="h-auto py-1 text-white border-none bg-amber-500 hover:bg-amber-600">
                    Apply
                  </Button>
                </div>
                <p className="text-[9px] text-amber-700/70 mt-1.5">* 10 Points = Rs. 1.00</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary Card */}
          <Card>
            <CardHeader className="pb-3 mb-4 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal (3 Items)</span>
                  <span className="font-medium text-slate-800">Rs. 15,200.00</span>
                </div>
                <div className="flex justify-between font-medium text-emerald-600">
                  <span>Member Discount</span>
                  <span>- Rs. 1,200.00</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>VAT(15%)</span>
                  <span className="font-medium text-slate-800">Rs. 2,100.00</span>
                </div>
              </div>

              <div className="w-full h-px my-4 bg-slate-200"></div>

              <div className="flex items-end justify-between mb-5">
                <span className="text-lg font-bold text-blue-600">Total</span>
                <span className="text-2xl font-bold text-blue-700">Rs. {formatCurrency(amountDue)}</span>
              </div>

              {/* Process button dynamically disabled based on payment method validation */}
              <Button
                variant="primary"
                size="lg"
                disabled={isProcessDisabled}
                className={`flex items-center justify-center w-full h-12 gap-2 text-base font-bold shadow-lg transition-all ${isProcessDisabled ? 'opacity-50 cursor-not-allowed bg-slate-400' : 'shadow-blue-500/30'}`}
              >
                {paymentMethod === 'qr' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {paymentMethod === 'qr' ? 'Waiting for Payment...' : `Process Rs. ${formatCurrency(amountDue)}`}
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}