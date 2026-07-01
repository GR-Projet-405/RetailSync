import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Printer, Download, Mail, PlusCircle,
  Store, FileText, User, CreditCard, Banknote, Smartphone, QrCode,
  Receipt, Clock, Hash, UserCircle, Gift, Percent, Package,
  Truck, Shield, Phone, MapPin, Calendar, Building2
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../components/Card';

const currency = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function ReceiptPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const receiptRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const state = location.state || {};
  const {
    cart = [],
    subtotal = 0,
    itemSavings = 0,
    orderDiscountAmount = 0,
    tax = 0,
    total = 0,
    totalUnits = 0,
    paymentMethod = 'cash',
    amountReceived = 0,
    changeDue = 0,
    customer = null,
    invoiceNumber = 'INV-20260701-00025',
    date = '01 Jul 2026',
    time = '10:45 AM',
    cashierName = 'John Doe',
    counterNumber = '01',
    storeName = 'RetailSync',
    storeAddress = 'No.120, Galle Road, Colombo 03',
    storePhone = '011-1234567',
    storeEmail = 'info@retailsync.lk',
    storeBranch = 'Colombo Main',
    taxNumber = 'REG-2024-00123',
    receiptFooter = 'Thank you for shopping with us! Visit again.'
  } = state;

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const handleEmailReceipt = () => {
    const subject = encodeURIComponent(`Receipt ${invoiceNumber}`);
    const body = encodeURIComponent([
      `${storeName}`,
      `${storeBranch}`,
      `${storeAddress}`,
      `${storePhone}`,
      '',
      `Invoice No: ${invoiceNumber}`,
      `Date: ${date}`,
      `Time: ${time}`,
      `Cashier: ${cashierName} (Counter ${counterNumber})`,
      '',
      `Total: ${currency.format(total)}`,
      `Payment Method: ${paymentMethod}`,
      '',
      'Items Purchased:',
      ...cart.map(item => `- ${item.name} x${item.quantity} = ${currency.format(item.price * item.quantity)}`),
      '',
      receiptFooter
    ].join('\n'));

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleNewSale = () => {
    navigate('/pos-billing', { state: { cart: [] } });
  };

  const PaymentIcon = {
    cash: Banknote,
    card: CreditCard,
    mobile: Smartphone,
  }[paymentMethod] || Banknote;

  return (
    <div className="min-h-screen bg-slate-50 max-w-4xl mx-auto space-y-6 pb-12 print:bg-white print:max-w-none print:pb-0">
      {/* Success Banner */}
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
          <p className="text-2xl font-bold text-emerald-700">{currency.format(total)}</p>
          <p className="text-xs text-emerald-600">Total Amount</p>
        </div>
      </div>

      {/* Receipt Container */}
      <div 
        ref={receiptRef} 
        className="bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none"
      >
        {/* Receipt Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 print:bg-blue-600">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-6 h-6" />
                <h2 className="text-xl font-bold">{storeName}</h2>
              </div>
              <div className="text-sm opacity-90 space-y-1">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span>{storeAddress}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  <span>{storePhone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Building2 className="w-3 h-3" />
                  <span>Branch: {storeBranch}</span>
                </p>
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

        <div className="p-6 space-y-6 print:p-4">
          {/* Invoice & Customer Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <Receipt className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Receipt</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="flex justify-between">
                  <span className="text-slate-500">Invoice</span>
                  <span className="font-semibold text-slate-800">{invoiceNumber}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium">{date}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500">Time</span>
                  <span className="font-medium">{time}</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <UserCircle className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Cashier</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-slate-800">{cashierName}</p>
                <p className="text-slate-500">Counter #{counterNumber}</p>
                <p className="text-xs text-slate-400">ID: {`EMP-${String(counterNumber).padStart(4, '0')}`}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 col-span-2 md:col-span-1">
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
                    <span className="text-xs font-medium">{customer.loyaltyPoints} Points</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Walk-in Customer</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-slate-600">
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-center">Qty</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Price</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Discount</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cart.map((item, idx) => {
                  const lineTotal = item.price * item.quantity;
                  const discountAmt = item.itemDiscountMode === 'percent' 
                    ? lineTotal * item.itemDiscount / 100 
                    : (item.itemDiscount || 0);
                  const finalTotal = Math.max(lineTotal - discountAmt, 0);

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-800">{item.name}</p>
                          {item.code && (
                            <p className="text-xs text-slate-400">#{item.code}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-medium">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{currency.format(item.price)}</td>
                      <td className="px-4 py-3 text-right">
                        {discountAmt > 0 ? (
                          <span className="text-emerald-600 font-medium">-{currency.format(discountAmt)}</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">{currency.format(finalTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary & Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Method */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Method</p>
                  <div className="flex items-center gap-2 mt-1">
                    <PaymentIcon className="w-4 h-4 text-slate-600" />
                    <span className="font-semibold text-slate-800 capitalize">{paymentMethod}</span>
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <p className="text-xs text-emerald-600 uppercase tracking-wider">Status</p>
                  <p className="font-bold text-emerald-700 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Paid
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200 col-span-2">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Amount Received</p>
                  <p className="font-bold text-slate-800 text-lg">
                    {paymentMethod === 'cash' ? currency.format(amountReceived) : currency.format(total)}
                  </p>
                  {paymentMethod === 'cash' && changeDue > 0 && (
                    <p className="text-sm text-emerald-600">Change: {currency.format(changeDue)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal ({totalUnits} items)</span>
                  <span>{currency.format(subtotal)}</span>
                </div>
                {itemSavings > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Item Discounts</span>
                    <span>-{currency.format(itemSavings)}</span>
                  </div>
                )}
                {orderDiscountAmount > 0 && (
                  <div className="flex justify-between text-sm text-violet-600">
                    <span>Cart Discount</span>
                    <span>-{currency.format(orderDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-slate-600 border-b border-slate-200 pb-2">
                  <span>Tax (VAT)</span>
                  <span>{currency.format(tax)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-slate-800 pt-1">
                  <span>Grand Total</span>
                  <span className="text-blue-600">{currency.format(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-slate-100">
            <div className="flex justify-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500">Tax Invoice #{taxNumber}</span>
            </div>
            <p className="font-medium text-slate-700">{receiptFooter}</p>
            <div className="mt-2 flex justify-center items-center gap-4 text-xs text-slate-400">
              <span>Powered by FreshMart POS</span>
              <span>•</span>
              <span>v4.2.1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:hidden">
        <Button 
          onClick={handlePrint} 
          variant="outline" 
          className="h-12 bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
          disabled={isPrinting}
        >
          <Printer className="w-4 h-4 mr-2" /> 
          {isPrinting ? 'Printing...' : 'Print'}
        </Button>
        <Button 
          onClick={handleDownloadPdf} 
          variant="outline" 
          className="h-12 bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <Download className="w-4 h-4 mr-2" /> PDF
        </Button>
        <Button 
          onClick={handleEmailReceipt} 
          variant="outline" 
          className="h-12 bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <Mail className="w-4 h-4 mr-2" /> Email
        </Button>
        <Button 
          onClick={handleNewSale} 
          className="h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <PlusCircle className="w-4 h-4 mr-2" /> New Sale
        </Button>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            font-family: 'Courier New', monospace !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:bg-blue-600 {
            background-color: #2563eb !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .print\\:p-4 {
            padding: 1rem !important;
          }
          
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .bg-slate-50,
          .bg-emerald-50,
          .bg-white {
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .text-emerald-600,
          .text-emerald-700,
          .text-blue-600 {
            color: #2563eb !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          @page {
            margin: 8mm;
            size: 80mm auto;
          }
          
          .min-h-screen {
            min-height: auto !important;
          }
          
          .space-y-6 > * + * {
            margin-top: 0.5rem !important;
          }
        }
      `}} />
    </div>
  );
}