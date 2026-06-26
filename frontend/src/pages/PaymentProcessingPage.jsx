import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import { Wallet, User, ShoppingBag, Lock, Banknote, CreditCard, QrCode } from 'lucide-react';

export default function PaymentProcessingPage() {
  // State to manage the selected payment method (cash, card, qr)
  const [paymentMethod, setPaymentMethod] = useState('cash');

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
          <Card>
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

              {/* Dynamic Content based on selected tab */}

              {/* --- CASH PAYMENT UI --- */}
              {paymentMethod === 'cash' && (
                <div className="space-y-6 fade-in">

                  {/* Amount Due Display */}
                  <div className="flex items-center justify-between p-4 border border-blue-100 bg-blue-50 rounded-xl">
                    <span className="text-lg font-bold text-blue-800">Amount Due:</span>
                    <span className="text-2xl font-bold text-blue-600">Rs. 16,100.00</span>
                  </div>

                  {/* Quick Cash Buttons */}
                  <div>
                    <label className="block mb-3 text-xs font-bold tracking-wider uppercase text-slate-500">
                      Quick Cash
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      <Button variant="outline" className="h-12 font-bold text-slate-700 border-slate-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50">Exact</Button>
                      <Button variant="outline" className="h-12 font-bold text-slate-700 border-slate-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50">16,500</Button>
                      <Button variant="outline" className="h-12 font-bold text-slate-700 border-slate-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50">17,000</Button>
                      <Button variant="outline" className="h-12 font-bold text-slate-700 border-slate-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50">20,000</Button>
                    </div>
                  </div>

                  {/* Tendered Amount Input */}
                  <div>
                    <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">
                      Tendered Amount (Rs.)
                    </label>
                    <input
                      type="text"
                      defaultValue="17,000.00"
                      className="w-full px-4 py-3 text-xl font-bold transition-all border-2 outline-none text-slate-800 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  {/* Change Due Display */}
                  <div className="flex items-center justify-between p-4 border bg-emerald-50 border-emerald-100 rounded-xl">
                    <span className="text-lg font-bold text-emerald-800">Change Due:</span>
                    <span className="text-2xl font-bold text-emerald-600">Rs. 900.00</span>
                  </div>

                </div>
              )}

              {/* --- CARD PAYMENT UI (Placeholder for now) --- */}
              {paymentMethod === 'card' && (
                <div className="p-12 font-medium text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 fade-in">
                  Card Payment Interface will go here
                </div>
              )}

              {/* --- QR PAYMENT UI (Placeholder for now) --- */}
              {paymentMethod === 'qr' && (
                <div className="p-12 font-medium text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 fade-in">
                  Mobile / QR Scanner will go here
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Customer Profile & Order Summary (Spans 1 column) */}
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
              {/* Customer Info Display */}
              <div className="flex items-center gap-3 p-3 border border-blue-100 rounded-lg bg-blue-50/50">
                <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-blue-700 bg-blue-100 rounded-full">
                  AP
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Amal Perera</p>
                  <p className="text-xs text-slate-500">+9477 123 4567</p>
                </div>
              </div>

              {/* Loyalty Points Section */}
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
              {/* Bill Calculations */}
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

              {/* Divider Line */}
              <div className="w-full h-px my-4 bg-slate-200"></div>

              {/* Final Total Amount */}
              <div className="flex items-end justify-between mb-5">
                <span className="text-lg font-bold text-blue-600">Total</span>
                <span className="text-2xl font-bold text-blue-700">Rs. 16,100.00</span>
              </div>

              {/* Process Payment Button */}
              <Button variant="primary" size="lg" className="flex items-center justify-center w-full h-12 gap-2 text-base font-bold shadow-lg shadow-blue-500/30">
                <Lock className="w-4 h-4" />
                Process Rs. 16,100.00
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}