import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../config/roles';
import {
  ArrowLeft,
  CheckCircle2,
  Truck,
  Mail,
  XCircle,
  Package,
  Loader2,
  AlertTriangle,
  Download,
} from "lucide-react";

const API_BASE = "/api/v1/purchase-orders";

const STATUS_STYLES = {
  SENT: "bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-200",
  PARTIALLY_RECEIVED: "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200",
  FULLY_RECEIVED: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  CANCELLED: "bg-red-50 text-red-600 ring-1 ring-inset ring-red-200",
};

const STATUS_LABELS = {
  SENT: "Sent",
  PARTIALLY_RECEIVED: "Partially Received",
  FULLY_RECEIVED: "Fully Received",
  CANCELLED: "Cancelled",
};

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(d, opts = { month: "short", day: "numeric", year: "numeric" }) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("en-US", opts);
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
        STATUS_STYLES[status] || STATUS_STYLES.SENT
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

/* ───────────────────────── Main page ─────────────────────────
   Read-only historical record for a PO that has been sent to the supplier
   (or has progressed further: SENT -> PARTIALLY_RECEIVED -> FULLY_RECEIVED,
   or CANCELLED). Fetches its own data by route :id, since it's mounted
   directly at /purchase-orders/:id with no parent supplying `order`.

   NOTE: This screen intentionally does NOT expose a "Mark Fully Received"
   action — receiving is handled elsewhere (Goods Receiving flow). This
   page only tracks/downloads/cancels, and Cancel/Resend are further
   restricted to Admin/Branch Manager — Inventory Manager gets a view-only
   version of this page. */

const CAN_MANAGE_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER];

