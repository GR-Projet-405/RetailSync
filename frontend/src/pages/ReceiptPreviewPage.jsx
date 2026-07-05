import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Printer, Download, Mail, PlusCircle,
  Store, FileText, User, CreditCard, Banknote, Smartphone, QrCode,
  Receipt, Clock, Hash, UserCircle, Gift, Percent, Package,
  Truck, Shield, Phone, MapPin, Calendar, Building2, Share2,
  Copy, Check, AlertCircle, X, ExternalLink, Eye
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../components/Card';
import Modal from '../components/Modal';

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
  const thermalRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isThermalPrinting, setIsThermalPrinting] = useState(false);
  const [showDigitalInvoice, setShowDigitalInvoice] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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
    invoiceNumber = `INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
    date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    cashierName = 'Nipuni Perera',
    counterNumber = '01',
    storeName = 'RetailSync',
    storeAddress = 'No.120, Galle Road, Colombo 03',
    storePhone = '011-1234567',
    storeEmail = 'info@RetailSync.lk',
    storeBranch = 'Colombo Main',
    taxNumber = 'REG-2024-00123',
    receiptFooter = 'Thank you for shopping with us! Visit again.',
    storeLogo = '🛒'
  } = state;

  // Generate QR code data for digital invoice
  const generateInvoiceData = () => {
    return {
      invoiceNumber,
      date,
      time,
      total: currency.format(total),
      paymentMethod,
      items: cart.length,
      storeName,
      storeBranch,
      cashierName
    };
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  const handleThermalPrint = () => {
    setIsThermalPrinting(true);
    // Simulate thermal printer output
    setTimeout(() => {
      // In a real implementation, this would send to a thermal printer
      // For demo, we'll open a print dialog with thermal formatting
      const thermalContent = generateThermalReceipt();
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(thermalContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }
      setIsThermalPrinting(false);
    }, 500);
  };

  const generateThermalReceipt = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Thermal Receipt</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              font-family: 'Courier New', monospace;
              width: 80mm;
              margin: 0 auto;
              padding: 8px;
              font-size: 12px;
              line-height: 1.4;
              background: white;
            }
            .receipt {
              text-align: center;
            }
            .header {
              border-bottom: 1px dashed #333;
              padding-bottom: 8px;
              margin-bottom: 8px;
            }
            .store-name {
              font-size: 18px;
              font-weight: bold;
            }
            .store-details {
              font-size: 10px;
              color: #666;
            }
            .divider {
              border-top: 1px dashed #333;
              margin: 6px 0;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              padding: 2px 0;
            }
            .item-name {
              flex: 1;
              text-align: left;
            }
            .item-qty {
              width: 30px;
              text-align: center;
            }
            .item-price {
              width: 60px;
              text-align: right;
            }
            .totals {
              border-top: 1px solid #333;
              padding-top: 8px;
              margin-top: 8px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              font-size: 14px;
            }
            .footer {
              border-top: 1px dashed #333;
              margin-top: 8px;
              padding-top: 8px;
              font-size: 10px;
              color: #666;
            }
            .payment-info {
              text-align: left;
              font-size: 10px;
              margin: 4px 0;
            }
            .barcode {
              font-family: 'Code128', monospace;
              letter-spacing: 2px;
              font-size: 16px;
              margin: 4px 0;
            }
            @media print {
              body { margin: 0; padding: 8px; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="store-name">${storeName}</div>
              <div class="store-details">${storeBranch}</div>
              <div class="store-details">${storeAddress}</div>
              <div class="store-details">Tel: ${storePhone}</div>
              <div class="store-details">${storeEmail}</div>
              <div class="divider"></div>
              <div style="font-size:10px;">
                ${invoiceNumber} | ${date} ${time}
              </div>
              <div style="font-size:10px;">
                Cashier: ${cashierName} | Counter: ${counterNumber}
              </div>
            </div>

            <div style="text-align:left; margin: 4px 0;">
              <div style="font-size:10px; font-weight:bold;">ITEMS</div>
              ${cart.map(item => `
                <div class="item-row">
                  <span class="item-name">${item.name}</span>
                  <span class="item-qty">x${item.quantity}</span>
                  <span class="item-price">${currency.format(item.price * item.quantity)}</span>
                </div>
                ${item.itemDiscount > 0 ? `
                  <div style="font-size:9px; color:#666; text-align:right; padding-left:20px;">
                    Discount: -${currency.format(item.itemDiscount)}
                  </div>
                ` : ''}
              `).join('')}
            </div>

            <div class="divider"></div>

            <div style="text-align:left; font-size:11px;">
              <div style="display:flex; justify-content:space-between;">
                <span>Subtotal</span>
                <span>${currency.format(subtotal)}</span>
              </div>
              ${itemSavings > 0 ? `
                <div style="display:flex; justify-content:space-between; color:#666;">
                  <span>Item Discounts</span>
                  <span>-${currency.format(itemSavings)}</span>
                </div>
              ` : ''}
              ${orderDiscountAmount > 0 ? `
                <div style="display:flex; justify-content:space-between; color:#666;">
                  <span>Cart Discount</span>
                  <span>-${currency.format(orderDiscountAmount)}</span>
                </div>
              ` : ''}
              <div style="display:flex; justify-content:space-between;">
                <span>Tax (VAT)</span>
                <span>${currency.format(tax)}</span>
              </div>
            </div>

            <div class="totals">
              <div class="total-row">
                <span>TOTAL</span>
                <span>${currency.format(total)}</span>
              </div>
            </div>

            <div class="payment-info">
              <div>Payment: ${paymentMethod.toUpperCase()}</div>
              ${paymentMethod === 'cash' ? `
                <div>Amount Received: ${currency.format(amountReceived)}</div>
                ${changeDue > 0 ? `<div>Change: ${currency.format(changeDue)}</div>` : ''}
              ` : ''}
              <div>Status: PAID ✓</div>
            </div>

            <div class="divider"></div>

            <div class="barcode">
              ${invoiceNumber.slice(-8)}
            </div>

            <div class="footer">
              <div>${receiptFooter}</div>
              <div style="margin-top:4px;">
                Tax Invoice: ${taxNumber}
              </div>
              <div style="margin-top:4px; font-size:8px;">
                Powered by FreshMart POS v4.2.1
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleDownloadPdf = () => {
    // In a real implementation, this would generate a PDF
    // For demo, we'll use the print dialog with PDF option
    window.print();
  };

  
  const handleCopyInvoice = () => {
    const invoiceData = generateInvoiceData();
    const text = `
      INVOICE #${invoiceData.invoiceNumber}
      ${storeName} - ${storeBranch}
      Date: ${invoiceData.date} ${invoiceData.time}
      Cashier: ${cashierName}
      Items: ${invoiceData.items}
      Total: ${invoiceData.total}
      Payment: ${invoiceData.paymentMethod}
      ${receiptFooter}
    `;
    navigator.clipboard.writeText(text.trim());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const handleShareInvoice = () => {
    setShowShareModal(true);
  };

  const handleNewSale = () => {
    if (window.confirm('Start a new sale? The current receipt will be saved.')) {
      navigate('/pos-billing', { state: { cart: [] } });
    }
  };

  const PaymentIcon = {
    cash: Banknote,
    card: CreditCard,
    wallet: Smartphone,
  }[paymentMethod] || Banknote;

  // Digital Invoice Modal
  const DigitalInvoiceModal = () => (
    <Modal isOpen={showDigitalInvoice} onClose={() => setShowDigitalInvoice(false)} title="Digital Invoice" size="lg">
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200/50">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
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
            <p className="text-xs text-slate-500">Payment Method</p>
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
                <th className="px-3 py-2 text-xs font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cart.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-800">{item.name}</p>
                  </td>
                  <td className="px-3 py-2 text-center">{item.quantity}</td>
                  <td className="px-3 py-2 text-right font-medium">
                    {currency.format(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span>{currency.format(subtotal)}</span>
            </div>
            {itemSavings > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Discounts</span>
                <span>-{currency.format(itemSavings + orderDiscountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tax</span>
              <span>{currency.format(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-blue-600 border-t border-slate-200 pt-2">
              <span>Total</span>
              <span>{currency.format(total)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <QrCode className="w-8 h-8 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Scan to verify</p>
              <p className="text-xs font-mono text-slate-400">{invoiceNumber.slice(-8)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyInvoice}>
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );

  // Share Modal
  const ShareModal = () => (
    <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Share Invoice" size="sm">
      <div className="space-y-4">
        
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1">Link</p>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={`https://RetailSync.lk/invoice/${invoiceNumber}`}
              readOnly
              className="flex-1 text-sm bg-white border border-slate-200 rounded-lg px-3 py-2"
            />
            <Button size="sm" onClick={handleCopyInvoice}>
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          {copySuccess && (
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
              <Check className="w-3 h-3" /> Copied to clipboard!
            </p>
          )}
        </div>
      </div>
    </Modal>
  );

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

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button 
          size="sm"
          variant="outline" 
          className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          onClick={() => setShowDigitalInvoice(true)}
        >
          <Eye className="w-4 h-4 mr-1" /> Digital Invoice
        </Button>
        <Button 
          size="sm"
          variant="outline" 
          className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          onClick={handleThermalPrint}
          disabled={isThermalPrinting}
        >
          <Printer className="w-4 h-4 mr-1" /> 
          {isThermalPrinting ? 'Printing...' : 'Thermal Receipt'}
        </Button>
        
        {copySuccess && (
          <span className="text-xs text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full">
            <Check className="w-3 h-3" /> Copied!
          </span>
        )}
      </div>

      {/* Main Receipt */}
      <div 
        ref={receiptRef} 
        className="bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none"
      >
        {/* Receipt Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 print:bg-blue-600">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{storeLogo}</span>
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
                    <span className="text-xs font-medium">{customer.points || 0} Points</span>
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
              <span>Powered by Retailsync </span>
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
          onClick={handleThermalPrint} 
          variant="outline" 
          className="h-12 bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
          disabled={isThermalPrinting}
        >
          <Printer className="w-4 h-4 mr-2" /> 
          {isThermalPrinting ? 'Printing...' : 'Thermal'}
        </Button>
        <Button 
          onClick={handleDownloadPdf} 
          variant="outline" 
          className="h-12 bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <Download className="w-4 h-4 mr-2" /> PDF
        </Button>
        <Button 
          onClick={handleNewSale} 
          className="h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <PlusCircle className="w-4 h-4 mr-2" /> New Sale
        </Button>
      </div>

      {/* Modals */}
      <DigitalInvoiceModal />
      <ShareModal />

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