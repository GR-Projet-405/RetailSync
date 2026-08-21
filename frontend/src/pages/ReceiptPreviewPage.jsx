import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Printer, Download, Mail, PlusCircle,
  Store, FileText, User, CreditCard, Banknote, Smartphone, QrCode,
  Receipt, Clock, Hash, UserCircle, Gift, Percent, Package,
  Truck, Shield, Phone, MapPin, Calendar, Building2, Share2,
  Copy, Check, AlertCircle, X, ExternalLink, Eye, Send,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../components/Card';
import Modal from '../components/Modal';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const currency = {
  format: (value) => `Rs. ${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`,
};

export default function ReceiptPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const receiptRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isThermalPrinting, setIsThermalPrinting] = useState(false);
  const [showDigitalInvoice, setShowDigitalInvoice] = useState(false);
  const [showConfirmNewSale, setShowConfirmNewSale] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // ── Stable receipt metadata (initialised once on mount) ───────────────────
  const [meta] = useState(() => {
    const s = location.state || {};
    return {
      cart: s.cart || [],
      subtotal: s.subtotal || 0,
      itemSavings: s.itemSavings || 0,
      orderDiscountAmount: s.orderDiscountAmount || 0,
      tax: s.tax || 0,
      total: s.total || 0,
      totalUnits: s.totalUnits || 0,
      paymentMethod: s.paymentMethod || 'cash',
      amountReceived: s.amountReceived || 0,
      changeDue: s.changeDue || 0,
      customer: s.customer || null,
      invoiceNumber: s.invoiceNumber ||
        `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
      date: s.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: s.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      cashierName: s.cashierName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email : 'Nipuni Perera'),
      counterNumber: s.counterNumber || '01',
      storeName: s.storeName || 'RetailSync',
      storeAddress: s.storeAddress || 'No.120, Galle Road, Colombo 03',
      storePhone: s.storePhone || '011-1234567',
      storeEmail: s.storeEmail || 'info@retailsync.lk',
      storeBranch: s.storeBranch || 'Colombo Main',
      taxNumber: s.taxNumber || 'REG-2024-00123',
      receiptFooter: s.receiptFooter || 'Thank you for shopping with us! Visit again.',
      storeLogo: s.storeLogo || '🛒',
      couponCode: s.couponCode || null,
      couponDiscountAmount: s.couponDiscountAmount || 0,
      notes: s.notes || '',
    };
  });

  const {
    cart, subtotal, itemSavings, orderDiscountAmount, tax, total, totalUnits,
    paymentMethod, amountReceived, changeDue, customer,
    invoiceNumber, date, time, cashierName, counterNumber,
    storeName, storeAddress, storePhone, storeEmail, storeBranch,
    taxNumber, receiptFooter, storeLogo, couponCode, couponDiscountAmount,
    notes
  } = meta;

  const finalGrandTotal = Math.max(0, total - couponDiscountAmount);

  // ── Email send state ───────────────────────────────────────────────────────
  const [emailInput, setEmailInput] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [emailMsg, setEmailMsg] = useState('');
  const [emailPreviewUrl, setEmailPreviewUrl] = useState(null);

  useEffect(() => {
    if (customer?.email) setEmailInput(customer.email);
  }, [customer]);

  // ── Send Email ─────────────────────────────────────────────────────────────
  const handleSendEmail = async () => {
    const addr = emailInput.trim();
    if (!addr) {
      setEmailStatus('error');
      setEmailMsg('Please enter an email address.');
      return;
    }
    setIsSendingEmail(true);
    setEmailStatus(null);
    setEmailMsg('');
    setEmailPreviewUrl(null);

    try {
      const { data } = await api.post('/pos-billing/send-receipt', {
        sendVia: 'email',
        recipientEmail: addr,
        invoiceNumber, date, time,
        storeName, storeAddress, storePhone, storeEmail, storeBranch,
        cashierName, counterNumber,
        paymentMethod, amountReceived, changeDue,
        cart, subtotal,
        discounts: itemSavings + orderDiscountAmount + couponDiscountAmount,
        tax, total: finalGrandTotal, customer,
        notes,
      });

      const result = data?.data || {};
      setEmailStatus('success');
      setEmailMsg(result.emailMessage || `Receipt emailed to ${addr}.`);
      if (result.emailPreviewUrl) setEmailPreviewUrl(result.emailPreviewUrl);
    } catch (err) {
      setEmailStatus('error');
      setEmailMsg(err?.response?.data?.message || err.message || 'Failed to send email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // ── Print / misc helpers ───────────────────────────────────────────────────
  const handlePrint = () => {
    setIsPrinting(true);
    // Use window.print with a small delay to ensure content is rendered
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const handleThermalPrint = () => {
    setIsThermalPrinting(true);
    setTimeout(() => {
      const html = generateThermalHtml();
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
        setTimeout(() => w.close(), 1000);
      }
      setIsThermalPrinting(false);
    }, 500);
  };

  const generateThermalHtml = () => `<!DOCTYPE html><html><head><title>Thermal Receipt</title>
<style>@page{size:80mm auto;margin:0}body{font-family:'Courier New',monospace;width:80mm;margin:0 auto;padding:8px;font-size:12px;line-height:1.4}
.center{text-align:center}.bold{font-weight:bold}.dashed{border-top:1px dashed #333;margin:6px 0}
.row{display:flex;justify-content:space-between;font-size:11px;padding:1px 0}@media print{body{margin:0;padding:8px}}</style>
</head><body><div class="center">
<div class="bold" style="font-size:16px">${storeName}</div>
<div style="font-size:10px">${storeBranch} | ${storePhone}</div>
<div class="dashed"></div>
<div style="font-size:10px">${invoiceNumber} | ${date} ${time}</div>
<div style="font-size:10px">Cashier: ${cashierName} | Counter: ${counterNumber}</div>
<div class="dashed"></div></div>
${cart.map(i => `<div class="row"><span style="flex:1;text-align:left">${i.name} x${i.quantity}</span><span>${currency.format(i.price * i.quantity)}</span></div>`).join('')}
<div class="dashed"></div>
<div class="row"><span>Subtotal</span><span>${currency.format(subtotal)}</span></div>
${(itemSavings + orderDiscountAmount) > 0 ? `<div class="row"><span>Discounts</span><span>-${currency.format(itemSavings + orderDiscountAmount)}</span></div>` : ''}
${couponDiscountAmount > 0 ? `<div class="row"><span>Coupon (${couponCode})</span><span>-${currency.format(couponDiscountAmount)}</span></div>` : ''}
<div class="row"><span>Tax</span><span>${currency.format(tax)}</span></div>
<div class="dashed"></div>
<div class="row bold" style="font-size:14px"><span>TOTAL</span><span>${currency.format(finalGrandTotal)}</span></div>
<div class="dashed"></div>
${notes ? `<div style="font-size:10px;margin-top:4px;font-style:italic">Note: ${notes}</div><div class="dashed"></div>` : ''}
<div class="center" style="font-size:10px;margin-top:6px">${receiptFooter}</div>
</body></html>`;

  const handleDownloadPdf = () => {
    // Use window.print with PDF settings
    window.print();
  };

  const handleCopyInvoice = () => {
    const text = `INVOICE #${invoiceNumber}\n${storeName} – ${storeBranch}\nDate: ${date} ${time}\nCashier: ${cashierName}\nItems: ${cart.length}\nTotal: ${currency.format(finalGrandTotal)}\nPayment: ${paymentMethod}\n${receiptFooter}`;
    navigator.clipboard.writeText(text.trim());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const handleNewSale = () => setShowConfirmNewSale(true);
  const confirmNewSale = () => {
    setShowConfirmNewSale(false);
    navigate('/pos-billing', { state: { cart: [] } });
  };

  const PaymentIcon = { cash: Banknote, card: CreditCard, wallet: Smartphone }[paymentMethod] || Banknote;

  // ── Send Receipt panel ─────────────────────────────────────────────────────
  const sendPanel = (
    <div className="border-t border-slate-200 pt-5 mt-2">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Send className="w-3.5 h-3.5 text-blue-500" /> Send Digital Receipt
      </h4>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-blue-50/50 border border-blue-200/60 rounded-xl p-4 space-y-3">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-blue-500" /> Email Address
          </label>
          <input
            type="email"
            placeholder="customer@example.com"
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2
                       focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 outline-none transition-all"
          />

          {emailStatus === 'success' && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 space-y-1">
              <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {emailMsg}
              </p>
              {emailPreviewUrl && (
                <a href={emailPreviewUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> View email in browser
                </a>
              )}
            </div>
          )}
          {emailStatus === 'error' && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {emailMsg}
            </p>
          )}

          <Button
            size="sm"
            onClick={handleSendEmail}
            disabled={isSendingEmail}
            className={`w-full font-semibold flex items-center justify-center gap-1.5 ${emailStatus === 'success'
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-blue-600 hover:bg-blue-700'
              } text-white rounded-lg py-2`}
          >
            {isSendingEmail ? (
              <><div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" /> Sending…</>
            ) : emailStatus === 'success' ? (
              <><Check className="w-3.5 h-3.5" /> Sent!</>
            ) : (
              <><Mail className="w-3.5 h-3.5" /> Send Email</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  // ── Digital Invoice Modal ──────────────────────────────────────────────────
  const digitalInvoiceModal = (
    <Modal isOpen={showDigitalInvoice} onClose={() => setShowDigitalInvoice(false)} title="Digital Invoice" size="lg">
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200/50">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Store className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800">{storeName}</h3>
              </div>
              <p className="text-sm text-slate-600">{storeAddress}</p>
              <p className="text-sm text-slate-600">{storePhone}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">INVOICE</p>
              <p className="font-bold text-slate-800">{invoiceNumber}</p>
              <p className="text-xs text-slate-500">{date} {time}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Cashier</p>
            <p className="font-semibold text-slate-800">{cashierName}</p>
            <p className="text-xs text-slate-400">Counter #{counterNumber}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Payment</p>
            <p className="font-semibold text-slate-800 capitalize">{paymentMethod}</p>
            <p className="text-xs text-emerald-600">✓ Paid</p>
          </div>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-600">
                <th className="px-3 py-2 text-xs font-semibold">Item</th>
                <th className="px-3 py-2 text-xs font-semibold text-center">Qty</th>
                <th className="px-3 py-2 text-xs font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cart.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 font-medium text-slate-800">{item.name}</td>
                  <td className="px-3 py-2 text-center">{item.quantity}</td>
                  <td className="px-3 py-2 text-right font-medium">{currency.format(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 space-y-1">
          <div className="flex justify-between text-sm"><span className="text-slate-600">Subtotal</span><span>{currency.format(subtotal)}</span></div>
          {(itemSavings + orderDiscountAmount) > 0 && (
            <div className="flex justify-between text-sm text-emerald-600">
              <span>Discounts</span><span>−{currency.format(itemSavings + orderDiscountAmount)}</span>
            </div>
          )}
          {couponDiscountAmount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600">
              <span>Coupon Discount ({couponCode})</span><span>−{currency.format(couponDiscountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm"><span className="text-slate-600">Tax</span><span>{currency.format(tax)}</span></div>
          <div className="flex justify-between text-lg font-bold text-blue-600 border-t border-slate-200 pt-2">
            <span>Total</span><span>{currency.format(finalGrandTotal)}</span>
          </div>
        </div>

        {notes && (
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">Notes / Instructions</p>
            <p className="text-sm text-slate-700 italic">{notes}</p>
          </div>
        )}

        {sendPanel}
      </div>
    </Modal>
  );

  // ── Confirm New Sale Modal ─────────────────────────────────────────────────
  const confirmNewSaleModal = (
    <Modal isOpen={showConfirmNewSale} onClose={() => setShowConfirmNewSale(false)} title="Confirm New Sale" size="sm">
      <div className="space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Receipt className="h-6 w-6" />
        </div>
        <div className="space-y-2 text-center">
          <h4 className="font-bold text-slate-800 text-lg">Start a New Sale?</h4>
          <p className="text-sm text-slate-500">
            The current receipt details will be cleared. Make sure you have printed or shared the receipt first.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 rounded-xl h-11 border-slate-200 text-slate-700 font-semibold"
            onClick={() => setShowConfirmNewSale(false)}>Cancel</Button>
          <Button className="flex-1 rounded-xl h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            onClick={confirmNewSale}>Start Sale</Button>
        </div>
      </div>
    </Modal>
  );

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 max-w-4xl mx-auto space-y-6 pb-12 print:bg-white print:max-w-none print:pb-0 print:space-y-0 print:min-h-0">

      {/* Success Banner - Hidden in print */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-4">
          <div className="bg-emerald-500 rounded-full p-2">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-emerald-700">Payment Successful</h1>
            <p className="text-emerald-600 text-sm">Transaction #{invoiceNumber} completed successfully</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-700">{currency.format(finalGrandTotal)}</p>
          <p className="text-xs text-emerald-600">Total Amount</p>
        </div>
      </div>

      {/* Quick Actions - Hidden in print */}
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button size="sm" variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          onClick={() => setShowDigitalInvoice(true)}>
          <Eye className="w-4 h-4 mr-1.5" /> Digital Invoice &amp; Send
        </Button>
        <Button size="sm" variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          onClick={handleThermalPrint} disabled={isThermalPrinting}>
          <Printer className="w-4 h-4 mr-1.5" />{isThermalPrinting ? 'Printing…' : 'Thermal Receipt'}
        </Button>
        {copySuccess && (
          <span className="text-xs text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full">
            <Check className="w-3 h-3" /> Copied!
          </span>
        )}
      </div>

      {/* Main Receipt card - This is what gets printed */}
      <div 
        ref={receiptRef} 
        className="bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none print:overflow-visible"
        style={{ pageBreakAfter: 'avoid', pageBreakInside: 'avoid' }}
      >
        {/* Receipt Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 print:bg-blue-600 print:p-4 print:break-inside-avoid">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{storeLogo}</span>
                <h2 className="text-xl font-bold">{storeName}</h2>
              </div>
              <div className="text-sm opacity-90 space-y-1">
                <p className="flex items-center gap-2"><MapPin className="w-3 h-3" />{storeAddress}</p>
                <p className="flex items-center gap-2"><Phone className="w-3 h-3" />{storePhone}</p>
                <p className="flex items-center gap-2"><Building2 className="w-3 h-3" />Branch: {storeBranch}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
                <p className="text-2xl font-bold">{currency.format(total)}</p>
                <p className="text-xs opacity-80">Total Amount</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 print:p-4 print:space-y-4 print:break-inside-avoid">
          {/* Invoice & Customer */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:gap-2 print:grid-cols-2">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 print:p-3 print:border print:border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <Receipt className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Receipt</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="flex justify-between"><span className="text-slate-500">Invoice</span><span className="font-semibold text-slate-800">{invoiceNumber}</span></p>
                <p className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-medium">{date}</span></p>
                <p className="flex justify-between"><span className="text-slate-500">Time</span><span className="font-medium">{time}</span></p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 print:p-3 print:border print:border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <UserCircle className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Cashier</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-slate-800">{cashierName}</p>
                <p className="text-slate-500">Counter #{counterNumber}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 col-span-2 md:col-span-1 print:p-3 print:border print:border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <User className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Customer</span>
              </div>
              {customer ? (
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-slate-800">{customer.name}</p>
                  <p className="text-slate-500">{customer.phone}</p>
                  <div className="flex items-center gap-2 mt-1 text-emerald-600">
                    <Gift className="w-3 h-3" />
                    <span className="text-xs font-medium">{customer.points || 0} Points</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Walk-in Customer</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-xl overflow-hidden print:border print:border-slate-300 print:overflow-visible">
            <table className="w-full text-sm print:text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 print:bg-slate-100">
                <tr className="text-left text-slate-600">
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider print:px-2 print:py-2">Item</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-center print:px-2 print:py-2">Qty</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right print:px-2 print:py-2">Price</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right print:px-2 print:py-2">Discount</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right print:px-2 print:py-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                {cart.map((item, idx) => {
                  const lineTotal = item.price * item.quantity;
                  const discountAmt = item.itemDiscountMode === 'percent'
                    ? lineTotal * (item.itemDiscount || 0) / 100
                    : (item.itemDiscount || 0);
                  const finalTotal = Math.max(lineTotal - discountAmt, 0);
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors print:hover:bg-transparent">
                      <td className="px-4 py-3 print:px-2 print:py-2">
                        <p className="font-medium text-slate-800">{item.name}</p>
                        {item.code && <p className="text-xs text-slate-400">#{item.code}</p>}
                      </td>
                      <td className="px-4 py-3 text-center font-medium print:px-2 print:py-2">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-slate-600 print:px-2 print:py-2">{currency.format(item.price)}</td>
                      <td className="px-4 py-3 text-right print:px-2 print:py-2">
                        {discountAmt > 0
                          ? <span className="text-emerald-600 font-medium">−{currency.format(discountAmt)}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800 print:px-2 print:py-2">{currency.format(finalTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary & Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4 print:grid-cols-2">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 print:p-3 print:border print:border-slate-200">
              <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 print:text-sm">
                <CreditCard className="w-4 h-4" /> Payment Details
              </h3>
              <div className="grid grid-cols-2 gap-3 print:gap-2">
                <div className="bg-white rounded-lg p-3 border border-slate-200 print:p-2 print:text-xs">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Method</p>
                  <div className="flex items-center gap-2 mt-1">
                    <PaymentIcon className="w-4 h-4 text-slate-600" />
                    <span className="font-semibold text-slate-800 capitalize">{paymentMethod}</span>
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200 print:p-2 print:text-xs">
                  <p className="text-xs text-emerald-600 uppercase tracking-wider">Status</p>
                  <p className="font-bold text-emerald-700 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Paid
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200 col-span-2 print:p-2">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Amount Received</p>
                  <p className="font-bold text-slate-800 text-lg print:text-base">
                    {paymentMethod === 'cash' ? currency.format(amountReceived) : currency.format(finalGrandTotal)}
                  </p>
                  {paymentMethod === 'cash' && changeDue > 0 && (
                    <p className="text-sm text-emerald-600 print:text-xs">Change: {currency.format(changeDue)}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 print:p-3 print:border print:border-slate-200">
              <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 print:text-sm">
                <Hash className="w-4 h-4" /> Summary
              </h3>
              <div className="space-y-2 print:space-y-1">
                <div className="flex justify-between text-sm text-slate-600 print:text-xs">
                  <span>Subtotal ({totalUnits} items)</span><span>{currency.format(subtotal)}</span>
                </div>
                {itemSavings > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 print:text-xs">
                    <span>Item Discounts</span><span>−{currency.format(itemSavings)}</span>
                  </div>
                )}
                {orderDiscountAmount > 0 && (
                  <div className="flex justify-between text-sm text-violet-600 print:text-xs">
                    <span>Cart Discount</span><span>−{currency.format(orderDiscountAmount)}</span>
                  </div>
                )}
                {couponDiscountAmount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 print:text-xs">
                    <span>Coupon Discount ({couponCode})</span><span>−{currency.format(couponDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-slate-600 border-b border-slate-200 pb-2 print:text-xs print:pb-1">
                  <span>Tax (VAT)</span><span>{currency.format(tax)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-slate-800 pt-1 print:text-base">
                  <span>Grand Total</span><span className="text-blue-600">{currency.format(finalGrandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes / Special Instructions */}
          {notes && (
            <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 print:p-3 print:border print:border-amber-200">
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">Notes / Instructions</p>
              <p className="text-sm text-slate-700 italic print:text-xs">{notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-4 border-t border-slate-100 print:pt-3 print:border-t print:border-slate-200">
            <div className="flex justify-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500">Tax Invoice #{taxNumber}</span>
            </div>
            <p className="font-medium text-slate-700">{receiptFooter}</p>
            <p className="mt-2 text-xs text-slate-400">Powered by RetailSync POS v4.2.1</p>
          </div>
        </div>
      </div>

      {/* Action Buttons - Hidden in print */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:hidden">
        <Button onClick={handlePrint} variant="outline"
          className="h-12 bg-white text-slate-700 border-slate-200 hover:bg-slate-50 transition-all"
          disabled={isPrinting}>
          <Printer className="w-4 h-4 mr-2" />{isPrinting ? 'Printing…' : 'Print'}
        </Button>
        <Button onClick={handleThermalPrint} variant="outline"
          className="h-12 bg-white text-slate-700 border-slate-200 hover:bg-slate-50 transition-all"
          disabled={isThermalPrinting}>
          <Printer className="w-4 h-4 mr-2" />{isThermalPrinting ? 'Printing…' : 'Thermal'}
        </Button>
        <Button onClick={handleDownloadPdf} variant="outline"
          className="h-12 bg-white text-slate-700 border-slate-200 hover:bg-slate-50 transition-all">
          <Download className="w-4 h-4 mr-2" />PDF
        </Button>
        <Button onClick={handleNewSale}
          className="h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <PlusCircle className="w-4 h-4 mr-2" />New Sale
        </Button>
      </div>

      {/* Modals */}
      {digitalInvoiceModal}
      {confirmNewSaleModal}

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          /* Reset body and html for proper printing */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            height: auto !important;
            min-height: auto !important;
          }

          /* Prevent empty pages */
          .min-h-screen {
            min-height: auto !important;
            height: auto !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Hide non-printable elements */
          .print\\:hidden {
            display: none !important;
          }

          /* Force background colors for print */
          .print\\:bg-blue-600 {
            background-color: #2563eb !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Prevent page breaks inside the receipt */
          [ref="${receiptRef}"] {
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
          }

          /* Ensure the receipt doesn't overflow */
          .bg-white.rounded-2xl {
            max-height: none !important;
            overflow: visible !important;
            page-break-inside: avoid !important;
          }

          /* Compact spacing for print */
          .p-6 { padding: 0.5rem !important; }
          .space-y-6 > * + * { margin-top: 0.5rem !important; }
          .gap-4 { gap: 0.5rem !important; }
          .mb-3 { margin-bottom: 0.25rem !important; }
          .mt-2 { margin-top: 0.25rem !important; }
          .p-4 { padding: 0.5rem !important; }
          .py-3 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
          .px-4 { padding-left: 0.25rem !important; padding-right: 0.25rem !important; }

          /* Page size for receipt */
          @page {
            size: 80mm auto;
            margin: 2mm 4mm;
          }
        }
      `}} />
    </div>
  );
}