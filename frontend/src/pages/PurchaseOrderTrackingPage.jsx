import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  Map,
  Package,
  Loader2,
  AlertTriangle,
  User,
} from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../config/roles';

const API_BASE = "/api/v1/purchase-orders";

// ── Status config (mirrors list / details pages) ─────────────────────────────
const STATUS_CONFIG = {
  FULLY_RECEIVED: { label: "Fully Received", badgeClass: "bg-green-100 text-green-700 border-green-200" },
  SENT: { label: "Sent", badgeClass: "bg-blue-50 text-blue-600 border-blue-200" },
  DRAFT: { label: "Draft", badgeClass: "bg-gray-100 text-gray-500 border-gray-200" },
  PARTIALLY_RECEIVED: { label: "Partially Received", badgeClass: "bg-yellow-50 text-yellow-700 border-yellow-300" },
  CANCELLED: { label: "Cancelled", badgeClass: "bg-red-50 text-red-600 border-red-200" },
};

const STEPS = ["Draft", "Sent", "Partially Received", "Fully Received"];

function stepIndexForStatus(status) {
  return { DRAFT: 0, SENT: 1, PARTIALLY_RECEIVED: 2, FULLY_RECEIVED: 3 }[status] ?? 0;
}

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(d, opts = { month: "short", day: "numeric", year: "numeric" }) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("en-US", opts);
}

