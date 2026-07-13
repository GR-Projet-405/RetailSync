import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import toast from '../utils/toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, User, ShoppingBag, Lock, Banknote, CreditCard, QrCode, Loader2, Search, Plus, CheckCircle, XCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/v1/payment-processing';

export default function PaymentProcessingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- GET LOGGED IN USER ---
  //const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  //const currentUserId = loggedInUser._id || loggedInUser.id || null;


  // --- GET DATA FROM POS BILLING PAGE ---
  // If someone visits this page directly without items, we provide default fallbacks
  const {
    cart = [],
    subtotal = 0,
    itemSavings = 0,
    orderDiscountAmount = 0,
    tax = 0,
    total = 0
  } = location.state || {};

  // --- PAYMENT STATES ---
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [tenderedInput, setTenderedInput] = useState('');

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
  const [newCustFirstName, setNewCustFirstName] = useState('');
  const [newCustLastName, setNewCustLastName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');

  // --- LOADING & SUCCESS STATES ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  // CALCULATION LOGIC (Dynamically from POS)
  const subTotal = subtotal;
  const taxAmount = tax;
  const posDiscounts = itemSavings + orderDiscountAmount; // Discounts applied from POS page

  // If a registered customer is selected, give a member discount
  const memberDiscount = selectedCustomer ? 20 : 0;

  // Final amount dynamically updates (POS total already includes POS discounts & tax)
  // We just subtract the Member Discount & Points Discount
  const amountDue = Math.max(total - memberDiscount - appliedPointsDiscount, 0);

  // Cash calculations
  const numericTendered = parseFloat(tenderedInput.replace(/,/g, '')) || 0;
  const changeDue = numericTendered >= amountDue ? numericTendered - amountDue : 0;
  const isSufficient = numericTendered >= amountDue;

  // Basic Card Validation
  const isCardValid = cardName.trim() !== '' && cardNumber.length >= 19 && cardExpiry.length === 5 && cardCvv.length >= 3;

  const formatCurrency = (amount) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Quick cash button handler
  const handleQuickCash = (amount) => setTenderedInput(formatCurrency(amount).replace('.00', ''));

  // Auto-generate logical cash amounts
  const getQuickCashSuggestions = (totalValue) => {
    if (totalValue <= 0) return [0, 0, 0, 0];
    const exact = totalValue;
    let next500 = Math.ceil(totalValue / 500) * 500;
    if (next500 === exact) next500 += 500;
    let next1000 = Math.ceil(totalValue / 1000) * 1000;
    if (next1000 <= next500) next1000 = next500 + 500;
    let next5000 = Math.ceil(totalValue / 5000) * 5000;
    if (next5000 <= next1000) next5000 = Math.ceil(next1000 / 5000) * 5000;
    if (next5000 <= next1000) next5000 += 5000;
    return [exact, next500, next1000, next5000];
  };

  const quickCashOptions = getQuickCashSuggestions(amountDue);

  const isProcessDisabled =
    (paymentMethod === 'cash' && !isSufficient) ||
    (paymentMethod === 'card' && !isCardValid) ||
    (paymentMethod === 'qr') || isProcessing || amountDue <= 0;

  // CUSTOMER & POINTS LOGIC
  const handleRemoveCustomer = () => {
    setSelectedCustomer(null);
    setPointsToRedeem('');
    setAppliedPointsDiscount(0);
    toast.info("Customer removed. Switched to Guest mode.");
  };

  const handleApplyPoints = () => {
    const points = parseInt(pointsToRedeem);
    if (!points || points <= 0) {
      return toast.warning("Please enter a valid point amount.");
    }
    if (points > (selectedCustomer.loyaltyPoints || 0)) {
      return toast.error("Insufficient loyalty points!");
    }
    const discountValue = points / 10;
    setAppliedPointsDiscount(discountValue);
    toast.success(`Rs. ${formatCurrency(discountValue)} discount applied from points!`);
  };

  const handleClearPoints = () => {
    setPointsToRedeem('');
    setAppliedPointsDiscount(0);
    toast.info("Applied points removed.");
  };

  // API INTEGRATION FUNCTIONS
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

  useEffect(() => {
    if (isCustomerModalOpen) {
      const delayDebounceFn = setTimeout(() => {
        fetchCustomers(customerSearchQuery);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [customerSearchQuery, isCustomerModalOpen]);

  const handleAddNewCustomer = async () => {
    if (!newCustFirstName || !newCustLastName || !newCustPhone) {
      toast.warning("First Name, Last Name and Phone are required!");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newCustFirstName,
          lastName: newCustLastName,
          phone: newCustPhone,
          email: newCustEmail
        })
      });
      const result = await response.json();

      if (result.success) {
        toast.success("Customer Added Successfully!");
        setSelectedCustomer(result.data);
        setIsAddCustomerModalOpen(false);
        setNewCustFirstName(''); setNewCustLastName(''); setNewCustPhone(''); setNewCustEmail('');
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

    // Format cart items to match your Mongoose Schema exactly
    const formattedItems = cart.map(item => {
      const lineTotal = item.price * item.quantity;
      const discountAmt = item.itemDiscountMode === 'percent'
        ? (lineTotal * item.itemDiscount) / 100
        : (item.itemDiscount || 0);
      const lineFinal = Math.max(lineTotal - discountAmt, 0);

      return {
        name: item.name || 'Unknown',
        category: item.category || 'Uncategorised',
        sku: item.sku || 'N/A',
        qty: item.quantity || 1,
        originalPrice: item.price || 0,
        price: item.price || 0,
        total: lineFinal
      };
    });

    const payload = {
      customerId: selectedCustomer ? selectedCustomer._id : null,
      items: formattedItems, // Sending the formatted cart items
      subTotal: subTotal,
      posDiscount: posDiscounts,
      memberDiscount: memberDiscount,
      taxAmount: taxAmount,
      finalTotal: amountDue,
      pointsRedeemed: appliedPointsDiscount * 10,
      paymentMethod: paymentMethod,
      tenderedAmount: paymentMethod === 'cash' ? numericTendered : amountDue,
      changeDue: paymentMethod === 'cash' ? changeDue : 0,
      cardLastFourDigits: paymentMethod === 'card' ? cardNumber.slice(-4) : ''
    };

    //get token from localStorage for authorization
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE_URL}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
                    <div className="grid grid-cols-4 gap-3">
                      <Button onClick={() => handleQuickCash(quickCashOptions[0])} variant="outline" className="h-12 font-bold text-slate-700 border-slate-300 hover:bg-blue-50">Exact</Button>
                      <Button onClick={() => handleQuickCash(quickCashOptions[1])} variant="outline" className="h-12 font-bold text-slate-700 border-slate-300 hover:bg-blue-50">{quickCashOptions[1].toLocaleString('en-US')}</Button>
                      <Button onClick={() => handleQuickCash(quickCashOptions[2])} variant="outline" className="h-12 font-bold text-slate-700 border-slate-300 hover:bg-blue-50">{quickCashOptions[2].toLocaleString('en-US')}</Button>
                      <Button onClick={() => handleQuickCash(quickCashOptions[3])} variant="outline" className="h-12 font-bold text-slate-700 border-slate-300 hover:bg-blue-50">{quickCashOptions[3].toLocaleString('en-US')}</Button>
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
                      {(selectedCustomer.firstName?.charAt(0) || '') + (selectedCustomer.lastName?.charAt(0) || '')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{selectedCustomer.phone}</p>
                    </div>
                    <button onClick={handleRemoveCustomer} className="absolute transition-colors top-2 right-2 text-slate-400 hover:text-red-500" title="Remove Customer">
                      <XCircle size={18} />
                    </button>
                  </div>

                  {/* Points Redemption Section */}
                  <div className="p-3 border rounded-lg bg-amber-50 border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-amber-800">Loyalty Points:</span>
                      <span className="text-sm font-bold text-amber-700">
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
                        disabled={appliedPointsDiscount > 0}
                      />
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

                {/* Dynamically show POS Discounts if any */}
                {posDiscounts > 0 && (
                  <div className="flex justify-between font-medium text-violet-600"><span>POS Discounts</span><span>- Rs. {formatCurrency(posDiscounts)}</span></div>
                )}

                <div className="flex justify-between font-medium text-emerald-600"><span>Member Discount</span><span>- Rs. {formatCurrency(memberDiscount)}</span></div>

                {/* Dynamically show points discount if applied */}
                {appliedPointsDiscount > 0 && (
                  <div className="flex justify-between font-medium text-amber-600">
                    <span>Points Claimed</span>
                    <span>- Rs. {formatCurrency(appliedPointsDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600"><span>TAX</span><span className="font-medium text-slate-800">Rs. {formatCurrency(taxAmount)}</span></div>
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
                    <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-blue-700 uppercase bg-blue-100 rounded-full">
                      {(cust.firstName?.charAt(0) || '') + (cust.lastName?.charAt(0) || '')}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-800">{cust.firstName} {cust.lastName}</p>
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
            <label className="block mb-1.5 text-xs font-bold uppercase text-slate-600">First Name *</label>
            <input type="text" value={newCustFirstName} onChange={(e) => setNewCustFirstName(e.target.value)} placeholder="e.g. Ruwan" className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-bold uppercase text-slate-600">Last Name *</label>
            <input type="text" value={newCustLastName} onChange={(e) => setNewCustLastName(e.target.value)} placeholder="e.g. Silva" className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
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