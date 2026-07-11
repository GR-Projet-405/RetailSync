import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Barcode, Plus, ScanBarcode, Trash2, Minus, CreditCard, Banknote,
  PackageSearch, ShoppingCart, RotateCcw, CircleAlert, Tag, Percent,
  ChevronDown, Check, AlertCircle, Receipt, DollarSign, Edit3, X,
  TrendingDown, Calculator, BadgePercent, Gift,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';
import Button from '../components/Button';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import Modal from '../components/Modal';

/* Currency formatter */
const currency = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/* Discount modes */
const DISCOUNT_MODES = { NONE: 'none', PERCENT: 'percent', FLAT: 'flat' };

/* Category colour map */
const CATEGORY_COLORS = {
  Bakery: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  Dairy: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-400' },
  Grocery: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  Beverage: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-400' },
  Snacks: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400' },
  'Home Care': { bg: 'bg-pink-50', text: 'text-pink-700', dot: 'bg-pink-400' },
};
const defaultCat = { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-400' };

const normalizeLookupValue = (value) => String(value ?? '').trim().toLowerCase().replace(/[\s-]/g, '');

// Local Mock Product Data
const MOCK_PRODUCTS = [
  {
    id: 'p1',
    barcode: '885100100001',
    name: 'Classic White Bread',
    price: 250,
    currency: 'LKR',
    unit: 'loaf',
    stock: 24,
    sku: 'BRD-001',
    category: 'Bakery'
  },
  {
    id: 'p2',
    barcode: '885100100002',
    name: 'Fresh Milk 1L',
    price: 320,
    currency: 'LKR',
    unit: 'bottle',
    stock: 18,
    sku: 'MLK-001',
    category: 'Dairy'
  },
  {
    id: 'p3',
    barcode: '885100100003',
    name: 'Jasmine Rice 5kg',
    price: 3250,
    currency: 'LKR',
    unit: 'bag',
    stock: 12,
    sku: 'RCE-001',
    category: 'Grocery'
  },
  {
    id: 'p4', barcode: '885100100004', name: 'Farm Eggs 12 Pack', price: 650,
    stock: 15, sku: 'EGG-001', category: 'Dairy', currency: 'LKR', unit: 'pack'
  },
  {
    id: 'p5', barcode: '885100100005', name: 'Spaghetti Pasta 500g', price: 450,
    stock: 30, sku: 'PST-001', category: 'Grocery', currency: 'LKR', unit: 'pack'
  },
  {
    id: 'p6', barcode: '885100100006', name: 'Spring Water 600ml', price: 100,
    stock: 50, sku: 'WTR-001', category: 'Beverage', currency: 'LKR', unit: 'bottle'
  },
  {
    id: 'p7', barcode: '885100100007', name: 'Premium Tea Bags 100s', price: 850,
    stock: 20, sku: 'TEA-001', category: 'Beverage', currency: 'LKR', unit: 'box'
  },
  {
    id: 'p8', barcode: '885100100008', name: 'Chocolate Cookies', price: 300,
    stock: 40, sku: 'CKY-001', category: 'Snacks', currency: 'LKR', unit: 'pack'
  }
];

// Inline quantity editor
function QuantityEditor({ value, stock, onConfirm }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef(null);

  const startEdit = () => {
    setDraft(String(value));
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const confirm = () => {
    const parsed = parseInt(draft, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onConfirm(Math.min(parsed, stock));
    }
    setEditing(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') confirm();
    if (e.key === 'Escape') setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min="1"
        max={stock}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={confirm}
        onKeyDown={handleKey}
        className="w-14 text-center text-sm font-semibold text-slate-900 border border-[#2563EB] rounded-lg px-1 py-0.5 outline-none bg-white ring-2 ring-[#2563EB]/20"
      />
    );
  }

  return (
    <button
      type="button"
      title="Click to edit quantity"
      onClick={startEdit}
      className="w-12 text-center text-sm font-semibold text-slate-900 hover:text-[#2563EB] transition-colors group relative"
    >
      {value}
      <Edit3 className="w-2.5 h-2.5 absolute -top-1 -right-1 opacity-0 group-hover:opacity-60 text-[#2563EB]" />
    </button>
  );
}

// Item-level discount — inline panel (no overlap)
function ItemDiscountPanel({ item, onApply, onClose }) {
  const [mode, setMode] = useState(item.itemDiscountMode === DISCOUNT_MODES.NONE ? DISCOUNT_MODES.PERCENT : item.itemDiscountMode);
  const [value, setValue] = useState(item.itemDiscount > 0 ? String(item.itemDiscount) : '');

  const apply = () => {
    const numVal = parseFloat(value) || 0;
    if (numVal <= 0) { onApply(0, DISCOUNT_MODES.NONE); return; }
    const capped = mode === DISCOUNT_MODES.PERCENT ? Math.min(numVal, 100) : Math.min(numVal, item.price * item.quantity);
    onApply(capped, mode);
  };

  const lineTotal = item.price * item.quantity;
  const discountAmt = mode === DISCOUNT_MODES.PERCENT
    ? lineTotal * (parseFloat(value) || 0) / 100
    : Math.min(parseFloat(value) || 0, lineTotal);
  const afterDiscount = Math.max(lineTotal - discountAmt, 0);

  return (
    <div className="mt-2 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-3 space-y-2.5 fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2563EB] flex items-center gap-1">
          <BadgePercent className="w-3 h-3" /> Item Discount
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setMode(DISCOUNT_MODES.PERCENT)}
          className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${mode === DISCOUNT_MODES.PERCENT ? 'bg-[#2563EB] text-white' : 'bg-white text-slate-600 border border-[#E2E8F0] hover:bg-slate-50'
            }`}
        >
          <Percent className="w-3 h-3 inline mr-0.5" /> %
        </button>
        <button
          type="button"
          onClick={() => setMode(DISCOUNT_MODES.FLAT)}
          className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${mode === DISCOUNT_MODES.FLAT ? 'bg-[#2563EB] text-white' : 'bg-white text-slate-600 border border-[#E2E8F0] hover:bg-slate-50'
            }`}
        >
          <DollarSign className="w-3 h-3 inline mr-0.5" /> Flat
        </button>
      </div>

      {/* Value input */}
      <input
        autoFocus
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') apply(); if (e.key === 'Escape') onClose(); }}
        placeholder={mode === DISCOUNT_MODES.PERCENT ? 'Enter % (e.g. 10)' : 'Enter amount (e.g. 50)'}
        className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
      />

      {/* Live preview */}
      {(parseFloat(value) || 0) > 0 && (
        <div className="rounded-lg bg-white border border-[#BBF7D0] px-3 py-2 space-y-1 text-[11px]">
          <div className="flex justify-between text-slate-500">
            <span>Line total</span>
            <span className="font-medium">{currency.format(lineTotal)}</span>
          </div>
          <div className="flex justify-between text-red-500">
            <span>Discount</span>
            <span className="font-medium">−{currency.format(discountAmt)}</span>
          </div>
          <div className="flex justify-between text-emerald-600 font-bold border-t border-slate-100 pt-1">
            <span>After discount</span>
            <span>{currency.format(afterDiscount)}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1.5">
        <Button
          type="button" variant="outline"
          className="flex-1 rounded-lg text-[11px] h-7 border-[#E2E8F0] bg-white text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
          onClick={() => { onApply(0, DISCOUNT_MODES.NONE); }}
        >
          Clear
        </Button>
        <Button
          type="button"
          className="flex-1 rounded-lg text-[11px] h-7 bg-[#2563EB] hover:bg-[#1E40AF]"
          onClick={apply}
        >
          <Check className="w-3 h-3 mr-1" /> Apply
        </Button>
      </div>
    </div>
  );
}

/* Cart item row */
function CartItem({ item, onQuantitySet, onDelta, onRemove, onItemDiscount }) {
  const [showDiscount, setShowDiscount] = useState(false);
  const lineTotal = item.price * item.quantity;
  const discountAmt = item.itemDiscountMode === DISCOUNT_MODES.PERCENT
    ? lineTotal * item.itemDiscount / 100
    : item.itemDiscount;
  const lineFinal = Math.max(lineTotal - discountAmt, 0);
  const hasDiscount = item.itemDiscount > 0 && item.itemDiscountMode !== DISCOUNT_MODES.NONE;
  const catStyle = CATEGORY_COLORS[item.category] || defaultCat;

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-sm hover:border-[#BFDBFE] hover:shadow-md transition-all duration-200 fade-up">
      {/* Row 1 – name + category + remove */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${catStyle.dot}`} />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 leading-snug truncate">{item.name}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{item.sku} · {item.barcode}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${catStyle.bg} ${catStyle.text}`}>{item.category}</span>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="ml-1 p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 2 – qty controls + price */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onDelta(item.id, -1)}
            className="h-8 w-8 rounded-xl border border-[#E2E8F0] bg-white text-slate-600 hover:bg-[#EFF6FF] hover:border-[#BFDBFE] flex items-center justify-center transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <QuantityEditor
            value={item.quantity}
            stock={item.stock}
            onConfirm={(qty) => onQuantitySet(item.id, qty)}
          />
          <button
            type="button"
            onClick={() => onDelta(item.id, 1)}
            disabled={item.quantity >= item.stock}
            className="h-8 w-8 rounded-xl bg-[#2563EB] text-white hover:bg-[#1E40AF] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-slate-400 ml-1">/ {item.stock} stk</span>
        </div>

        <div className="text-right">
          {hasDiscount ? (
            <>
              <div className="text-[11px] text-slate-400 line-through">{currency.format(lineTotal)}</div>
              <div className="text-sm font-bold text-emerald-600">{currency.format(lineFinal)}</div>
            </>
          ) : (
            <div className="text-sm font-semibold text-slate-900">{currency.format(lineTotal)}</div>
          )}
          <div className="text-[10px] text-slate-400">{currency.format(item.price)}/{item.unit}</div>
        </div>
      </div>

      {/* Row 3 – discount badge + toggle button */}
      <div className="mt-2 flex items-center justify-between">
        {hasDiscount ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <TrendingDown className="w-2.5 h-2.5" />
            {item.itemDiscountMode === DISCOUNT_MODES.PERCENT
              ? `${item.itemDiscount}% off`
              : `${currency.format(item.itemDiscount)} off`}
            &nbsp;·&nbsp;save {currency.format(discountAmt)}
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => setShowDiscount((v) => !v)}
          className="text-[10px] text-[#2563EB] hover:underline flex items-center gap-0.5 ml-auto"
        >
          <BadgePercent className="w-3 h-3" />
          {hasDiscount ? 'Edit' : 'Add'} discount
          <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showDiscount ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Row 4 – inline discount form */}
      {showDiscount && (
        <ItemDiscountPanel
          item={item}
          onApply={(val, mode) => { onItemDiscount(item.id, val, mode); setShowDiscount(false); }}
          onClose={() => setShowDiscount(false)}
        />
      )}
    </div>
  );
}

/* Order summary / totals panel */
function OrderSummary({ subtotal, itemSavings, orderDiscountAmount, orderDiscountMode, orderDiscount, taxRate, tax, total }) {
  const totalSaved = itemSavings + orderDiscountAmount;

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#F8FAFC] to-white border border-[#E2E8F0] p-4 space-y-2.5">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Subtotal (before discounts)</span>
        <span className="font-medium text-slate-700">{currency.format(subtotal)}</span>
      </div>

      {itemSavings > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-emerald-600"><TrendingDown className="w-3 h-3" />Item discounts</span>
          <span className="text-emerald-600 font-medium">−{currency.format(itemSavings)}</span>
        </div>
      )}

      {orderDiscountAmount > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-violet-600">
            <Gift className="w-3 h-3" />
            Order discount
            {orderDiscountMode === DISCOUNT_MODES.PERCENT && (
              <span className="bg-violet-100 text-violet-700 px-1.5 rounded-full text-[10px]">{orderDiscount}%</span>
            )}
          </span>
          <span className="text-violet-600 font-medium">−{currency.format(orderDiscountAmount)}</span>
        </div>
      )}

      {totalSaved > 0 && (
        <div className="rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] px-3 py-2 flex items-center justify-between text-xs text-emerald-700 font-semibold">
          <span className="flex items-center gap-1"><Tag className="w-3 h-3" />Total savings</span>
          <span>−{currency.format(totalSaved)}</span>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-[#E2E8F0]">
        <span>Taxable amount</span>
        <span>{currency.format(subtotal - itemSavings - orderDiscountAmount)}</span>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <Calculator className="w-3 h-3" /> Tax ({taxRate}%)
        </span>
        <span>{currency.format(tax)}</span>
      </div>

      <div className="flex items-center justify-between text-lg font-bold text-slate-900 pt-2 border-t-2 border-[#2563EB]/20">
        <span className="flex items-center gap-1.5">
          <Receipt className="w-4 h-4 text-[#2563EB]" /> Total
        </span>
        <span className="text-[#2563EB]">{currency.format(total)}</span>
      </div>
    </div>
  );
}

/* Main page */
export default function POSBillingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const restoredState = location.state || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeValue, setBarcodeValue] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [cart, setCart] = useState(() => (Array.isArray(restoredState.cart) ? restoredState.cart : []));
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Loading inventory products...');
  const [statusType, setStatusType] = useState('info'); // info | success | error

  // Simulate async load of local mock products to match the UX load indicators
  useEffect(() => {
    const timer = setTimeout(() => {
      setInventoryProducts(MOCK_PRODUCTS);
      setStatusMessage(`Loaded ${MOCK_PRODUCTS.length} mock inventory products.`);
      setStatusType('success');
      setInventoryLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  // Restore state from navigation
  useEffect(() => {
    if (Array.isArray(restoredState.cart)) {
      setCart(restoredState.cart);
    }
    if (typeof restoredState.orderDiscount === 'string' || typeof restoredState.orderDiscount === 'number') {
      setOrderDiscount(String(restoredState.orderDiscount || ''));
    }
    if (restoredState.orderDiscountMode) {
      setOrderDiscountMode(restoredState.orderDiscountMode);
    }
    if (typeof restoredState.taxRate === 'number') {
      setTaxRate(restoredState.taxRate);
    }
  }, [restoredState.cart, restoredState.orderDiscount, restoredState.orderDiscountMode, restoredState.taxRate]);

  const mockBarcodeSamples = useMemo(() => inventoryProducts.slice(0, 6), [inventoryProducts]);

  /* Order-level discount */
  const [orderDiscount, setOrderDiscount] = useState('');
  const [orderDiscountMode, setOrderDiscountMode] = useState(DISCOUNT_MODES.NONE);
  const [showOrderDiscount, setShowOrderDiscount] = useState(false);

  /* Tax rate */
  const [taxRate, setTaxRate] = useState(8);
  const [editingTaxRate, setEditingTaxRate] = useState(false);
  const [draftTaxRate, setDraftTaxRate] = useState('8');

  /* Derived totals */
  const {
    subtotal, itemSavings, taxableAmount,
    orderDiscountAmount, tax, total,
  } = useMemo(() => {
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const itemSavings = cart.reduce((s, i) => {
      const lineTotal = i.price * i.quantity;
      if (!i.itemDiscount || i.itemDiscountMode === DISCOUNT_MODES.NONE) return s;
      const disc = i.itemDiscountMode === DISCOUNT_MODES.PERCENT
        ? lineTotal * i.itemDiscount / 100
        : i.itemDiscount;
      return s + disc;
    }, 0);

    const afterItems = subtotal - itemSavings;
    const orderVal = parseFloat(orderDiscount) || 0;
    const orderDiscountAmount = orderDiscountMode === DISCOUNT_MODES.PERCENT
      ? afterItems * orderVal / 100
      : orderDiscountMode === DISCOUNT_MODES.FLAT
        ? Math.min(orderVal, afterItems)
        : 0;

    const taxableAmount = Math.max(afterItems - orderDiscountAmount, 0);
    const tax = taxableAmount * taxRate / 100;
    const total = taxableAmount + tax;

    return { subtotal, itemSavings, taxableAmount, orderDiscountAmount, tax, total };
  }, [cart, orderDiscount, orderDiscountMode, taxRate]);

  const totalUnits = cart.reduce((s, i) => s + i.quantity, 0);

  /* Filtered products */
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return inventoryProducts;
    return inventoryProducts.filter((p) =>
      [p.name, p.category, p.sku, p.barcode].join(' ').toLowerCase().includes(q)
    );
  }, [inventoryProducts, searchQuery]);

  /* Cart actions */
  const notify = (msg, type = 'info') => { setStatusMessage(msg); setStatusType(type); };

  const addProductToCart = useCallback((product) => {
    setCart((cur) => {
      const existing = cur.find((i) => i.id === product.id);
      if (existing) {
        return cur.map((i) => {
          if (i.id !== product.id) return i;
          const next = Math.min(i.quantity + 1, product.stock);
          return { ...i, quantity: next };
        });
      }
      return [...cur, { ...product, quantity: 1, itemDiscount: 0, itemDiscountMode: DISCOUNT_MODES.NONE }];
    });
    notify(`✓ ${product.name} added to cart.`, 'success');
  }, []);

  const findProduct = useCallback((raw) => {
    const v = normalizeLookupValue(raw);
    if (!v) return null;
    return inventoryProducts.find((p) =>
      [p.barcode, p.sku].some((field) => normalizeLookupValue(field) === v || normalizeLookupValue(field).includes(v))
      || normalizeLookupValue(p.name).includes(v)
    ) || null;
  }, [inventoryProducts]);

  const handleMockBarcodeScan = useCallback((barcode) => {
    const scanValue = String(barcode ?? '').trim();
    if (!scanValue) return;

    setBarcodeValue(scanValue);
    setSearchQuery(scanValue);

    const product = findProduct(scanValue);
    if (!product) {
      notify('No product matched that mock barcode. Try another sample barcode.', 'error');
      return;
    }

    addProductToCart(product);
    setBarcodeValue('');
  }, [addProductToCart, findProduct]);

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const scanValue = barcodeValue.trim();
    if (!scanValue) {
      notify('Enter a mock barcode value or pick one of the sample barcodes below.', 'info');
      return;
    }

    const product = findProduct(scanValue);
    if (!product) { notify('No product matched that barcode. Try a different scan.', 'error'); return; }
    addProductToCart(product);
    setSearchQuery(scanValue);
    setBarcodeValue('');
  };

  const handleManualAdd = () => {
    const lookupValue = manualCode.trim();
    const product = findProduct(lookupValue);
    if (!product) { notify('SKU / barcode not found in sample inventory.', 'error'); return; }
    addProductToCart(product);
    setSearchQuery(lookupValue);
    setManualCode('');
  };

  const updateCartQuantity = (id, delta) => {
    setCart((cur) =>
      cur.map((i) => {
        if (i.id !== id) return i;
        const next = i.quantity + delta;
        if (next <= 0) return null;
        return { ...i, quantity: Math.min(next, i.stock) };
      }).filter(Boolean)
    );
  };

  const setCartQuantity = (id, qty) => {
    setCart((cur) =>
      cur.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  };

  const removeCartItem = (id) => setCart((cur) => cur.filter((i) => i.id !== id));

  const applyItemDiscount = (id, value, mode) => {
    setCart((cur) =>
      cur.map((i) => i.id === id ? { ...i, itemDiscount: value, itemDiscountMode: mode } : i)
    );
  };

  const clearSale = () => {
    setCart([]);
    setOrderDiscount('');
    setOrderDiscountMode(DISCOUNT_MODES.NONE);
    notify('Sale cleared. Ready for a new transaction.', 'info');
  };

  /* Tax rate editing */
  const confirmTaxRate = () => {
    const v = parseFloat(draftTaxRate);
    if (!isNaN(v) && v >= 0 && v <= 100) setTaxRate(v);
    setEditingTaxRate(false);
  };

  /* Order discount */
  const applyOrderDiscount = () => {
    const v = parseFloat(orderDiscount) || 0;
    if (v <= 0) {
      setOrderDiscountMode(DISCOUNT_MODES.NONE);
    }
    setShowOrderDiscount(false);
    notify(v > 0 ? `Order discount applied.` : 'Order discount removed.', v > 0 ? 'success' : 'info');
  };

  /* Status icon */
  const StatusIcon = statusType === 'error' ? AlertCircle : statusType === 'success' ? Check : CircleAlert;
  const statusStyle = {
    error: 'border-red-200 bg-red-50 text-red-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    info: 'border-[#BFDBFE] bg-[#EFF6FF] text-slate-700',
  }[statusType];
  const statusIconStyle = {
    error: 'text-red-500',
    success: 'text-emerald-500',
    info: 'text-[#2563EB]',
  }[statusType];

  /* Render */
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cashier POS"
        description="Full shopping cart management — add, remove, adjust quantities, apply discounts, and process payment."
      />

      {/* Summary stat cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            icon: <ShoppingCart className="w-5 h-5" />,
            label: 'Cart lines',
            value: cart.length,
          },
          {
            icon: <PackageSearch className="w-5 h-5" />,
            label: 'Total units',
            value: totalUnits,
          },
          {
            icon: <TrendingDown className="w-5 h-5" />,
            label: 'Total savings',
            value: currency.format(itemSavings + orderDiscountAmount),
            accent: (itemSavings + orderDiscountAmount) > 0,
          },
          {
            icon: <Barcode className="w-5 h-5" />,
            label: 'Checkout total',
            value: currency.format(total),
            primary: true,
          },
        ].map(({ icon, label, value, primary, accent }) => (
          <Card
            key={label}
            className={`border-[#E2E8F0] shadow-[0_8px_30px_rgba(37,99,235,0.08)] transition-all duration-300 ${primary ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-slate-900'
              }`}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${primary ? 'bg-white/20 text-white' : accent ? 'bg-emerald-50 text-emerald-600' : 'bg-[#EFF6FF] text-[#2563EB]'
                }`}>
                {icon}
              </div>
              <div>
                <div className={`text-xs uppercase tracking-wider ${primary ? 'text-blue-100' : 'text-slate-500'}`}>{label}</div>
                <div className={`text-xl font-bold ${primary ? 'text-white' : accent ? 'text-emerald-600' : ''}`}>{value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main 2-column layout */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">

        {/* LEFT COLUMN */}
        <div className="space-y-6">

          {/* Add items card */}
          <Card className="bg-white border-[#E2E8F0] shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <CardHeader className="border-b border-[#E2E8F0]">
              <CardTitle className="text-slate-900">Add items to sale</CardTitle>
              <CardDescription className="text-slate-500">
                Scan a barcode, search by name, or enter a SKU manually.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Barcode scanner row */}
              <form className="grid gap-3 lg:grid-cols-[1fr_auto_auto]" onSubmit={handleBarcodeSubmit}>
                <div className="relative">
                  <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    autoFocus
                    value={barcodeValue}
                    onChange={(e) => setBarcodeValue(e.target.value)}
                    placeholder="Scan barcode — press Enter to add"
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition"
                  />
                </div>
                <Button type="submit" className="h-11 bg-[#2563EB] hover:bg-[#1E40AF] rounded-xl px-5">
                  Add by scan
                </Button>
                <Button type="button" variant="outline" className="h-11 rounded-xl border-[#E2E8F0] bg-white text-slate-700 hover:bg-[#EFF6FF] hover:border-[#BFDBFE]" onClick={() => setBarcodeValue('')}>
                  Clear
                </Button>
              </form>

              {mockBarcodeSamples.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 self-center mr-1">Mock barcodes</span>
                  {mockBarcodeSamples.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleMockBarcodeScan(product.barcode)}
                      className="group inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-slate-50 px-3 py-1.5 text-xs text-slate-700 transition hover:border-[#BFDBFE] hover:bg-[#EFF6FF]"
                      title={`Simulate scanning ${product.barcode}`}
                    >
                      <span className="font-mono text-[11px] text-[#2563EB]">{product.barcode}</span>
                      <span className="max-w-[12rem] truncate group-hover:text-slate-900">{product.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Search + manual SKU */}
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <SearchInput
                  placeholder="Search by name, barcode, or category"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-none bg-white border-[#E2E8F0] text-slate-900 placeholder:text-slate-400 animate-none"
                />
                <div className="flex gap-2">
                  <input
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
                    placeholder="Manual SKU / barcode"
                    className="w-52 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition"
                  />
                  <Button type="button" onClick={handleManualAdd} className="rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] h-11">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              </div>

              {/* Status banner */}
              <div className={`rounded-xl border p-3 text-sm flex items-start gap-2.5 transition-colors ${statusStyle}`}>
                <StatusIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${statusIconStyle}`} />
                <p>{statusMessage}</p>
              </div>
            </CardContent>
          </Card>

          {/* Product grid card */}
          <Card className="bg-white border-[#E2E8F0] shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <CardHeader className="border-b border-[#E2E8F0]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-slate-900">Mock inventory</CardTitle>
                  <CardDescription className="text-slate-500">Click a product card to add it to the cart.</CardDescription>
                </div>
                <span className="text-xs text-[#2563EB] uppercase tracking-wider bg-[#EFF6FF] px-3 py-1.5 rounded-full font-semibold">
                  {inventoryLoading ? 'Loading...' : `${filteredProducts.length} match${filteredProducts.length !== 1 ? 'es' : ''}`}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {inventoryLoading ? (
                <div className="rounded-2xl border border-dashed border-[#BFDBFE] bg-[#EFF6FF] p-8 text-center text-slate-500">
                  <PackageSearch className="w-8 h-8 mx-auto mb-2 text-[#2563EB] animate-pulse" />
                  <p className="text-sm font-medium text-slate-700">Loading mock inventory products...</p>
                  <p className="text-xs mt-1 text-slate-400">The POS grid will populate once the backend responds.</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#BFDBFE] bg-[#EFF6FF] p-8 text-center text-slate-500">
                  <PackageSearch className="w-8 h-8 mx-auto mb-2 text-[#2563EB]" />
                  <p className="text-sm">No products match your search.</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => {
                    const inCart = cart.find((i) => i.id === product.id);
                    const catStyle = CATEGORY_COLORS[product.category] || defaultCat;
                    return (
                      <div
                        key={product.id}
                        className={`rounded-2xl border p-4 space-y-3 transition-all duration-200 ${inCart
                            ? 'border-[#2563EB] bg-[#EFF6FF] shadow-md'
                            : 'border-[#E2E8F0] bg-white shadow-sm hover:border-[#BFDBFE] hover:shadow-md'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${catStyle.bg} ${catStyle.text}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${catStyle.dot}`} />
                              {product.category}
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 mt-1.5 leading-snug">{product.name}</h3>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-bold text-[#2563EB]">{currency.format(product.price)}</div>
                            <div className="text-[10px] text-slate-400">/{product.unit}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg bg-white/60 px-2.5 py-1.5 border border-[#E2E8F0]">
                            <div className="text-[10px] text-slate-400 uppercase tracking-wide">SKU</div>
                            <div className="text-slate-700 font-medium text-[11px]">{product.sku}</div>
                          </div>
                          <div className={`rounded-lg px-2.5 py-1.5 border ${product.stock <= 10 ? 'bg-red-50 border-red-200' : 'bg-white/60 border-[#E2E8F0]'}`}>
                            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Stock</div>
                            <div className={`font-medium text-[11px] ${product.stock <= 10 ? 'text-red-600' : 'text-slate-700'}`}>
                              {product.stock} {product.unit}s
                            </div>
                          </div>
                        </div>

                        <Button
                          type="button"
                          className={`w-full rounded-xl text-sm h-9 transition-all ${inCart
                              ? 'bg-[#1E40AF] hover:bg-[#1E3A8A] shadow-md shadow-blue-300/30'
                              : 'bg-[#2563EB] hover:bg-[#1E40AF]'
                            }`}
                          onClick={() => addProductToCart(product)}
                        >
                          {inCart ? (
                            <><Check className="w-3.5 h-3.5 mr-1.5" />In cart ({inCart.quantity})</>
                          ) : (
                            <><Plus className="w-3.5 h-3.5 mr-1.5" />Add to cart</>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">

          {/* Cart card */}
          <Card className="bg-white border-[#E2E8F0] shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <CardHeader className="border-b border-[#E2E8F0]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-[#2563EB]" />
                    Shopping Cart
                    {cart.length > 0 && (
                      <span className="ml-1 h-5 min-w-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center px-1.5">
                        {totalUnits}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-slate-500">Adjust quantities, apply item discounts, and review totals.</CardDescription>
                </div>
                <Button
                  type="button" variant="ghost"
                  className="text-slate-500 hover:text-red-500 hover:bg-red-50 text-xs"
                  onClick={clearSale}
                  disabled={cart.length === 0}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Cart items */}
              {cart.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#BFDBFE] bg-[#EFF6FF] p-10 text-center text-slate-500">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-[#2563EB] opacity-60" />
                  <p className="text-sm font-medium">Your cart is empty</p>
                  <p className="text-xs mt-1 text-slate-400">Add products from the inventory panel.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-0.5">
                  {cart.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onQuantitySet={setCartQuantity}
                      onDelta={updateCartQuantity}
                      onRemove={removeCartItem}
                      onItemDiscount={applyItemDiscount}
                    />
                  ))}
                </div>
              )}

              {/* Order-level discount */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FAFAFA] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-violet-500" /> Order Discount
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowOrderDiscount((v) => !v)}
                    className="text-[11px] text-[#2563EB] hover:underline flex items-center gap-0.5"
                  >
                    {orderDiscountMode !== DISCOUNT_MODES.NONE && (parseFloat(orderDiscount) || 0) > 0
                      ? 'Edit'
                      : 'Add'}{' '}
                    <ChevronDown className={`w-3 h-3 transition-transform ${showOrderDiscount ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {showOrderDiscount && (
                  <div className="mt-3 space-y-2.5 fade-up">
                    <div className="flex gap-2">
                      {[DISCOUNT_MODES.PERCENT, DISCOUNT_MODES.FLAT].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setOrderDiscountMode(m)}
                          className={`flex-1 rounded-xl py-1.5 text-xs font-semibold transition-colors ${orderDiscountMode === m ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          {m === DISCOUNT_MODES.PERCENT ? <><Percent className="w-3 h-3 inline mr-1" />Percent</> : <><DollarSign className="w-3 h-3 inline mr-1" />Flat</>}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setOrderDiscountMode(DISCOUNT_MODES.NONE);
                          setIsCheckoutOpen(false);
                          setCheckoutStep('payment');
                          setOrderDiscount('');
                          setShowOrderDiscount(false);
                        }}
                        className="rounded-xl py-1.5 px-3 text-xs font-semibold bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 border border-slate-200 transition-colors"
                      >
                        Clear
                      </button>
                    </div>

                    <input
                      type="number"
                      min="0"
                      value={orderDiscount}
                      onChange={(e) => setOrderDiscount(e.target.value)}
                      placeholder={orderDiscountMode === DISCOUNT_MODES.PERCENT ? 'Discount % (e.g. 10)' : 'Amount LKR (e.g. 500)'}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                    />

                    <Button
                      type="button"
                      className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 h-9 text-xs font-semibold"
                      onClick={applyOrderDiscount}
                    >
                      Apply Order Discount
                    </Button>
                  </div>
                )}
              </div>

              {/* Tax editing */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FAFAFA] p-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-slate-400" /> Tax Rate
                </span>
                {editingTaxRate ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={draftTaxRate}
                      onChange={(e) => setDraftTaxRate(e.target.value)}
                      className="w-16 rounded border border-slate-200 px-1 py-0.5 text-xs text-right focus:border-[#2563EB] outline-none"
                    />
                    <button onClick={confirmTaxRate} className="text-xs font-bold text-emerald-600 hover:underline">OK</button>
                    <button onClick={() => setEditingTaxRate(false)} className="text-xs text-slate-400 hover:underline">Cancel</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setDraftTaxRate(String(taxRate)); setEditingTaxRate(true); }}
                    className="text-xs text-[#2563EB] hover:underline flex items-center gap-0.5 font-semibold"
                  >
                    {taxRate}% <Edit3 className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Order summary totals */}
              {cart.length > 0 && (
                <OrderSummary
                  subtotal={subtotal}
                  itemSavings={itemSavings}
                  orderDiscountAmount={orderDiscountAmount}
                  orderDiscountMode={orderDiscountMode}
                  orderDiscount={orderDiscount}
                  taxRate={taxRate}
                  tax={tax}
                  total={total}
                />
              )}

              {/* Checkout actions */}
              <div className="flex gap-3">
                <Button
                  type="button" variant="outline"
                  className="flex-1 rounded-xl h-11 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                  disabled={cart.length === 0}
                  onClick={() => notify('Sale held (simulated).', 'info')}
                >
                  Hold sale
                </Button>
                <Button
                  type="button"
                  className="flex-1 rounded-xl h-11 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold"
                  disabled={cart.length === 0}
                  onClick={() => {
                    navigate('/pos-checkout', {
                      state: {
                        cart,
                        subtotal,
                        itemSavings,
                        orderDiscountAmount,
                        tax,
                        total,
                        totalUnits,
                        orderDiscount,
                        orderDiscountMode,
                        taxRate
                      }
                    });
                  }}
                >
                  Checkout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}