function daysUntil(d) {
  if (!d) return null;
  const target = new Date(d);
  if (isNaN(target)) return null;
  const diffMs = target.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function StepIcon({ state }) {
  if (state === "done")
    return (
      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shadow">
        <CheckCircle2 className="w-5 h-5 text-white" />
      </div>
    );
  if (state === "active")
    return (
      <div className="w-9 h-9 rounded-full border-[3px] border-blue-600 bg-white flex items-center justify-center shadow">
        <div className="w-3 h-3 rounded-full bg-blue-600" />
      </div>
    );
  return (
    <div className="w-9 h-9 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
      <Circle className="w-4 h-4 text-gray-300" />
    </div>
  );
}

function ItemIcon() {
  return (
    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-500">
      <Package className="w-4 h-4" />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PurchaseOrderTrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load tracking details");
      }
      setOrder(json.data);
    } catch (err) {
      setError(err.message || "Something went wrong while loading tracking details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id, fetchOrder]);

  const goBack = () => navigate(-1);

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Loading order tracking…</span>
      </div>
    );
  }

  /* ── Error state ── */
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        <button
          onClick={goBack}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to PO List
        </button>
        <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-gray-200 bg-white p-12 shadow-sm">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">Couldn't load tracking details</h2>
          <p className="text-sm text-gray-500 mb-4">{error || "Purchase order not found."}</p>
          <button
            onClick={fetchOrder}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const items = order.items || [];
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.SENT;
  const activeStep = stepIndexForStatus(order.status);

  const totalUnits = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const recordedReceivedUnits = items.reduce((sum, i) => sum + (i.receivedQuantity || 0), 0);

  // The schema only stamps per-item `receivedQuantity` when an order goes
  // FULLY_RECEIVED — there's no per-item receiving UI yet for partial
  // receipts. Until that exists, show an estimated 50% progress whenever
  // the order is PARTIALLY_RECEIVED and nothing's actually been recorded,
  // so the bar isn't stuck at 0%.
  const hasRecordedPartialData = order.status === "PARTIALLY_RECEIVED" && recordedReceivedUnits > 0;
  const isEstimatedPartial = order.status === "PARTIALLY_RECEIVED" && !hasRecordedPartialData;

  const receivedUnits = isEstimatedPartial
    ? Math.round(totalUnits * 0.5)
    : recordedReceivedUnits;

  const receivedPct = isEstimatedPartial
    ? 50
    : totalUnits > 0
    ? Math.round((receivedUnits / totalUnits) * 100)
    : 0;

  const remainingUnits = Math.max(totalUnits - receivedUnits, 0);

  const daysLeft = daysUntil(order.expectedDeliveryDate);
  const isFullyReceived = order.status === "FULLY_RECEIVED";
  const isCancelled = order.status === "CANCELLED";
  const onTrack = !isCancelled && (isFullyReceived || (daysLeft !== null && daysLeft >= 0));
  const { hasRole } = useAuth();
  const isInventoryStaff = hasRole(ROLES.INVENTORY_MANAGER);

  const stepDates = [
    order.createdAt ? formatDate(order.createdAt) : null,
    order.submittedAt ? formatDate(order.submittedAt) : null,
    order.status === "PARTIALLY_RECEIVED" || order.status === "FULLY_RECEIVED"
      ? formatDate(order.firstReceivedAt)
      : null,
    order.status === "FULLY_RECEIVED" ? formatDate(order.fullyReceivedAt) : null,
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-gray-500 font-medium">{order.poNumber}</span>
            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold border ${cfg.badgeClass}`}>
              {cfg.label}
            </span>
          </div>
        </div>
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to PO List
        </button>
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex gap-5 items-start flex-wrap lg:flex-nowrap">
        {/* ── Left column ── */}
        <div className="flex-1 flex flex-col gap-5 min-w-0 w-full">
          {/* Progress card */}
          {!isCancelled && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              {/* Step tracker */}
              <div className="flex items-center">
                {STEPS.map((label, i) => {
                  const state = i < activeStep ? "done" : i === activeStep ? "active" : "pending";
                  const isLast = i === STEPS.length - 1;
                  return (
                    <div key={label} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1.5">
                        <StepIcon state={state} />
                        <span className={`text-xs font-semibold ${state === "active" ? "text-blue-600" : state === "done" ? "text-gray-700" : "text-gray-400"}`}>
                          {label}
                        </span>
                        {stepDates[i] ? (
                          <span className="text-[10px] text-gray-400">{stepDates[i]}</span>
                        ) : (
                          <span className={`text-[10px] font-medium ${state === "active" ? "text-blue-500" : "text-gray-400"}`}>
                            {state === "active" ? "Active" : "Pending"}
                          </span>
                        )}
                      </div>
                      {!isLast && (
                        <div className={`flex-1 h-[2px] mx-2 rounded-full ${i < activeStep ? "bg-blue-600" : "bg-gray-200"}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Package className="w-4 h-4 text-blue-500" />
                    Receiving Progress
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {receivedUnits} / {totalUnits} units{" "}
                    <span className="text-gray-400 font-normal">({receivedPct}%)</span>
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${receivedPct}%` }}
                  />
                </div>
                {!isFullyReceived && (
                  <p className="mt-2 text-xs text-blue-500 font-medium italic">
                    Remaining: {remainingUnits} units pending from Supplier
                    {isEstimatedPartial && " (estimated)"}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-800 mb-4">Order Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Vendor</p>
                <p className="text-sm font-semibold text-gray-800">{order.supplierNameSnapshot}</p>
                {order.supplier?.supplierId && (
                  <p className="text-xs text-gray-400 mt-0.5">ID: {order.supplier.supplierId}</p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Requester</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{order.requester?.name || "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Department</p>
                <p className="text-sm font-semibold text-gray-800">{order.department || "—"}</p>
              </div>
            </div>
          </div>

          {/* Itemized List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Itemized List</h2>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 rounded-lg px-3 py-1">
                {items.length} Line Items
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Item Details</th>
                    <th className="text-center py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Qty</th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Unit Price</th>
                    <th className="text-right py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id || item.sku} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <ItemIcon />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-gray-700">{item.quantity}</td>
                      <td className="py-4 px-4 text-right text-sm text-gray-700">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-4 px-6 text-right text-sm font-bold text-gray-900">
                        {formatCurrency(item.lineTotal ?? item.unitPrice * item.quantity)}
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-sm text-gray-400">
                        No line items on this order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="w-full lg:w-72 flex flex-col gap-4 flex-shrink-0">
          {/* Total amount card */}
          <div className="bg-blue-600 rounded-2xl p-5 text-white shadow-md">
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1">Total Amount</p>
            <p className="text-4xl font-bold tracking-tight">{formatCurrency(order.grandTotal)}</p>
            <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-sm text-blue-100">
                <Clock className="w-4 h-4" />
                <span>Expected: {formatDate(order.expectedDeliveryDate)}</span>
              </div>
              {!isCancelled && daysLeft !== null && (
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    daysLeft < 0 ? "bg-red-400 text-red-900" : "bg-green-400 text-green-900"
                  }`}
                >
                  {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                </span>
              )}
            </div>
            {!isCancelled && (
              <div className="mt-4 pt-4 border-t border-blue-500">
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <div className="w-5 h-5 rounded-full border-2 border-blue-300 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-blue-200" />
                  </div>
                  {isFullyReceived
                    ? "Fully received"
                    : onTrack
                    ? "On Track for full receipt"
                    : "Behind schedule"}
                </div>
              </div>
            )}
            {isInventoryStaff && !isCancelled && !isFullyReceived && (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm('Mark entire order as received?')) return;
                    try {
                      const res = await fetch(`${API_BASE}/${id}/receive?mode=ALL`, { method: 'POST' });
                      const json = await res.json();
                      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to receive order');
                      await fetchOrder();
                    } catch (err) {
                      alert(err.message || 'Failed to receive order');
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  Receive All
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm('Open partial receive flow?')) return;
                    try {
                      const res = await fetch(`${API_BASE}/${id}/receive?mode=PARTIAL`, { method: 'POST' });
                      const json = await res.json();
                      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to partially receive order');
                      await fetchOrder();
                    } catch (err) {
                      alert(err.message || 'Failed to partially receive order');
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Receive Partially
                </button>
              </div>
            )}
          </div>

          {/* Shipping address */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Shipping Address</p>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {order.shippingAddress || "—"}
            </p>
            {/* Map — no API key required; swap for the Maps Embed API
               (src="https://www.google.com/maps/embed/v1/place?key=...&q=...")
               if you want markers/styling/directions later. */}
            {order.shippingAddress ? (
              <iframe
                title="Shipping address map"
                className="mt-3 w-full h-40 rounded-xl border border-blue-100"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(order.shippingAddress)}&output=embed`}
              />
            ) : (
              <div className="mt-3 rounded-xl bg-blue-50 border border-blue-100 h-24 flex items-center justify-center">
                <Map className="w-7 h-7 text-blue-300" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}