import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Barcode, Plus, ScanBarcode, Trash2, Minus, CreditCard, Banknote,
  PackageSearch, ShoppingCart, RotateCcw, CircleAlert, Tag, Percent,
  ChevronDown, Check, AlertCircle, Receipt, DollarSign, Edit3, X,
  TrendingDown, Calculator, BadgePercent, Gift, ChevronLeft, ChevronRight,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';
import Button from '../components/Button';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import Modal from '../components/Modal';
import { useProductsList } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import api from '../services/api';
import { useQueryClient } from '@tanstack/react-query';

/* Currency formatter */
const currency = {
  format: (value) => `Rs. ${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`,
};

/* Discount modes */
const DISCOUNT_MODES = { NONE: 'none', PERCENT: 'percent', FLAT: 'flat' };

/* Category colour map */
const CATEGORY_COLORS = {
  Apparel: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  "Men's Wear": { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  "Women's Wear": { bg: 'bg-pink-50', text: 'text-pink-700', dot: 'bg-pink-400' },
  "Kids Wear": { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  Electronics: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-400' },
  Smartphones: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-400' },
  Laptops: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-400' },
  'Electronic Accessories': { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-400' },
  Footwear: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  'Casual Shoes': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  'Formal Shoes': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  'Sports Shoes': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  Skincare: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-400' },
  Moisturizers: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-400' },
  Sunscreen: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-400' },
  Eyewear: { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-400' },
  Sunglasses: { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-400' },
  'Prescription Glasses': { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-400' },
  Accessories: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-400' },
};
const defaultCat = { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-400' };

const normalizeLookupValue = (value) => String(value ?? '').trim().toLowerCase().replace(/[\s-]/g, '');



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
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.resetQueries({ queryKey: ['products'] });
  }, [queryClient]);

  const restoredState = location.state || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeValue, setBarcodeValue] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [cart, setCart] = useState(() => (Array.isArray(restoredState.cart) ? restoredState.cart : []));
  const { data: productsData, isLoading: inventoryLoading, error: productsError } = useProductsList({
    limit: 1000,
    status: 'ACTIVE',
  });

  const [statusMessage, setStatusMessage] = useState('Loading inventory products...');
  const [statusType, setStatusType] = useState('info'); // info | success | error

  const inventoryProducts = useMemo(() => {
    if (!productsData?.data) return [];
    return productsData.data.map(p => {
      const productId = p.id || p._id;
      const inCart = cart.find(item => item.id === productId);
      const baseStock = p.totalStock ?? p.stock ?? 0;
      const currentStock = Math.max(0, baseStock - (inCart ? inCart.quantity : 0));
      return {
        id: productId,
        barcode: p.barcode || '',
        name: p.name || 'Unnamed Product',
        price: p.pricing?.sellingPrice ?? p.sellingPrice ?? p.price ?? 0,
        currency: 'LKR',
        unit: p.unit || 'pcs',
        stock: currentStock,
        sku: p.sku || 'N/A',
        category: p.category?.name ?? (typeof p.category === 'string' ? p.category : 'Uncategorised')
      };
    });
  }, [productsData, cart]);

  useEffect(() => {
    if (productsError) {
      setStatusMessage(`Failed to load inventory: ${productsError.message || 'Unknown error'}`);
      setStatusType('error');
    } else if (!inventoryLoading) {
      setStatusMessage(`Loaded ${inventoryProducts.length} inventory products.`);
      setStatusType('success');
    } else {
      setStatusMessage('Loading inventory products...');
      setStatusType('info');
    }
  }, [inventoryLoading, productsError, inventoryProducts.length]);

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
  const [taxRate, setTaxRate] = useState(0);
  const [editingTaxRate, setEditingTaxRate] = useState(false);
  const [draftTaxRate, setDraftTaxRate] = useState('0');

  /* Stock Alert Popup State */
  const [stockAlert, setStockAlert] = useState(null);

  /* Category Management Hook */
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  /* Category Filter State */
  const [selectedCategory, setSelectedCategory] = useState('All');

  /* Pagination State */
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 10;

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

  // Get active categories from category management
  const categoriesList = useMemo(() => {
    return Array.isArray(categoriesData) ? categoriesData.filter(c => c.status === 'ACTIVE') : [];
  }, [categoriesData]);

  const categories = useMemo(() => {
    if (categoriesList && categoriesList.length > 0) {
      return ['All', ...categoriesList.map(c => c.name).sort()];
    }
    if (inventoryProducts && inventoryProducts.length > 0) {
      const list = new Set(inventoryProducts.map(p => p.category));
      return ['All', ...Array.from(list).sort()];
    }
    return ['All'];
  }, [categoriesList, inventoryProducts]);

  // Find sub-categories of the selected category to perform hierarchical filtering
  const activeCategoryNames = useMemo(() => {
    if (selectedCategory === 'All') return [];

    // Find the selected category document
    const selectedCatDoc = categoriesList.find(c => c.name === selectedCategory);
    if (!selectedCatDoc) return [selectedCategory];

    // Find all sub-categories that have this category as parentCategory
    const subCats = categoriesList.filter(c =>
      c.parentCategory === selectedCatDoc._id ||
      c.parentCategory?._id === selectedCatDoc._id ||
      c.parentCategory === selectedCatDoc.id ||
      c.parentCategory?.id === selectedCatDoc.id
    );

    return [selectedCategory, ...subCats.map(c => c.name)];
  }, [selectedCategory, categoriesList]);

  /* Filtered products */
  const filteredProducts = useMemo(() => {
    let products = inventoryProducts;

    if (selectedCategory !== 'All') {
      products = products.filter(p => activeCategoryNames.includes(p.category));
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.category, p.sku, p.barcode].join(' ').toLowerCase().includes(q)
    );
  }, [inventoryProducts, searchQuery, selectedCategory, activeCategoryNames]);

  // Reset page to 1 when user searches or switches category
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  /* Cart actions */
  const notify = (msg, type = 'info') => { setStatusMessage(msg); setStatusType(type); };

  const addProductToCart = useCallback(async (product) => {
    if (product.stock <= 0) {
      notify(`⚠️ Cannot add ${product.name}. This product is out of stock.`, 'error');
      setStockAlert({
        title: 'Product Out of Stock',
        message: `The product "${product.name}" is currently out of stock and cannot be added to the sale.`,
        productName: product.name,
        stock: 0
      });
      return;
    }

    let prev;
    setCart((cur) => {
      prev = cur;
      const existing = cur.find((i) => i.id === product.id);
      if (existing) {
        return cur.map((i) => {
          if (i.id !== product.id) return i;
          return { ...i, quantity: i.quantity + 1 };
        });
      }
      return [...cur, { ...product, quantity: 1, itemDiscount: 0, itemDiscountMode: DISCOUNT_MODES.NONE }];
    });

    notify(`✓ ${product.name} added to cart.`, 'success');

    try {
      await api.post('/pos-billing/adjust-stock', { productId: product.id, delta: -1 });
    } catch (error) {
      console.error(error);
      notify(`⚠️ Failed to sync database stock: ${error.response?.data?.message || error.message}`, 'error');
      if (prev) setCart(prev);
    }
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
      notify('No product matched that barcode. Try another sample barcode.', 'error');
      return;
    }

    addProductToCart(product);
    setBarcodeValue('');
  }, [addProductToCart, findProduct]);

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const scanValue = barcodeValue.trim();
    if (!scanValue) {
      notify('Enter a barcode value or pick one of the sample barcodes below.', 'info');
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

  const updateCartQuantity = async (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    let prev;
    setCart((cur) => {
      prev = cur;
      return cur.map((i) => {
        if (i.id !== id) return i;
        const next = i.quantity + delta;
        if (next <= 0) return null;
        return { ...i, quantity: next };
      }).filter(Boolean);
    });

    notify(delta > 0 ? `✓ Added 1 unit.` : `✓ Removed 1 unit.`, 'success');

    try {
      await api.post('/pos-billing/adjust-stock', { productId: id, delta: -delta });
    } catch (error) {
      console.error(error);
      notify(`⚠️ Failed to update stock: ${error.response?.data?.message || error.message}`, 'error');
      if (prev) setCart(prev);
    }
  };

  const setCartQuantity = async (id, qty) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    const diff = qty - item.quantity;
    if (diff === 0) return;

    let prev;
    setCart((cur) => {
      prev = cur;
      return cur.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
    });

    notify(`✓ Updated quantity to ${qty}.`, 'success');

    try {
      await api.post('/pos-billing/adjust-stock', { productId: id, delta: -diff });
    } catch (error) {
      console.error(error);
      notify(`⚠️ Failed to update stock: ${error.response?.data?.message || error.message}`, 'error');
      if (prev) setCart(prev);
    }
  };

  const removeCartItem = async (id) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    let prev;
    setCart((cur) => {
      prev = cur;
      return cur.filter((i) => i.id !== id);
    });

    notify(`✓ ${item.name} removed from cart.`, 'success');

    try {
      await api.post('/pos-billing/adjust-stock', { productId: id, delta: item.quantity });
    } catch (error) {
      console.error(error);
      notify(`⚠️ Failed to remove item: ${error.response?.data?.message || error.message}`, 'error');
      if (prev) setCart(prev);
    }
  };

  const applyItemDiscount = (id, value, mode) => {
    setCart((cur) =>
      cur.map((i) => i.id === id ? { ...i, itemDiscount: value, itemDiscountMode: mode } : i)
    );
  };

  const clearSale = async () => {
    if (cart.length === 0) return;

    const currentCart = [...cart];
    setCart([]);
    setOrderDiscount('');
    setOrderDiscountMode(DISCOUNT_MODES.NONE);
    notify('Sale cleared and database stock restored.', 'info');

    try {
      const adjustments = currentCart.map(item => ({ productId: item.id, delta: item.quantity }));
      await api.post('/pos-billing/adjust-stock', { adjustments });
    } catch (error) {
      console.error(error);
      notify(`⚠️ Failed to clear sale: ${error.response?.data?.message || error.message}`, 'error');
      setCart(currentCart);
    }
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
              <div className="grid gap-6 md:grid-cols-2">
                {/* Barcode & Manual SKU Column */}
                <div className="space-y-3.5 md:border-r md:border-slate-100 md:pr-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Barcode & SKU Entry</span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Scanner Active
                    </span>
                  </div>

                  <form className="flex gap-2" onSubmit={handleBarcodeSubmit}>
                    <div className="relative flex-1">
                      <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        autoFocus
                        value={barcodeValue}
                        onChange={(e) => setBarcodeValue(e.target.value)}
                        placeholder="Scan barcode — press Enter"
                        className="w-full h-11 rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition"
                      />
                    </div>
                    <Button type="submit" className="h-11 bg-[#2563EB] hover:bg-[#1E40AF] rounded-xl px-4 flex-shrink-0 text-xs font-bold">
                      Scan
                    </Button>
                  </form>

                  <div className="flex gap-2">
                    <input
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
                      placeholder="Or enter SKU manually"
                      className="flex-1 h-11 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition"
                    />
                    <Button type="button" onClick={handleManualAdd} className="h-11 rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-4 flex-shrink-0 text-xs font-bold">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                  </div>
                </div>

                {/* Search & Category Filter Column */}
                <div className="space-y-3.5 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Browse Inventory</span>
                    <SearchInput
                      placeholder="Search products by name or SKU"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-none bg-white border-[#E2E8F0] text-slate-900 placeholder:text-slate-400 animate-none h-11"
                    />
                  </div>

                  <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                    {categories.length > 1 && (
                      <select
                        id="category-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full h-11 text-sm bg-slate-50 text-slate-700 border border-[#E2E8F0] rounded-xl px-3.5 outline-none focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all font-semibold cursor-pointer"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat === 'All' ? 'All Categories' : cat}
                          </option>
                        ))}
                      </select>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setBarcodeValue('');
                        setManualCode('');
                      }}
                      className="h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all"
                      title="Reset all filters and inputs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                  </div>
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
                  <CardTitle className="text-slate-900">Branch Inventory</CardTitle>
                  <CardDescription className="text-slate-500">Click a product card to add it to the cart.</CardDescription>
                </div>
                <span className="text-xs text-[#2563EB] uppercase tracking-wider bg-[#EFF6FF] px-3 py-1.5 rounded-full font-semibold">
                  {inventoryLoading ? 'Loading...' : `${filteredProducts.length} match${filteredProducts.length !== 1 ? 'es' : ''}`}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">


              {inventoryLoading ? (
                <div className="rounded-2xl border border-dashed border-[#BFDBFE] bg-[#EFF6FF] p-8 text-center text-slate-500">
                  <PackageSearch className="w-8 h-8 mx-auto mb-2 text-[#2563EB] animate-pulse" />
                  <p className="text-sm font-medium text-slate-700">Loading inventory products...</p>
                  <p className="text-xs mt-1 text-slate-400">The POS grid will populate once the backend responds.</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#BFDBFE] bg-[#EFF6FF] p-8 text-center text-slate-500">
                  <PackageSearch className="w-8 h-8 mx-auto mb-2 text-[#2563EB]" />
                  <p className="text-sm">No products match your search.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {paginatedProducts.map((product) => {
                      const inCart = cart.find((i) => i.id === product.id);
                      const catStyle = CATEGORY_COLORS[product.category] || defaultCat;
                      
                      // Stock status styles
                      let stockBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      let stockText = `${product.stock} ${product.unit}s`;
                      let stockAlertText = 'In Stock';
                      let stockProgressColor = 'bg-emerald-500';

                      if (product.stock === 0) {
                        stockBadgeColor = 'bg-red-50 text-red-700 border-red-200';
                        stockAlertText = 'Out of Stock';
                        stockText = '0 units';
                        stockProgressColor = 'bg-red-300';
                      } else if (product.stock <= 5) {
                        stockBadgeColor = 'bg-red-50 text-red-700 border-red-200 animate-pulse';
                        stockAlertText = `Critical: Only ${product.stock} left!`;
                        stockProgressColor = 'bg-red-500';
                      } else if (product.stock <= 15) {
                        stockBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                        stockAlertText = 'Low Stock';
                        stockProgressColor = 'bg-amber-500';
                      }

                      const stockPercentage = Math.min((product.stock / 50) * 100, 100);

                      return (
                        <div
                          key={product.id}
                          className={`group relative rounded-2xl border bg-white p-4 flex flex-col justify-between transition-all duration-300 min-h-[260px] ${inCart
                            ? 'border-[#2563EB] ring-2 ring-[#2563EB]/15 bg-gradient-to-b from-[#EFF6FF]/60 to-white shadow-lg'
                            : 'border-slate-200/80 hover:border-blue-300/80 hover:shadow-[0_12px_24px_-8px_rgba(59,130,246,0.12)] hover:-translate-y-1'
                            }`}
                        >
                          {/* Row 1: Category & SKU */}
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${catStyle.bg} ${catStyle.text} border-transparent`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${catStyle.dot}`} />
                              {product.category}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              SKU: {product.sku}
                            </span>
                          </div>

                          {/* Row 2: Product Name */}
                          <div className="mt-3 mb-2">
                            <h3 className="text-xs font-bold text-slate-800 leading-snug tracking-tight line-clamp-2 min-h-[34px] group-hover:text-slate-950">
                              {product.name}
                            </h3>
                          </div>

                          {/* Row 3: Price and Barcode */}
                          <div className="flex items-center justify-between gap-2 mt-auto border-t border-slate-100 pt-2.5">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Price</span>
                              <span className="text-sm font-extrabold text-[#2563EB]">
                                {currency.format(product.price)}
                              </span>
                            </div>
                            {product.barcode && (
                              <div className="flex flex-col items-end">
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Barcode</span>
                                <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 rounded px-1.5 py-0.5 border border-slate-200/30">
                                  {product.barcode}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Row 4: Stock Indicator */}
                          <div className="space-y-1.5 mt-3">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-slate-400 uppercase tracking-wider">Stock Status</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${stockBadgeColor}`}>
                                {stockAlertText}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${stockProgressColor}`}
                                  style={{ width: `${stockPercentage}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-bold text-slate-700 min-w-[40px] text-right">
                                {stockText}
                              </span>
                            </div>
                          </div>

                          {/* Row 5: Action Button */}
                          <div className="mt-3.5">
                            <Button
                              type="button"
                              disabled={product.stock === 0}
                              className={`w-full rounded-xl text-xs h-9 font-bold transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 ${inCart
                                ? 'bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 hover:shadow-md text-white border-transparent'
                                : 'bg-[#2563EB] hover:bg-[#1E40AF] text-white border-transparent hover:shadow-md'
                                }`}
                              onClick={() => addProductToCart(product)}
                            >
                              {inCart ? (
                                <><Check className="w-3.5 h-3.5" /> In Cart ({inCart.quantity})</>
                              ) : product.stock === 0 ? (
                                <>Out of stock</>
                              ) : (
                                <><Plus className="w-3.5 h-3.5" /> Add to Sale</>
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E2E8F0] mt-2">
                      <div className="text-xs font-medium text-slate-500">
                        Showing <span className="font-semibold text-slate-800">{Math.min((currentPage - 1) * PRODUCTS_PER_PAGE + 1, filteredProducts.length)}</span> to <span className="font-semibold text-slate-800">{Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)}</span> of <span className="font-semibold text-slate-800">{filteredProducts.length}</span> products
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="h-8 px-2.5 rounded-lg border border-[#E2E8F0] bg-white text-slate-600 hover:bg-slate-50 hover:border-[#BFDBFE] disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-[#E2E8F0] flex items-center justify-center transition-all"
                        >
                          <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          const isActive = page === currentPage;
                          return (
                            <button
                              key={page}
                              type="button"
                              onClick={() => setCurrentPage(page)}
                              className={`h-8 w-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${isActive
                                ? 'bg-[#2563EB] text-white shadow-md shadow-blue-300/30 font-bold'
                                : 'border border-[#E2E8F0] bg-white text-slate-600 hover:bg-slate-50 hover:border-[#BFDBFE]'
                                }`}
                            >
                              {page}
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="h-8 px-2.5 rounded-lg border border-[#E2E8F0] bg-white text-slate-600 hover:bg-slate-50 hover:border-[#BFDBFE] disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-[#E2E8F0] flex items-center justify-center transition-all"
                        >
                          Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </button>
                      </div>
                    </div>
                  )}
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
                      placeholder={orderDiscountMode === DISCOUNT_MODES.PERCENT ? 'Discount % (e.g. 10)' : 'Amount Rs. (e.g. 500)'}
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

      {/* Stock Limit & Out-of-Stock Modal */}
      <Modal isOpen={!!stockAlert} onClose={() => setStockAlert(null)} title={stockAlert?.title || 'Stock Alert'} size="sm">
        <div className="space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <CircleAlert className="h-6 w-6 animate-pulse" />
          </div>
          <div className="space-y-2 text-center">
            <h4 className="font-bold text-slate-800 text-base">{stockAlert?.title}</h4>
            <p className="text-sm text-slate-500 leading-relaxed">{stockAlert?.message}</p>
          </div>
          <div className="pt-2">
            <Button
              className="w-full rounded-xl h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              onClick={() => setStockAlert(null)}
            >
              OK
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}