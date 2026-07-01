import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Wallet, User, ShoppingBag, Lock, Banknote, CreditCard, QrCode, Loader2, Search, Plus } from 'lucide-react';

// Backend API URL 
const API_BASE_URL = 'http://localhost:5000/api/v1/payment-processing';

export default function PaymentProcessingPage() {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [tenderedInput, setTenderedInput] = useState('');

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Customer States
  const [customersList, setCustomersList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // New Customer Form States
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');

  // Loading States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  // Fixed amounts (In a real app, these come from the Cart)
  const subTotal = 15200;
  const taxAmount = 2100;
  const memberDiscount = selectedCustomer ? 1200 : 0;
  const amountDue = (subTotal + taxAmount) - memberDiscount;

  const numericTendered = parseFloat(tenderedInput.replace(/,/g, '')) || 0;
  const changeDue = numericTendered >= amountDue ? numericTendered - amountDue : 0;
  const isSufficient = numericTendered >= amountDue;
  const isCardValid = cardName.trim() !== '' && cardNumber.length >= 19 && cardExpiry.length === 5 && cardCvv.length >= 3;

  const formatCurrency = (amount) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const handleQuickCash = (amount) => setTenderedInput(formatCurrency(amount).replace('.00', ''));

  const isProcessDisabled =
    (paymentMethod === 'cash' && !isSufficient) ||
    (paymentMethod === 'card' && !isCardValid) ||
    (paymentMethod === 'qr') || isProcessing;

  // ==========================================
  // API INTEGRATION FUNCTIONS
  // ==========================================

  // 1. Fetch Customers from Database
  const fetchCustomers = async (search = '') => {
    setIsLoadingCustomers(true);
    try {
      const response = await fetch(`${API_BASE_URL}/customers?search=${search}`);
      const result = await response.json();
      if (result.success) {
        setCustomersList(result.data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  // Search when typing in the modal
  useEffect(() => {
    if (isCustomerModalOpen) {
      const delayDebounceFn = setTimeout(() => {
        fetchCustomers(customerSearchQuery);
      }, 500); // Wait 0.5s after user stops typing
      return () => clearTimeout(delayDebounceFn);
    }
  }, [customerSearchQuery, isCustomerModalOpen]);

  // 2. Add New Customer to Database
  const handleAddNewCustomer = async () => {
    if (!newCustName || !newCustPhone) {
      alert("Name and Phone are required!");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCustName, phone: newCustPhone, email: newCustEmail })
      });
      const result = await response.json();

      if (result.success) {
        alert("Customer Added Successfully!");
        setSelectedCustomer(result.data); // Auto-select the new customer
        setIsAddCustomerModalOpen(false);
        setNewCustName(''); setNewCustPhone(''); setNewCustEmail('');
      } else {
        alert("Failed to add customer. Phone might already exist.");
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Something went wrong!");
    }
  };

  // 3. Process Final Payment
  const handleProcessPayment = async () => {
    setIsProcessing(true);

    // Build the payload matching our Backend Transaction Schema
    const payload = {
      customerId: selectedCustomer ? selectedCustomer._id : null,
      subTotal: subTotal,
      memberDiscount: memberDiscount,
      taxAmount: taxAmount,
      finalTotal: amountDue,
      pointsRedeemed: 0, // Placeholder
      paymentMethod: paymentMethod,
      tenderedAmount: paymentMethod === 'cash' ? numericTendered : amountDue,
      changeDue: paymentMethod === 'cash' ? changeDue : 0,
      cardLastFourDigits: paymentMethod === 'card' ? cardNumber.slice(-4) : ''
    };

    try {
      const response = await fetch(`${API_BASE_URL}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        alert("Payment Successful! Bill Created.");
        // Normally you would redirect to a success page here
        window.location.reload();
      } else {
        alert("Payment Failed!");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Server error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 fade-up">
      <PageHeader title="Checkout & Payment" description="Select a payment method and process the final transaction." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="min-h-[550px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Payment Tabs */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <button onClick={() => setPaymentMethod('cash')} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:bg-slate-50'}`}>
                  <Banknote className="w-6 h-6" /> <span className="text-sm font-bold">Cash Pay</span>
                </button>
                <button onClick={() => setPaymentMethod('card')} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:bg-slate-50'}`}>
                  <CreditCard className="w-6 h-6" /> <span className="text-sm font-bold">Credit/Debit Card</span>
                </button>
                <button onClick={() => setPaymentMethod('qr')} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${paymentMethod === 'qr' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:bg-slate-50'}`}>
                  <QrCode className="w-6 h-6" /> <span className="text-sm font-bold">Mobile / QR</span>
                </button>
              </div>

              {/* Cash UI */}
              {paymentMethod === 'cash' && (
                <div className="space-y-6 fade-in">
                  <div className="flex items-center justify-between p-4 border border-blue-100 bg-blue-50 rounded-xl">
                    <span className="text-lg font-bold text-blue-800">Amount Due:</span>
                    <span className="text-2xl font-bold text-blue-600">Rs. {formatCurrency(amountDue)}</span>
                  </div>
                  <div>
                    <label className="block mb-3 text-xs font-bold tracking-wider uppercase text-slate-500">Quick Cash</label>
                    <div className="grid grid-cols-4 gap-3">
                      <Button onClick={() => handleQuickCash(amountDue)} variant="outline" className="h-12 font-bold text-slate-700 border-slate-300">Exact</Button>
                      <Button onClick={() => handleQuickCash(16500)} variant="outline" className="h-12 font-bold text-slate-700 border-slate-300">16,500</Button>
                      <Button onClick={() => handleQuickCash(17000)} variant="outline" className="h-12 font-bold text-slate-700 border-slate-300">17,000</Button>
                      <Button onClick={() => handleQuickCash(20000)} variant="outline" className="h-12 font-bold text-slate-700 border-slate-300">20,000</Button>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Tendered Amount (Rs.)</label>
                    <input type="text" value={tenderedInput} onChange={(e) => {
                      let rawValue = e.target.value.replace(/[^0-9.]/g, '');
                      const parts = rawValue.split('.');
                      if (parts[0]) parts[0] = parseInt(parts[0], 10).toLocaleString('en-US');
                      setTenderedInput(parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0]);
                    }} placeholder="Enter amount" className="w-full px-4 py-3 text-xl font-bold transition-all border-2 outline-none text-slate-800 border-slate-200 rounded-xl focus:border-blue-500" />
                  </div>
                  <div className={`flex justify-between items-center p-4 border rounded-xl transition-colors ${numericTendered > 0 && !isSufficient ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-100'}`}>
                    <span className={`font-bold text-lg ${numericTendered > 0 && !isSufficient ? 'text-red-800' : 'text-emerald-800'}`}>
                      {numericTendered > 0 && !isSufficient ? 'Insufficient Amount:' : 'Change Due:'}
                    </span>
                    <span className={`text-2xl font-bold ${numericTendered > 0 && !isSufficient ? 'text-red-600' : 'text-emerald-600'}`}>
                      Rs. {formatCurrency(changeDue)}
                    </span>
                  </div>
                </div>
              )}

              {/* Card UI */}
              {paymentMethod === 'card' && (
                <div className="space-y-5 fade-in">
                  <h3 className="mb-4 text-base font-bold text-slate-800">Card Information</h3>
                  <div>
                    <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Cardholder Name</label>
                    <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Amal Perera" className="w-full px-4 py-2.5 text-sm transition-all border-2 outline-none text-slate-800 border-slate-200 rounded-xl focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Card Number</label>
                    <input type="text" value={cardNumber} onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                      if (formatted.length <= 19) setCardNumber(formatted);
                    }} placeholder="0000 0000 0000 0000" className="w-full px-4 py-2.5 text-sm transition-all border-2 outline-none text-slate-800 border-slate-200 rounded-xl focus:border-blue-500 tracking-widest" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Expiry Date</label>
                      <input type="text" value={cardExpiry} onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length >= 3) val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                        if (val.length <= 5) setCardExpiry(val);
                      }} placeholder="MM/YY" className="w-full px-4 py-2.5 text-sm transition-all border-2 outline-none text-slate-800 border-slate-200 rounded-xl focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">CVV / CVC</label>
                      <input type="password" value={cardCvv} onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 4) setCardCvv(val);
                      }} placeholder="•••" className="w-full px-4 py-2.5 text-sm transition-all border-2 outline-none text-slate-800 border-slate-200 rounded-xl focus:border-blue-500 tracking-widest" />
                    </div>
                  </div>
                </div>
              )}

              {/* QR UI */}
              {paymentMethod === 'qr' && (
                <div className="flex flex-col items-center justify-center py-6 space-y-5 fade-in">
                  <h3 className="text-base font-bold text-slate-800">Scan to Pay via LankaQR / Mobile App</h3>
                  <div className="p-6 bg-white border-2 shadow-sm border-slate-200 rounded-3xl">
                    <QrCode className="w-40 h-40 text-indigo-900" strokeWidth={1.5} />
                  </div>
                  <div className="px-6 py-2 bg-blue-100 rounded-full">
                    <span className="text-lg font-bold text-blue-700">Amount Due: Rs. {formatCurrency(amountDue)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm font-medium text-slate-500">
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" /> Waiting for customer to scan and pay...
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Customer & Summary */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-blue-600" /> Customer Profile</CardTitle>
                <Button variant="danger" size="sm" onClick={() => setIsCustomerModalOpen(true)} className="text-[10px] px-2 py-1 h-auto flex items-center gap-1">
                  <User className="w-3 h-3" /> {selectedCustomer ? 'Change / Remove' : 'Add Customer'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCustomer ? (
                <>
                  <div className="flex items-center gap-3 p-3 border border-blue-100 rounded-lg bg-blue-50/50">
                    <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-blue-700 uppercase bg-blue-100 rounded-full">
                      {selectedCustomer.name.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{selectedCustomer.name}</p>
                      <p className="text-xs text-slate-500">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg bg-amber-50 border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-amber-800">Loyalty Points:</span>
                      <span className="text-sm font-bold text-amber-700">{selectedCustomer.loyaltyPoints || 0} Pts</span>
                    </div>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Redeem" className="w-full text-xs px-2 py-1.5 border border-amber-300 rounded outline-none focus:ring-1 focus:ring-amber-400 bg-white" />
                      <Button variant="primary" size="sm" className="h-auto py-1 text-white border-none bg-amber-500">Apply</Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed rounded-lg border-slate-200">
                  <User className="w-10 h-10 mb-2 text-slate-300" />
                  <p className="text-sm font-bold text-slate-600">Guest Customer</p>
                  <p className="text-xs text-slate-400">No points will be awarded</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 mb-4 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-blue-600" /> Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-medium text-slate-800">Rs. {formatCurrency(subTotal)}</span></div>
                <div className="flex justify-between font-medium text-emerald-600"><span>Discount</span><span>- Rs. {formatCurrency(memberDiscount)}</span></div>
                <div className="flex justify-between text-slate-600"><span>VAT(15%)</span><span className="font-medium text-slate-800">Rs. {formatCurrency(taxAmount)}</span></div>
              </div>
              <div className="w-full h-px my-4 bg-slate-200"></div>
              <div className="flex items-end justify-between mb-5">
                <span className="text-lg font-bold text-blue-600">Total</span>
                <span className="text-2xl font-bold text-blue-700">Rs. {formatCurrency(amountDue)}</span>
              </div>

              <Button onClick={handleProcessPayment} variant="primary" size="lg" disabled={isProcessDisabled} className={`flex items-center justify-center w-full h-12 gap-2 text-base font-bold shadow-lg transition-all ${isProcessDisabled ? 'opacity-50 cursor-not-allowed bg-slate-400' : 'shadow-blue-500/30'}`}>
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {isProcessing ? 'Processing...' : `Process Rs. ${formatCurrency(amountDue)}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- MODALS --- */}
      <Modal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} title="Select Customer" size="sm">
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 flex items-center pointer-events-none left-3"><Search size={16} className="text-slate-400" /></div>
            <input type="text" placeholder="Search by phone (e.g. 077)" value={customerSearchQuery} onChange={(e) => setCustomerSearchQuery(e.target.value)} className="w-full py-2.5 pl-10 pr-4 text-sm transition-all bg-white border outline-none text-slate-900 border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-100" />
          </div>

          <div className="overflow-y-auto max-h-60 space-y-1.5">
            {isLoadingCustomers ? (
              <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>
            ) : customersList.length > 0 ? (
              customersList.map((cust) => (
                <button key={cust._id} onClick={() => { setSelectedCustomer(cust); setIsCustomerModalOpen(false); }} className="flex items-center justify-between w-full p-3 transition-colors border border-transparent rounded-lg hover:bg-blue-50 hover:border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-blue-700 uppercase bg-blue-100 rounded-full">{cust.name.substring(0, 2)}</div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-800">{cust.name}</p>
                      <p className="text-xs text-slate-500">{cust.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Points</p>
                    <p className="text-sm font-bold text-blue-600">{cust.loyaltyPoints || 0}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="py-4 text-sm text-center text-slate-500">No customers found.</p>
            )}
          </div>

          <button onClick={() => { setIsCustomerModalOpen(false); setIsAddCustomerModalOpen(true); }} className="flex items-center justify-center w-full py-3 text-sm font-bold text-blue-600 transition-colors border-2 border-blue-200 border-dashed rounded-lg hover:bg-blue-50">
            <Plus size={16} className="mr-1.5" /> Add New Customer
          </button>
          <Button variant="outline" className="w-full font-bold border-slate-200 text-slate-600" onClick={() => { setSelectedCustomer(null); setIsCustomerModalOpen(false); }}>
            Continue as Guest
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isAddCustomerModalOpen} onClose={() => setIsAddCustomerModalOpen(false)} title="Add New Customer" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block mb-1.5 text-xs font-bold uppercase text-slate-600">Name *</label>
            <input type="text" value={newCustName} onChange={(e) => setNewCustName(e.target.value)} placeholder="e.g. Ruwan Silva" className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-bold uppercase text-slate-600">Mobile *</label>
            <input type="text" value={newCustPhone} onChange={(e) => setNewCustPhone(e.target.value)} placeholder="e.g. 077 123 4567" className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-bold uppercase text-slate-600">Email</label>
            <input type="email" value={newCustEmail} onChange={(e) => setNewCustEmail(e.target.value)} placeholder="e.g. ruwan@gmail.com" className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { setIsAddCustomerModalOpen(false); setIsCustomerModalOpen(true); }}>Back</Button>
            <Button onClick={handleAddNewCustomer} variant="primary" className="flex-[2]">Save & Select</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}