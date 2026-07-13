import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Search, User, CreditCard, Banknote, Smartphone,
  CheckCircle2, AlertCircle, Receipt, X, ShoppingBag,
  Wallet, Clock, Shield, Gift, Phone, Mail, MapPin,
  Star, TrendingUp, Award, Sparkles, ChevronRight,
  CircleDollarSign, ScanLine, QrCode, Fingerprint
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
import { useCustomers } from '../features/customer-management/hooks/useCustomers';
import { useAuth } from '../contexts/AuthContext';

const currency = {
  format: (value) => `Rs. ${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`,
};

const getTierColor = (tier) => {
  const colors = {
    Bronze: 'from-amber-600 to-amber-700',
    Silver: 'from-gray-400 to-gray-500',
    Gold: 'from-yellow-400 to-yellow-600',
    Platinum: 'from-cyan-400 to-cyan-600',
    Diamond: 'from-blue-400 to-blue-600'
  };
  return colors[tier] || 'from-gray-400 to-gray-500';
};

export default function POSCheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const state = location.state || {};
  const {
    cart = [],
    subtotal = 0,
    itemSavings = 0,
    orderDiscountAmount = 0,
    tax = 0,
    total = 0,
    totalUnits = 0,
    orderDiscount = '',
    orderDiscountMode = 'none',
    taxRate = 0,
  } = state;

  const [customerSearch, setCustomerSearch] = useState('');
  const [isWalkIn, setIsWalkIn] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [cardType, setCardType] = useState('Visa');
  const [walletType, setWalletType] = useState('Dialog');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Keep total with 2 decimal places for display and calculations
  const roundedTotal = Math.round(total * 100) / 100;

  // Parse the amount received, default to 0 if invalid
  const numReceived = parseFloat(amountReceived) || 0;

  // Calculate change, shortfall, and exact status using rounded values
  const changeDue = numReceived > roundedTotal ? numReceived - roundedTotal : 0;
  const shortfall = numReceived > 0 && numReceived < roundedTotal ? roundedTotal - numReceived : 0;

  // FIXED: Exact amount check - only true when received amount equals rounded total
  const isExact = numReceived > 0 && numReceived === roundedTotal;

  const { customers = [], loading: customersLoading } = useCustomers({
    search: customerSearch,
    limit: 20
  });

  // Map database customers to UI expected customer schema
  const filteredCustomers = customers.map(customer => ({
    id: customer._id,
    name: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
    phone: customer.phone,
    email: customer.email,
    points: customer.loyaltyPoints ?? 0,
    tier: customer.customerType ?? 'Regular',
  }));

  const handleCompletePayment = async () => {
    if (paymentMethod === 'cash' && numReceived < roundedTotal) return;

    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    navigate('/pos-receipt', {
      state: {
        ...state,
        paymentMethod,
        amountReceived: numReceived,
        changeDue,
        customer: selectedCustomer,
        invoiceNumber: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        cashierName: user 
          ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email 
          : 'Nipuni Perera',
        counterNumber: '01'
      }
    });
  };

  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleNewSale = () => {
    setShowCancelModal(true);
  };

  const confirmCancelSale = () => {
    setShowCancelModal(false);
    navigate('/pos-billing', {
      state: {
        cart: [],
        orderDiscount: '',
        orderDiscountMode: 'none',
        taxRate: 0
      }
    });
  };

  // Quick amount buttons for cash payment
  const quickAmounts = [1000, 2000, 5000, 10000];

  // Helper function to set exact amount - formatted to 2 decimals
  const setExactAmount = () => {
    const exactAmount = Math.round(total * 100) / 100;
    setAmountReceived(exactAmount.toFixed(2));
  };

  // Helper function to add quick amount
  const addQuickAmount = (amount) => {
    const current = parseFloat(amountReceived) || 0;
    const newAmount = current + amount;
    setAmountReceived(newAmount.toString());
  };

  // Helper function to format amount for display
  const formatDisplayAmount = (amount) => {
    if (amount === 0) return '0.00';
    return amount.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
              <p className="text-sm text-slate-500">Complete transaction and process payment</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-sm">
              <span className="text-emerald-700 font-medium">{totalUnits} Items</span>
              <span className="mx-2 text-emerald-300">|</span>
              <span className="text-emerald-700 font-bold">{currency.format(roundedTotal)}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* ═══ LEFT COLUMN ═══ */}
          <div className="space-y-6">
            {/* Customer Section */}
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-xl shadow-slate-200/20 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-800">Customer</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isWalkIn}
                        onChange={(e) => {
                          setIsWalkIn(e.target.checked);
                          if (e.target.checked) setSelectedCustomer(null);
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      Walk-in
                    </label>
                    {!isWalkIn && (
                      <button
                        onClick={() => setShowCustomerSearch(true)}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Change
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                {selectedCustomer && !isWalkIn ? (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/25">
                          {selectedCustomer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800">{selectedCustomer.name}</h4>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${getTierColor(selectedCustomer.tier)} text-white`}>
                              {selectedCustomer.tier}
                            </span>
                          </div>
                          <div className="space-y-1 mt-1 text-sm text-slate-600">
                            <p className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5" /> {selectedCustomer.phone}
                            </p>
                            <p className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5" /> {selectedCustomer.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-white">
                          <p className="text-xs text-slate-500 font-medium">Points</p>
                          <p className="text-xl font-bold text-blue-600">{selectedCustomer.points.toLocaleString()}</p>
                        </div>
                        <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center justify-end gap-1">
                          <Gift className="w-3 h-3" />
                          +{Math.floor(selectedCustomer.points * 0.05)} earning
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <User className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-700">Walk-in Customer</p>
                    <p className="text-xs text-slate-400 mt-1">No loyalty points will be awarded</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-xl shadow-slate-200/20 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-slate-200/50">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-slate-800">Payment Method</h3>
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'cash', icon: Banknote, label: 'Cash', color: 'emerald' },
                    { id: 'card', icon: CreditCard, label: 'Card', color: 'blue' },
                    { id: 'wallet', icon: Smartphone, label: 'Wallet', color: 'purple' },
                  ].map(({ id, icon: Icon, label, color }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(id);
                        if (id !== 'cash') {
                          // For card and wallet, auto-fill the total amount
                          setAmountReceived(total.toFixed(2));
                        } else {
                          // For cash, clear the amount
                          setAmountReceived('');
                        }
                      }}
                      className={`relative group rounded-2xl border-2 p-4 text-center transition-all duration-300 ${paymentMethod === id
                          ? `border-${color}-500 bg-${color}-50 shadow-lg shadow-${color}-500/20 scale-105`
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                        }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === id ? `text-${color}-600` : 'text-slate-400'
                        }`} />
                      <span className={`text-sm font-semibold ${paymentMethod === id ? `text-${color}-700` : 'text-slate-600'
                        }`}>
                        {label}
                      </span>
                      {paymentMethod === id && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-200/50">
                  {paymentMethod === 'cash' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                          Amount Received
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">Rs.</span>
                          <input
                            autoFocus
                            type="number"
                            min="0"
                            step="1"
                            value={amountReceived}
                            onChange={(e) => setAmountReceived(e.target.value)}
                            placeholder="0.00"
                            className="w-full rounded-2xl border-2 border-slate-200 bg-white px-16 py-5 text-3xl font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                          />
                        </div>
                        {amountReceived && (
                          <div className="text-right text-sm text-slate-500 mt-1">
                            Amount: {currency.format(parseFloat(amountReceived) || 0)}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {quickAmounts.map(amount => (
                          <button
                            key={amount}
                            onClick={() => addQuickAmount(amount)}
                            className="px-4 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-700"
                          >
                            +{currency.format(amount)}
                          </button>
                        ))}
                        <button
                          onClick={setExactAmount}
                          className="px-4 py-2 text-sm font-medium bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors"
                        >
                          Exact Amount ({currency.format(roundedTotal)})
                        </button>
                      </div>

                      {/* Status Cards */}
                      <div className="space-y-2 animate-in fade-in duration-300">
                        {numReceived > 0 && numReceived < roundedTotal && (
                          <div className="rounded-2xl bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 px-5 py-4 flex items-center justify-between">
                            <span className="text-sm text-red-600 font-medium flex items-center gap-2">
                              <AlertCircle className="w-5 h-5" /> Shortfall
                            </span>
                            <span className="text-xl font-bold text-red-600">{currency.format(shortfall)}</span>
                          </div>
                        )}

                        {numReceived === roundedTotal && (
                          <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-200 px-5 py-4 flex items-center justify-center gap-2 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-5 h-5" /> Exact amount — no change required
                          </div>
                        )}

                        {numReceived > roundedTotal && (
                          <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-200 px-5 py-4 flex items-center justify-between">
                            <span className="text-sm text-emerald-700 font-semibold flex items-center gap-2">
                              <Banknote className="w-5 h-5" /> Change Due
                            </span>
                            <span className="text-2xl font-bold text-emerald-700">{currency.format(changeDue)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                          Card Type
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Visa', 'MasterCard', 'Amex'].map(type => (
                            <button
                              key={type}
                              onClick={() => setCardType(type)}
                              className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${cardType === type
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200/50 p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center border border-blue-200">
                              <CreditCard className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">Card Terminal</div>
                              <div className="text-sm text-slate-500">Amount: {currency.format(roundedTotal)}</div>
                              <div className="text-xs text-blue-600 font-medium">Tap or Insert card</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-xs font-semibold text-amber-700">Waiting</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'wallet' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                          Select Wallet
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Dialog', 'Genie', 'FriMi'].map(wallet => (
                            <button
                              key={wallet}
                              onClick={() => setWalletType(wallet)}
                              className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${walletType === wallet
                                  ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md'
                                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                }`}
                            >
                              {wallet}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200/50 p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center border border-purple-200">
                              <QrCode className="w-8 h-8 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">Scan QR Code</div>
                              <div className="text-sm text-slate-500">Amount: {currency.format(roundedTotal)}</div>
                              <div className="text-xs text-purple-600 font-medium">Using {walletType}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-xs font-semibold text-amber-700">Waiting</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ═══ RIGHT COLUMN ═══ */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-xl shadow-slate-200/20 overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-6 py-4 border-b border-slate-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-slate-600" />
                    <h3 className="font-semibold text-slate-800">Order Summary</h3>
                  </div>
                  <span className="bg-slate-200 text-slate-700 text-xs px-3 py-1 rounded-full font-semibold">
                    {totalUnits} Items
                  </span>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-800">{currency.format(subtotal)}</span>
                  </div>

                  {itemSavings > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600">Product Discount</span>
                      <span className="font-medium text-emerald-600">−{currency.format(itemSavings)}</span>
                    </div>
                  )}

                  {orderDiscountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-violet-600">Cart Discount</span>
                      <span className="font-medium text-violet-600">−{currency.format(orderDiscountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm border-b border-slate-200 pb-3">
                    <span className="text-slate-500">Tax (VAT)</span>
                    <span className="font-medium text-slate-800">{currency.format(tax)}</span>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl blur-xl opacity-20"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-xl shadow-blue-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Grand Total</p>
                        <p className="text-3xl font-bold">{currency.format(roundedTotal)}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 text-sm">
                        {paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'card' ? 'Card' : 'Wallet'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Status Summary */}
                {(paymentMethod === 'cash' && numReceived > 0) && (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Received</span>
                      <span className="font-semibold text-slate-800">{currency.format(numReceived)}</span>
                    </div>
                    {numReceived < roundedTotal && (
                      <div className="flex justify-between text-sm pt-1 border-t border-slate-200">
                        <span className="text-red-500 font-medium">Remaining</span>
                        <span className="font-semibold text-red-500">{currency.format(shortfall)}</span>
                      </div>
                    )}
                    {numReceived === roundedTotal && (
                      <div className="flex justify-between text-sm pt-1 border-t border-slate-200">
                        <span className="text-emerald-600 font-medium">Status</span>
                        <span className="font-semibold text-emerald-600">✓ Exact Amount</span>
                      </div>
                    )}
                    {numReceived > roundedTotal && (
                      <div className="flex justify-between text-sm pt-1 border-t border-slate-200">
                        <span className="text-emerald-600 font-medium">Change</span>
                        <span className="font-semibold text-emerald-600">{currency.format(changeDue)}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes or special instructions..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 resize-none h-20 transition-all"
                  />
                </div>
              </CardContent>

              <div className="px-6 pb-6 space-y-3">
                <Button
                  type="button"
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-14 text-base font-bold shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCompletePayment}
                  disabled={paymentMethod === 'cash' && (shortfall > 0 || numReceived === 0)}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isProcessing ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Complete Payment
                      </>
                    )}
                  </span>
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 h-12 font-semibold"
                    onClick={() => navigate('/pos-billing', {
                      state: {
                        cart,
                        orderDiscount: state.orderDiscount || '',
                        orderDiscountMode: state.orderDiscountMode || 'none',
                        taxRate: state.taxRate ?? 0
                      }
                    })}
                  >
                    Cart
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 h-12 font-semibold"
                    onClick={handleNewSale}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Customer Search Modal */}
      {showCustomerSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Search Customer</h3>
                <p className="text-sm text-slate-500">Find customer by name or phone number</p>
              </div>
              <button
                onClick={() => setShowCustomerSearch(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-3 mb-4">
                <SearchInput
                  placeholder="Search by name or phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="bg-slate-50 border-slate-200 flex-1"
                  autoFocus
                />
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6">
                  <Search className="w-4 h-4 mr-2" /> Search
                </Button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {customersLoading ? (
                  <div className="py-8 text-center text-slate-500 text-sm">
                    <span className="inline-block w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mr-2 align-middle" />
                    Loading customers...
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-sm">
                    No customers found matching search.
                  </div>
                ) : (
                  filteredCustomers.map(customer => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setIsWalkIn(false);
                        setShowCustomerSearch(false);
                      }}
                      className="w-full p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm">
                          {customer.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{customer.name}</div>
                          <div className="text-sm text-slate-500">{customer.phone}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-slate-500">Points</div>
                          <div className="font-bold text-blue-600">{customer.points.toLocaleString()}</div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Transaction Confirmation Modal */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Transaction" size="sm">
        <div className="space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6 animate-bounce" />
          </div>
          <div className="space-y-2 text-center">
            <h4 className="font-bold text-slate-800 text-lg">Cancel Current Sale?</h4>
            <p className="text-sm text-slate-500">
              This will cancel the current transaction and clear the shopping cart, including any applied discounts and tax rates. This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-11 border-slate-200 text-slate-700 font-semibold"
              onClick={() => setShowCancelModal(false)}
            >
              Go Back
            </Button>
            <Button
              className="flex-1 rounded-xl h-11 bg-red-600 hover:bg-red-700 text-white font-semibold"
              onClick={confirmCancelSale}
            >
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}