export default function SupplierOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = CAN_MANAGE_ROLES.includes(user?.role);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [busyAction, setBusyAction] = useState(null); // 'cancel' | 'resend' | null
  const [actionError, setActionError] = useState(null);
  const [resendConfirmed, setResendConfirmed] = useState(false);

  const goBackToList = () => navigate("/purchase-orders");

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load purchase order");
      }
      setOrder(json.data);
    } catch (err) {
      setError(err.message || "Something went wrong while loading this purchase order.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id, fetchOrder]);

  const handleResendEmail = async () => {
    if (!canManage) return;
    setBusyAction("resend");
    setActionError(null);
    setResendConfirmed(false);
    try {
      const res = await fetch(`${API_BASE}/${order._id}/resend-email`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to resend email");
      setOrder(json.data);
      setResendConfirmed(true);
    } catch (err) {
      setActionError(err.message || "Failed to resend the supplier email.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleCancelOrder = async () => {
    if (!canManage) return;
    if (!window.confirm("Cancel this purchase order? This can't be undone.")) return;
    setBusyAction("cancel");
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE}/${order._id}/cancel`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to cancel order");
      setOrder(json.data);
    } catch (err) {
      setActionError(err.message || "Something went wrong cancelling this order.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleTrackOrder = () => navigate(`/purchase-orders/${id}/tracking`);

  const handleDownloadPdf = () => {
    window.open(`${API_BASE}/${id}/pdf`, "_blank", "noopener,noreferrer");
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Loading purchase order…</span>
      </div>
    );
  }

  /* ── Error state ── */
  if (error || !order) {
    return (
      <div>
        <button
          onClick={goBackToList}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to PO List
        </button>
        <div className="flex flex-col items-center justify-center text-center rounded-xl border border-slate-200 bg-white p-12">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Couldn't load this purchase order</h2>
          <p className="text-sm text-slate-500 mb-4">{error || "Purchase order not found."}</p>
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
  const isCancelled = order.status === "CANCELLED";
  const isFullyReceived = order.status === "FULLY_RECEIVED";
  const isPartiallyReceived = order.status === "PARTIALLY_RECEIVED";
  const canCancel = canManage && !["FULLY_RECEIVED", "CANCELLED"].includes(order.status);

  return (
    <div>
      <button
        onClick={goBackToList}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to PO List
      </button>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Supplier Order Details</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-base text-slate-500">{order.poNumber}</p>
        </div>
        <button
          onClick={handleDownloadPdf}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Order summary card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Supplier</p>
                <p className="mt-1 font-semibold text-slate-900">{order.supplierNameSnapshot}</p>
                {order.supplier?.supplierId && (
                  <p className="text-sm text-slate-500">ID: {order.supplier.supplierId}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order Date</p>
                <p className="mt-1 text-slate-900">{formatDate(order.orderDate)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Expected Delivery</p>
                <p className="mt-1 text-slate-900">{formatDate(order.expectedDeliveryDate)}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Supplier Contact</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {order.supplierContact?.name || "—"}
                  {order.supplierContact?.role ? ` (${order.supplierContact.role})` : ""}
                </p>
                <p className="text-sm text-slate-500">{order.supplierContact?.email}</p>
                <p className="text-sm text-slate-500">{order.supplierContact?.phone}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total amount</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">{formatCurrency(order.grandTotal)}</p>
              </div>
            </div>

            {order.shippingAddress && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Shipping Address</p>
                <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">{order.shippingAddress}</p>
              </div>
            )}
          </div>

          {/* Transaction / status notice */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white py-4 pl-4 pr-5 flex-wrap gap-3">
            <div
              className={`flex items-start gap-3 border-l-4 pl-4 -ml-4 -my-4 py-4 ${
                isCancelled ? "border-red-500" : "border-emerald-500"
              }`}
            >
              {isCancelled ? (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              )}
              <div>
                <p className="font-semibold text-slate-900">
                  {isCancelled
                    ? "This order was cancelled"
                    : isFullyReceived
                    ? "All items received"
                    : isPartiallyReceived
                    ? "Some items received"
                    : "Email sent to supplier"}
                </p>
                <p className="text-sm text-slate-500">
                  {isCancelled
                    ? "No further action is needed."
                    : `Order sent to supplier on ${formatDate(order.submittedAt, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}${order.supplierContact?.email ? ` to ${order.supplierContact.email}` : ""}.`}
                </p>
                {resendConfirmed && (
                  <p className="text-xs text-emerald-600 mt-1 font-semibold">Email resent successfully.</p>
                )}
              </div>
            </div>

            {canManage && !isCancelled && order.submittedAt && (
              <button
                onClick={handleResendEmail}
                disabled={busyAction === "resend"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-60 flex-shrink-0"
              >
                {busyAction === "resend" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Mail className="w-3.5 h-3.5" />
                )}
                Resend Email
              </button>
            )}
          </div>

          {actionError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {actionError}
            </div>
          )}

          {/* Ordered items — fully locked, no edit affordances */}
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 rounded-t-xl">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Ordered Items</p>
              <p className="text-sm text-slate-500">{items.length} Line Items</p>
            </div>

            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3">Item Details</th>
                  <th className="px-3 py-3">SKU</th>
                  <th className="px-3 py-3 text-right">Qty</th>
                  <th className="px-3 py-3 text-right">Unit Price</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id || item.sku} className="border-t border-slate-100">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                      </div>
                    </td>
                    <td className="px-3 py-4 align-top text-slate-700">{item.sku}</td>
                    <td className="px-3 py-4 align-top text-right text-slate-700">{item.quantity}</td>
                    <td className="px-3 py-4 align-top text-right text-slate-700">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-6 py-4 align-top text-right font-semibold text-slate-900">
                      {formatCurrency(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column — order summary sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Subtotal ({items.length} items)</dt>
                <dd className="text-slate-900">{formatCurrency(order.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Tax ({order.taxRate}%)</dt>
                <dd className="text-slate-900">{formatCurrency(order.taxAmount)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Shipping &amp; Handling</dt>
                <dd className="text-slate-900">{formatCurrency(order.shippingHandling)}</dd>
              </div>
            </dl>

            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
              <p className="font-bold text-slate-900">Grand Total</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(order.grandTotal)}</p>
            </div>

            {!isCancelled && (
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleTrackOrder}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Truck className="h-4 w-4" />
                  Track Order
                </button>

                {canCancel && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={busyAction === "cancel"}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    {busyAction === "cancel" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    Cancel Order
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}