import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import toast from '../utils/toast';
import { useNavigate } from 'react-router-dom';
import { Wallet, User, ShoppingBag, Lock, Banknote, CreditCard, QrCode, Loader2, Search, Plus, CheckCircle, XCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/v1/payment-processing';

export default function PaymentProcessingPage() {
  // --- PAYMENT STATES ---
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [tenderedInput, setTenderedInput] = useState('');

  // We only store these in the React state for validation. 
  // SECURITY NOTE: For PCI compliance, NEVER send the full card number or CVV to the backend database.
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // --- CUSTOMER STATES ---
  const [customersList, setCustomersList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // --- LOYALTY POINTS STATES ---
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [appliedPointsDiscount, setAppliedPointsDiscount] = useState(0);

  // --- NEW CUSTOMER FORM STATES ---
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');

  // --- LOADING & SUCCESS STATES ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);


  // CALCULATION LOGIC

  const subTotal = 152200;
  const taxAmount = 2100;
  // If a registered customer is selected, give a member discount
  const memberDiscount = selectedCustomer ? 1200 : 0;

  // Final amount dynamically updates if points are applied or member is selected
  const amountDue = (subTotal + taxAmount) - memberDiscount - appliedPointsDiscount;

  // Cash calculations
  const numericTendered = parseFloat(tenderedInput.replace(/,/g, '')) || 0;
  const changeDue = numericTendered >= amountDue ? numericTendered - amountDue : 0;
  const isSufficient = numericTendered >= amountDue;

  // Basic Card Validation (Checks if fields are filled properly)
  const isCardValid = cardName.trim() !== '' && cardNumber.length >= 19 && cardExpiry.length === 5 && cardCvv.length >= 3;

  const formatCurrency = (amount) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Quick cash button handler
  const handleQuickCash = (amount) => setTenderedInput(formatCurrency(amount).replace('.00', ''));

  // Auto-generate logical cash amounts based on the final total
  const getQuickCashSuggestions = (total) => {
    if (total <= 0) return [0, 0, 0, 0];

    const exact = total;

    // next logical cash amounts: next 500, next 1000, next 5000
    let next500 = Math.ceil(total / 500) * 500;
    if (next500 === exact) next500 += 500;

    // next 1000 should be greater than next500, so we check and adjust accordingly
    let next1000 = Math.ceil(total / 1000) * 1000;
    if (next1000 <= next500) next1000 = next500 + 500;

    // next 5000 should be greater than next1000, so we check and adjust accordingly
    let next5000 = Math.ceil(total / 5000) * 5000;
    if (next5000 <= next1000) next5000 = Math.ceil(next1000 / 5000) * 5000;
    if (next5000 <= next1000) next5000 += 5000; // Backup fallback

    return [exact, next500, next1000, next5000];
  };

  // auto-generate quick cash suggestions whenever the amount due changes
  const quickCashOptions = getQuickCashSuggestions(amountDue);

  // Disable process button if conditions are not met
  const isProcessDisabled =
    (paymentMethod === 'cash' && !isSufficient) ||
    (paymentMethod === 'card' && !isCardValid) ||
    (paymentMethod === 'qr') || isProcessing;


  // CUSTOMER & POINTS LOGIC


  // Remove customer and reset everything to Guest mode
  const handleRemoveCustomer = () => {
    setSelectedCustomer(null);
    setPointsToRedeem('');
    setAppliedPointsDiscount(0); // Remove any applied point discounts
    toast.info("Customer removed. Switched to Guest mode.");
  };

  // Apply points to get a discount
  const handleApplyPoints = () => {
    const points = parseInt(pointsToRedeem);

    if (!points || points <= 0) {
      return toast.warning("Please enter a valid point amount.");
    }

    if (points > (selectedCustomer.loyaltyPoints || 0)) {
      return toast.error("Insufficient loyalty points!");
    }

    // Calculation: 10 Points = Rs. 1.00
    const discountValue = points / 10;
    setAppliedPointsDiscount(discountValue);
    toast.success(`Rs. ${formatCurrency(discountValue)} discount applied from points!`);
  };

  // Remove applied points (Allows cashier to edit/cancel points)
  const handleClearPoints = () => {
    setPointsToRedeem('');
    setAppliedPointsDiscount(0);
    toast.info("Applied points removed.");
  };

  // API INTEGRATION FUNCTIONS

  // Search customers in the database
  const fetchCustomers = async (search = '') => {
    setIsLoadingCustomers(true);
    try {
      const response = await fetch(`${API_BASE_URL}/customers?search=${search}`);
      const result = await response.json();
      if (result.success) setCustomersList(result.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  // Auto-search when typing in the modal (with a 0.5s delay to prevent too many requests)
  useEffect(() => {
    if (isCustomerModalOpen) {
      const delayDebounceFn = setTimeout(() => {
        fetchCustomers(customerSearchQuery);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [customerSearchQuery, isCustomerModalOpen]);

  // Save new customer to the database
  const handleAddNewCustomer = async () => {
    if (!newCustName || !newCustPhone) {
      toast.warning("Name and Phone are required!");
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
        toast.success("Customer Added Successfully!");
        setSelectedCustomer(result.data);
        setIsAddCustomerModalOpen(false);
        setNewCustName(''); setNewCustPhone(''); setNewCustEmail('');
      } else {
        toast.error("Failed to add customer. Phone might already exist.");
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error("Something went wrong with the server.");
    }
  };

  // Send Final Payment Data to Backend
  const handleProcessPayment = async () => {
    setIsProcessing(true);

    // SECURITY: We only send the last 4 digits of the card to the database.
    const payload = {
      customerId: selectedCustomer ? selectedCustomer._id : null,
      subTotal: subTotal,
      memberDiscount: memberDiscount,
      taxAmount: taxAmount,
      finalTotal: amountDue,
      pointsRedeemed: appliedPointsDiscount * 10, // Convert Rs back to Points for DB
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
        navigate('/payment-success', {
          state: {
            transaction: result.data,
            customer: selectedCustomer
          }
        });
      } else {
        toast.error("Payment Failed! Please try again.");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Server error occurred. Please check your connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 fade-up">
      <PageHeader title="Checkout & Payment" description="Select a payment method and process the final transaction." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN: Payment Methods */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="min-h-[550px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" /> Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Payment Type Tabs */}
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

              {/* CASH UI */}
              {paymentMethod === 'cash' && (
                <div className="space-y-6 fade-in">
                  <div className="flex items-center justify-between p-4 border border-blue-100 bg-blue-50 rounded-xl">
                    <span className="text-lg font-bold text-blue-800">Amount Due:</span>
                    <span className="text-2xl font-bold text-blue-600">Rs. {formatCurrency(amountDue)}</span>
                  </div>
                  <div>
                    <label className="block mb-3 text-xs font-bold tracking-wider uppercase text-slate-500">Quick Cash</label>
                    <div>
                      <label className="block mb-3 text-xs font-bold tracking-wider uppercase text-slate-500">Quick Cash</label>
                      <div className="grid grid-cols-4 gap-3">
                        <Button onClick={() => handleQuickCash(quickCashOptions[0])} variant="outline" className="h-12 font-bold text-slate-700 border-slate-300 hover:bg-blue-50">Exact</Button>
                        <Button onClick={() => handleQuickCash(quickCashOptions[1])} variant="outline" className="h-12 font-bold text-slate-700 border-slate-300 hover:bg-blue-50">{quickCashOptions[1].toLocaleString('en-US')}</Button>
                        <Button onClick={() => handleQuickCash(quickCashOptions[2])} variant="outline" className="h-12 font-bold text-slate-700 border-slate-300 hover:bg-blue-50">{quickCashOptions[2].toLocaleString('en-US')}</Button>
                        <Button onClick={() => handleQuickCash(quickCashOptions[3])} variant="outline" className="h-12 font-bold text-slate-700 border-slate-300 hover:bg-blue-50">{quickCashOptions[3].toLocaleString('en-US')}</Button>
                      </div>
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

              {/* CARD UI */}
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
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" /> Waiting for payment gateway...
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Customer Profile & Order Summary */}
        <div className="space-y-6 lg:col-span-1">

          {/* Customer Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-blue-600" /> Customer Profile</CardTitle>
                <Button variant="danger" size="sm" onClick={() => setIsCustomerModalOpen(true)} className="text-[10px] px-2 py-1 h-auto flex items-center gap-1">
                  <Search className="w-3 h-3" /> Find Customer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCustomer ? (
                <>
                  <div className="relative flex items-center gap-3 p-3 border border-blue-100 rounded-lg bg-blue-50/50">
                    <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-blue-700 uppercase bg-blue-100 rounded-full">
                      {selectedCustomer.name.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{selectedCustomer.name}</p>
                      <p className="text-xs text-slate-500">{selectedCustomer.phone}</p>
                    </div>
                    {/* Remove Customer Button */}
                    <button onClick={handleRemoveCustomer} className="absolute transition-colors top-2 right-2 text-slate-400 hover:text-red-500" title="Remove Customer">
                      <XCircle size={18} />
                    </button>
                  </div>

                  {/* Points Redemption Section */}
                  <div className="p-3 border rounded-lg bg-amber-50 border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-amber-800">Loyalty Points:</span>
                      <span className="text-sm font-bold text-amber-700">
                        {/* Display remaining points after applying discount */}
                        {(selectedCustomer.loyaltyPoints || 0) - (appliedPointsDiscount * 10)} Pts
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={pointsToRedeem}
                        onChange={(e) => setPointsToRedeem(e.target.value)}
                        placeholder="Points to redeem"
                        className="w-full text-xs px-2 py-1.5 border border-amber-300 rounded outline-none focus:ring-1 focus:ring-amber-400 bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
                        disabled={appliedPointsDiscount > 0} // Disable input if points are already applied
                      />

                      {/* Show 'Remove' button if points are applied, otherwise show 'Apply' */}
                      {appliedPointsDiscount > 0 ? (
                        <Button onClick={handleClearPoints} variant="danger" size="sm" className="h-auto py-1 text-white bg-red-500 border-none hover:bg-red-600">
                          Remove
                        </Button>
                      ) : (
                        <Button onClick={handleApplyPoints} variant="primary" size="sm" className="h-auto py-1 text-white border-none bg-amber-500 hover:bg-amber-600">
                          Apply
                        </Button>
                      )}
                    </div>
                    <p className="text-[9px] text-amber-700/70 mt-1.5 font-medium">* 10 Points = Rs. 1.00</p>
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

          {/* Order Summary Card */}
          <Card>
            <CardHeader className="pb-3 mb-4 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-blue-600" /> Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-medium text-slate-800">Rs. {formatCurrency(subTotal)}</span></div>
                <div className="flex justify-between font-medium text-emerald-600"><span>Member Discount</span><span>- Rs. {formatCurrency(memberDiscount)}</span></div>

                {/* Dynamically show points discount if applied */}
                {appliedPointsDiscount > 0 && (
                  <div className="flex justify-between font-medium text-amber-600">
                    <span>Points Claimed</span>
                    <span>- Rs. {formatCurrency(appliedPointsDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600"><span>VAT(15%)</span><span className="font-medium text-slate-800">Rs. {formatCurrency(taxAmount)}</span></div>
              </div>
              <div className="w-full h-px my-4 bg-slate-200"></div>
              <div className="flex items-end justify-between mb-5">
                <span className="text-lg font-bold text-blue-600">Total</span>
                <span className="text-2xl font-bold text-blue-700">Rs. {formatCurrency(amountDue)}</span>
              </div>

              {/* Main Process Button */}
              <Button onClick={handleProcessPayment} variant="primary" size="lg" disabled={isProcessDisabled} className={`flex items-center justify-center w-full h-12 gap-2 text-base font-bold shadow-lg transition-all ${isProcessDisabled ? 'opacity-50 cursor-not-allowed bg-slate-400' : 'shadow-blue-500/30'}`}>
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {isProcessing ? 'Processing...' : `Process Rs. ${formatCurrency(amountDue)}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODALS */}


      {/* 1. Select Customer Modal */}
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
          <Button variant="outline" className="w-full font-bold border-slate-200 text-slate-600" onClick={() => { handleRemoveCustomer(); setIsCustomerModalOpen(false); }}>
            Continue as Guest
          </Button>
        </div>
      </Modal>

      {/* 2. Add New Customer Modal */}
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