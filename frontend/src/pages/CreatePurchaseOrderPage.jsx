import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from '../components/PageHeader';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Plus,
  Minus,
  Trash2,
  Send,
  Pencil,
  Calendar,
  Check,
  Building2,
  Loader2,
} from "lucide-react";

/* ───────────────────────── API base ───────────────────────── */
const API_BASE = "/api/v1/purchase-orders";

const TAX_RATE = 0.085;
const SHIPPING_FLAT = 45.0;

const STEPS = [
  { number: 1, label: "Supplier Selection" },
  { number: 2, label: "Add Items" },
  { number: 3, label: "Review & Submit" },
];

const currency = (n) =>
  `Rs. ${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ───────────────────────── Step indicator ───────────────────────── */

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((step, idx) => {
        const isComplete = currentStep > step.number;
        const isActive = currentStep === step.number;
        return (
          <div key={step.number} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors ${
                  isComplete
                    ? "bg-blue-600 text-white"
                    : isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}
              >
                {isComplete ? <Check className="w-4 h-4" /> : step.number}
              </div>
              <span
                className={`mt-2 text-xs font-semibold whitespace-nowrap ${
                  isActive || isComplete ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-3 mb-5 rounded ${
                  currentStep > step.number ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────────────── Step 1: Supplier Selection ───────────────────────── */

function SupplierStep({ data, setData, onNext, onCancel }) {
  const [query, setQuery] = useState(data.supplier?.name || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [suppliers, setSuppliers] = useState([]);

  // Keep the search box in sync if the supplier was pre-filled (edit mode)
  useEffect(() => {
    if (data.supplier?.name) setQuery(data.supplier.name);
  }, [data.supplier?.name]);

  // Fetch suppliers from backend whenever the search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`${API_BASE}/suppliers?search=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setSuppliers(json.data);
        })
        .catch((err) => console.error("Failed to load suppliers:", err));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const filtered = suppliers;

  const selectSupplier = async (supplier) => {
    try {
      const res = await fetch(`${API_BASE}/suppliers/${supplier._id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      const detail = json.data;

      setData((prev) => ({
        ...prev,
        supplier: {
          _id: detail.supplierId,
          id: detail.supplierCode,
          name: detail.name,
          contactTitle: detail.contact?.role || "",
        },
        contactPerson: detail.contact?.name || "",
        email: detail.contact?.email || "",
        phone: detail.contact?.phone || "",
      }));
      setQuery(detail.name);
    } catch (err) {
      console.error("Failed to load supplier details:", err);
    } finally {
      setShowDropdown(false);
    }
  };

  const canProceed = data.supplier && data.deliveryDate;

  return (
    <div className="border border-gray-200 rounded-xl bg-white p-6">
      <h2 className="text-xl font-bold text-gray-900">
        {data.isEdit ? "Edit Purchase Order" : "New Purchase Order"}
      </h2>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Step 1: Select a supplier and confirm contact details.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Select Supplier
            </label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50/50 focus-within:border-blue-400 transition-colors">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                className="outline-none text-sm text-gray-700 placeholder-gray-400 w-full bg-transparent"
                placeholder="Search or select a supplier..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowDropdown(true);
                  if (data.supplier) setData((p) => ({ ...p, supplier: null }));
                }}
                onFocus={() => setShowDropdown(true)}
              />
            </div>
            {showDropdown && query && filtered.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                {filtered.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => selectSupplier(s)}
                    className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors flex items-center gap-2 border-b border-gray-100 last:border-0"
                  >
                    <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-800">{s.name}</div>
                      <div className="text-xs text-gray-400">ID: {s.supplierId}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Expected Delivery Date <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50/50 focus-within:border-blue-400 transition-colors">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="date"
                className="outline-none text-sm text-gray-700 w-full bg-transparent"
                value={data.deliveryDate}
                onChange={(e) => setData((p) => ({ ...p, deliveryDate: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Shipping Address
            </label>
            <textarea
              rows={4}
              className="w-full outline-none text-sm text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50/50 focus:border-blue-400 transition-colors resize-none"
              placeholder="Enter full delivery address..."
              value={data.shippingAddress}
              onChange={(e) => setData((p) => ({ ...p, shippingAddress: e.target.value }))}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">
            Supplier Information
          </h3>

          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Contact Person
          </label>
          <input
            className="w-full outline-none text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-100 mb-4"
            value={data.contactPerson}
            readOnly
            placeholder="—"
          />

          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Email Address
          </label>
          <input
            className="w-full outline-none text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-100 mb-4"
            value={data.email}
            readOnly
            placeholder="—"
          />

          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Phone Number
          </label>
          <input
            className="w-full outline-none text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-100 mb-4"
            value={data.phone}
            readOnly
            placeholder="—"
          />

          {data.supplier && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 mt-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{data.supplier.name}</div>
                <div className="text-xs text-gray-400">ID: {data.supplier.id}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm ${
            canProceed
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Next: Add Items
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── Step 2: Add Items ───────────────────────── */

function AddItemsStep({ data, setData, onNext, onBack }) {
  const [search, setSearch] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  // Fetch live catalog + stock from backend whenever search changes
  useEffect(() => {
    if (!data.supplier?._id) {
      setCatalog([]);
      setLoadingCatalog(false);
      return;
    }

    setLoadingCatalog(true);
    const timer = setTimeout(() => {
      fetch(`${API_BASE}/catalog?search=${encodeURIComponent(search)}&supplierId=${data.supplier._id}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setCatalog(json.data || []);
          } else {
            setCatalog([]);
          }
        })
        .catch((err) => {
          console.error("Failed to load catalog:", err);
          setCatalog([]);
        })
        .finally(() => setLoadingCatalog(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [search, data.supplier?._id]);

  const filteredCatalog = catalog;

  const getQty = (sku) => data.items.find((i) => i.sku === sku)?.qty || 0;

  const setQty = (product, qty) => {
    setData((prev) => {
      const existing = prev.items.find((i) => i.sku === product.sku);
      if (qty <= 0) {
        return { ...prev, items: prev.items.filter((i) => i.sku !== product.sku) };
      }
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((i) => (i.sku === product.sku ? { ...i, qty } : i)),
        };
      }
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            productId: product.productId,
            sku: product.sku,
            name: product.name,
            price: product.unitPrice,
            qty,
          },
        ],
      };
    });
  };

  const removeItem = (sku) =>
    setData((prev) => ({ ...prev, items: prev.items.filter((i) => i.sku !== sku) }));

  const subtotal = data.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * TAX_RATE;
  const shipping = data.items.length > 0 ? SHIPPING_FLAT : 0;
  const total = subtotal + tax + shipping;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
      {/* Catalog */}
      <div className="border border-gray-200 rounded-xl bg-white p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Product Catalog</h3>
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50/50 mb-4 focus-within:border-blue-400 transition-colors">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            className="outline-none text-sm text-gray-700 placeholder-gray-400 w-full bg-transparent"
            placeholder="Search by SKU, name, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
          {!data.supplier?._id && (
            <p className="text-sm text-gray-500 text-center py-8">
              Select a supplier in step 1 to load that supplier&apos;s items.
            </p>
          )}

          {data.supplier?._id && loadingCatalog && (
            <p className="text-sm text-gray-500 text-center py-8">Loading supplier items...</p>
          )}

          {data.supplier?._id && !loadingCatalog && filteredCatalog.map((product) => {
            const qty = getQty(product.sku);
            const outOfStock = product.availableStock === 0;
            return (
              <div
                key={product.sku}
                className={`border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-3 ${
                  outOfStock ? "opacity-60" : ""
                }`}
              >
                <div>
                  <div className="text-xs text-gray-400">SKU: {product.sku}</div>
                  <div className="text-sm font-semibold text-gray-800">{product.name}</div>
                  <div className="text-sm font-bold text-blue-600 mt-1">
                    {currency(product.unitPrice)}
                  </div>
                  <div className={`text-xs font-medium mt-1 ${outOfStock ? "text-red-500" : "text-amber-600"}`}>
                    {product.stockLabel}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    disabled={outOfStock || qty === 0}
                    onClick={() => setQty(product, qty - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-gray-700">{qty}</span>
                  <button
                    disabled={outOfStock}
                    onClick={() => setQty(product, qty + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {data.supplier?._id && !loadingCatalog && filteredCatalog.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">
              No items are available for this supplier yet. Add products and link them to the supplier in Product Management.
            </p>
          )}
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-2 mt-5 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Supplier
        </button>
      </div>

      {/* Order summary */}
      <div className="border border-gray-200 rounded-xl bg-white p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
          <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {data.items.length} Item{data.items.length !== 1 ? "s" : ""} Added
          </span>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden flex-1">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Qty</th>
                <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Unit</th>
                <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.sku} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 px-3">
                    <div className="text-sm font-medium text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-400">SKU: {item.sku}</div>
                  </td>
                  <td className="py-3 px-3 text-center text-sm text-gray-700">{item.qty}</td>
                  <td className="py-3 px-3 text-right text-sm text-gray-700">{currency(item.price)}</td>
                  <td className="py-3 px-3 text-right text-sm font-semibold text-gray-900">
                    {currency(item.price * item.qty)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => removeItem(item.sku)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-gray-400">
                    No items added yet. Use the catalog to add products.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{currency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Estimated Tax ({(TAX_RATE * 100).toFixed(1)}%)</span>
            <span>{currency(tax)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Shipping & Handling</span>
            <span>{currency(shipping)}</span>
          </div>
          <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-100">
            <span className="text-base font-bold text-gray-900">Grand Total</span>
            <span className="text-xl font-bold text-blue-600">{currency(total)}</span>
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={data.items.length === 0}
          className={`flex items-center justify-center gap-2 mt-5 px-5 py-3 rounded-lg text-sm font-semibold transition-colors shadow-sm ${
            data.items.length > 0
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Review and Submit
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── Step 3: Review & Submit ───────────────────────── */

function ReviewStep({ data, setData, onBack, onSubmit, onDiscard, submitting }) {
  const subtotal = data.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * TAX_RATE;
  const shipping = data.items.length > 0 ? SHIPPING_FLAT : 0;
  const total = subtotal + tax + shipping;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
      <div className="flex flex-col gap-6">
        {/* Supplier info */}
        <div className="border border-gray-200 rounded-xl bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Supplier Information</h3>
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Supplier Name
              </div>
              <div className="text-sm font-bold text-gray-900">{data.supplier?.name}</div>
              <div className="text-xs text-gray-400 mt-1">ID: {data.supplier?.id}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Primary Contact
              </div>
              <div className="text-sm text-gray-700">
                {data.contactPerson} {data.supplier?.contactTitle && `(${data.supplier.contactTitle})`}
              </div>
              <div className="text-sm text-gray-700">{data.email}</div>
              <div className="text-sm text-gray-700">{data.phone}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5 pt-5 border-t border-gray-100">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Shipping Address
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {data.shippingAddress || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Expected Delivery
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-700">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {data.deliveryDate
                  ? new Date(data.deliveryDate + "T00:00:00").toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Itemized list */}
        <div className="border border-gray-200 rounded-xl bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Itemized List</h3>
            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
              {data.items.length} Line Item{data.items.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Item Name</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">SKU</th>
                  <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Qty</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Unit Price</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.sku} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-3 text-sm font-medium text-gray-800">{item.name}</td>
                    <td className="py-3 px-3 text-sm text-gray-500">{item.sku}</td>
                    <td className="py-3 px-3 text-center text-sm text-gray-700">{item.qty}</td>
                    <td className="py-3 px-3 text-right text-sm text-gray-700">{currency(item.price)}</td>
                    <td className="py-3 px-3 text-right text-sm font-semibold text-gray-900">
                      {currency(item.price * item.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-2 mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Add Items
          </button>
        </div>
      </div>

      {/* Order summary + actions */}
      <div className="border border-gray-200 rounded-xl bg-white p-6 h-fit">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

        <div className="flex flex-col gap-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal ({data.items.length} items)</span>
            <span>{currency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax ({(TAX_RATE * 100).toFixed(1)}%)</span>
            <span>{currency(tax)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping & Handling</span>
            <span>{currency(shipping)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <span className="text-base font-bold text-gray-900">Grand Total</span>
          <span className="text-xl font-bold text-blue-600">{currency(total)}</span>
        </div>

        <div className="mt-6">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Internal Notes
          </label>
          <textarea
            rows={3}
            className="w-full outline-none text-sm text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50/50 focus:border-blue-400 transition-colors resize-none"
            placeholder="Add comments for the approval team..."
            value={data.notes}
            onChange={(e) => setData((p) => ({ ...p, notes: e.target.value }))}
          />
        </div>

        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex items-center justify-center gap-2 w-full mt-5 px-5 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Submit for Approval
        </button>
        <button
          onClick={onDiscard}
          className="flex items-center justify-center gap-1.5 w-full mt-4 text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Discard Order
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── Main page ───────────────────────── */

const EMPTY_ORDER = {
  supplier: null,
  contactPerson: "",
  email: "",
  phone: "",
  deliveryDate: "",
  shippingAddress: "",
  items: [],
  notes: "",
  isEdit: false,
};

export default function CreatePurchaseOrderPage() {
  const navigate = useNavigate();
  const { id: orderId } = useParams(); // present only on /purchase-orders/:id/edit
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(!!orderId);
  const [loadError, setLoadError] = useState(null);
  const [orderData, setOrderData] = useState(EMPTY_ORDER);

  const goBackToList = () => navigate("/purchase-orders");

  // Editing an existing order — load it and drop straight into Review & Submit.
  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;
    setLoadingOrder(true);
    setLoadError(null);

    fetch(`${API_BASE}/${orderId}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.success) throw new Error(json.message || "Failed to load purchase order");
        const order = json.data;

        // Only DRAFT orders are editable via the wizard. Anything further
        // along should be viewed (and withdrawn, if needed) from the detail page.
        if (order.status !== "DRAFT") {
          navigate(`/purchase-orders/${orderId}`, { replace: true });
          return;
        }

        setOrderData({
          supplier: order.supplier
            ? {
                _id: order.supplier._id,
                id: order.supplier.supplierId,
                name: order.supplierNameSnapshot,
                contactTitle: order.supplierContact?.role || "",
              }
            : null,
          contactPerson: order.supplierContact?.name || "",
          email: order.supplierContact?.email || "",
          phone: order.supplierContact?.phone || "",
          deliveryDate: order.expectedDeliveryDate
            ? String(order.expectedDeliveryDate).slice(0, 10)
            : "",
          shippingAddress: order.shippingAddress || "",
          items: (order.items || []).map((i) => ({
            productId: i.product?._id || i.product,
            sku: i.sku,
            name: i.name,
            price: i.unitPrice,
            qty: i.quantity,
          })),
          notes: order.internalNotes || "",
          isEdit: true,
        });
        setStep(3); // draft edits open on Review & Submit
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load purchase order:", err);
        setLoadError(err.message || "Failed to load purchase order");
      })
      .finally(() => {
        if (!cancelled) setLoadingOrder(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId, navigate]);

  const buildPayload = (asDraft) => ({
    supplierId: orderData.supplier?._id,
    expectedDeliveryDate: orderData.deliveryDate,
    shippingAddress: orderData.shippingAddress,
    items: orderData.items.map((i) => ({
      productId: i.productId,
      quantity: i.qty,
      unitPrice: i.price,
    })),
    taxRate: TAX_RATE * 100,
    shippingHandling: orderData.items.length > 0 ? SHIPPING_FLAT : 0,
    internalNotes: orderData.notes,
    asDraft,
  });

  // Single submit action now: the order is saved as DRAFT (awaiting approval)
  // and the person is handed off to the Approval Workflow page, where the
  // approver reviews it and clicks "Send to Supplier" to actually send it.
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const url = orderId ? `${API_BASE}/${orderId}` : API_BASE;
      const method = orderId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(true)),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to save purchase order");

      navigate(`/purchase-orders/${json.data._id}/approval`);
    } catch (err) {
      console.error("Failed to save purchase order:", err);
      alert(err.message || "Something went wrong saving the purchase order.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiscard = async () => {
    if (orderId) {
      try {
        const res = await fetch(`${API_BASE}/${orderId}`, { method: "DELETE" });
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Failed to discard purchase order");
      } catch (err) {
        console.error("Failed to discard purchase order:", err);
        alert(err.message || "Something went wrong discarding this order.");
        return;
      }
    }
    goBackToList();
  };

  if (loadingOrder) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading purchase order...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-sm text-red-500">{loadError}</p>
        <button
          onClick={goBackToList}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Purchase Orders
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={goBackToList}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Purchase Orders
      </button>

      <PageHeader
        title={orderData.isEdit ? "Edit Purchase Order" : "Create Purchase Order"}
        description={
          orderData.isEdit
            ? "Update this draft, then submit it for approval"
            : "Create a new purchase order in three quick steps"
        }
      />

      <div className="mt-6">
        <StepIndicator currentStep={step} />

        {step === 1 && (
          <SupplierStep
            data={orderData}
            setData={setOrderData}
            onNext={() => setStep(2)}
            onCancel={goBackToList}
          />
        )}

        {step === 2 && (
          <AddItemsStep
            data={orderData}
            setData={setOrderData}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <ReviewStep
            data={orderData}
            setData={setOrderData}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
            onDiscard={handleDiscard}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}