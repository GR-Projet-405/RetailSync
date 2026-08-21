import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  ArrowLeft,
  Pencil,
  XCircle,
  Info,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Building2,
  User,
  Mail,
  MapPin,
  Send,
  ExternalLink,
  ShieldCheck,
  Package,
} from "lucide-react";

/* ───────────────────────── Config ───────────────────────── */
/* Backend auto-mounts every modules/<folderName> at /api/v1/<folderName> — see app.js */
const API_BASE = "/api/v1/purchase-orders";

const getAuthHeaders = (extra = {}) => {
  const token = localStorage.getItem('token');
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/* ───────────────────────── Status presentation ───────────────────────── */
/* Matches the real enum on PurchaseOrderPageSchema.status */
const STATUS_STYLES = {
  DRAFT: {
    label: "Draft (Awaiting Approval)",
    className: "bg-orange-50 text-orange-600 border border-orange-100",
    dotClassName: "bg-orange-500",
  },
  SENT: {
    label: "Pending Approval",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
    dotClassName: "bg-amber-500",
  },
  PARTIALLY_RECEIVED: {
    label: "Partially Received",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
    dotClassName: "bg-blue-500",
  },
  FULLY_RECEIVED: {
    label: "Fully Received",
    className: "bg-green-100 text-green-700 border border-green-200",
    dotClassName: "bg-green-600",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-50 text-red-600 border border-red-200",
    dotClassName: "bg-red-500",
  },
};

const currency = (n) =>
  `Rs. ${(Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value, opts = { dateStyle: "medium" }) => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return "—";
  return d.toLocaleString("en-US", opts);
};

/* Product thumbnail — shows the real product image when available,
   falling back to a generic package icon (e.g. product deleted/unpopulated,
   or no image uploaded for that product). Relies on `item.product` being
   populated server-side via `.populate('items.product')` in
   service.fetchById. */
function ProductThumbnail({ src, alt, size = "w-10 h-10" }) {
  return (
    <div
      className={`${size} flex-shrink-0 rounded-lg border border-gray-200 bg-blue-50 overflow-hidden flex items-center justify-center`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        <Package className="w-4 h-4 text-blue-500" />
      )}
    </div>
  );
}

// Pull the primary image URL off a populated line-item product doc.
function getProductImage(product) {
  if (!product || typeof product !== "object" || !Array.isArray(product.images)) return null;
  const primary = product.images.find((img) => img.isPrimary) || product.images[0];
  return primary?.url || null;
}

/* ───────────────────────── Confirm modal ───────────────────────── */

function ConfirmWithdrawModal({ onConfirm, onCancel, submitting }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Withdraw Request?</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          This will cancel the approval process and return this purchase order to
          your Drafts. This action can't be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Withdraw Request
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Main page ───────────────────────── */

export default function ApprovalWorkflowPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionError, setActionError] = useState(null);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load purchase order");
      }
      setPo(json.data);
    } catch (err) {
      setError(err.message || "Something went wrong while loading this purchase order.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id, fetchOrder]);

  const goBackToList = () => navigate("/purchase-orders");

  const handleEdit = () => {
    // Reuses the create/edit wizard, loading this draft by id.
    // FIX: pass the id as a route param (matches useParams() in
    // CreatePurchaseOrderPage), not a query string — the wizard was
    // reading `id` via useParams(), which never picks up `?id=`.
    navigate(`/purchase-orders/${po._id}/edit`);
  };

  const handlePreviewEmail = async () => {
    try {
      const res = await fetch(`${API_BASE}/${id}/email-preview`, {
        headers: getAuthHeaders(),
      });
      const htmlText = await res.text();
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(htmlText);
        win.document.close();
      }
    } catch (err) {
      console.error("Failed to load email preview:", err);
    }
  };

  const handleSendToSupplier = async () => {
    setSending(true);
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}/send`, { method: "POST", headers: getAuthHeaders() });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to send this purchase order to the supplier");
      }
      // Status is now SENT — hand off to the read-only Supplier Order Details page.
      navigate(`/purchase-orders/${id}`);
    } catch (err) {
      setActionError(err.message || "Failed to send this purchase order to the supplier.");
      setSending(false);
    }
  };

  const handleWithdrawConfirm = async () => {
    setWithdrawing(true);
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}/withdraw`, { method: "POST", headers: getAuthHeaders() });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to withdraw purchase order");
      }
      setShowWithdrawConfirm(false);
      goBackToList();
    } catch (err) {
      setActionError(err.message || "Failed to withdraw this purchase order.");
      setWithdrawing(false);
    }
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
  if (error || !po) {
    return (
      <div>
        <button
          onClick={goBackToList}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to PO List
        </button>
        <div className="flex flex-col items-center justify-center text-center border border-gray-200 rounded-xl bg-white p-12">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">Couldn't load this purchase order</h2>
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

  const items = po.items || [];
  const subtotal = po.subtotal ?? items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const taxAmount = po.taxAmount ?? 0;
  const shippingHandling = po.shippingHandling ?? 0;
  const total = po.grandTotal ?? po.totalAmount ?? subtotal + taxAmount + shippingHandling;
  const statusStyle = STATUS_STYLES[po.status] || {
    label: po.status,
    className: "bg-gray-100 text-gray-600 border border-gray-200",
    dotClassName: "bg-gray-400",
  };

  const canEdit = po.status === "DRAFT";
  const canWithdraw = po.status === "SENT";
  const isDraft = po.status === "DRAFT";

  const supplierName = po.supplierNameSnapshot || po.supplier?.name || "—";
  const supplierId = po.supplier?.supplierId || "—";
  const contact = po.supplierContact || {};
  const approver = po.approver || {};
  const currentUserName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || user.email || "Current User"
    : "—";
  const currentUserRole = user?.roleId?.name || user?.role || approver.role || "";

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <button
            onClick={goBackToList}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to PO List
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Approval Purchase Order #{po.poNumber}
          </h1>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Purchase Order Overview */}
          <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Purchase Order Overview
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusStyle.className}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotClassName}`} />
                {statusStyle.label}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1.5">Created Date</div>
                <div className="text-sm font-bold text-gray-900">
                  {formatDate(po.createdAt, { dateStyle: "medium", timeStyle: "short" })}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1.5">Supplier</div>
                <div className="text-sm font-bold text-gray-900">{supplierName}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1.5">Expected Delivery</div>
                <div className="text-sm font-bold text-blue-600">
                  {formatDate(po.expectedDeliveryDate)}
                </div>
              </div>
            </div>
          </div>

          {/* Ordered Items */}
          <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Ordered Items
              </h2>
            </div>

            {items.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-gray-400">
                No line items on this purchase order.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Item Details</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase">SKU</th>
                    <th className="text-center py-3 px-3 text-xs font-semibold text-gray-500 uppercase">Qty</th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-gray-500 uppercase">Unit Price</th>
                    <th className="text-right py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id || item.sku} className="border-b border-gray-100 last:border-0">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <ProductThumbnail src={getProductImage(item.product)} alt={item.name} />
                          <div className="text-sm font-bold text-gray-900">{item.name}</div>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-sm text-gray-600">{item.sku}</td>
                      <td className="py-4 px-3 text-center text-sm text-gray-700">{item.quantity}</td>
                      <td className="py-4 px-3 text-right text-sm text-gray-700">
                        {currency(item.unitPrice)}
                      </td>
                      <td className="py-4 px-6 text-right text-sm font-bold text-blue-600">
                        {currency(item.lineTotal ?? item.unitPrice * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="px-6 py-5 flex flex-col gap-2 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600 max-w-xs ml-auto w-full">
                <span>Subtotal</span>
                <span>{currency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 max-w-xs ml-auto w-full">
                <span>Tax ({po.taxRate ?? 0}%)</span>
                <span>{currency(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 max-w-xs ml-auto w-full">
                <span>Shipping</span>
                <span>{currency(shippingHandling)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-200 max-w-xs ml-auto w-full">
                <span className="text-base font-bold text-gray-900">Grand Total</span>
                <span className="text-xl font-bold text-blue-600">{currency(total)}</span>
              </div>
            </div>
          </div>

          {po.internalNotes && (
            <div className="border border-gray-200 rounded-xl bg-white p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Internal Notes</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{po.internalNotes}</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Supplier card */}
          <div className="border border-gray-200 rounded-xl bg-white p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 leading-snug">{supplierName}</div>
                <div className="text-xs text-gray-400 mt-0.5">ID: {supplierId}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-sm text-gray-700">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>
                  {contact.name || "—"}
                  {contact.phone ? ` - ${contact.phone}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{contact.email || "No contact email on file"}</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>{po.shippingAddress || contact.address || "No address on file"}</span>
              </div>
            </div>
          </div>

          {/* Email preview card */}
          {isDraft && (
            <div className="border border-gray-200 rounded-xl bg-white p-6 relative">
              <span className="absolute top-4 right-4 text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                REQ-PO-004
              </span>
              <div className="flex items-center gap-2 mb-4">
                <Send className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-bold text-gray-900">Email Preview</h2>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-0.5">To:</div>
                <div className="text-sm text-gray-800 mb-3">
                  {contact.email || po.supplier?.orderingEmail || "—"}
                </div>
                <div className="text-sm text-gray-800 mb-3">
                  <span className="text-gray-500">Subject: </span>
                  Purchase Order #{po.poNumber}
                </div>
                <button
                  onClick={handlePreviewEmail}
                  className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Click to preview full email body
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Approval action card */}
          <div className="border-2 border-blue-600 rounded-xl bg-white p-6 relative">
            <span className="absolute top-4 right-4 text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              BR-PO-001
            </span>

            <div className="text-xs text-gray-500 mb-1.5">Logged in as:</div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-base font-bold text-gray-900">
                {currentUserName}
              </span>
              {currentUserRole && (
                <span className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {currentUserRole}
                </span>
              )}
            </div>

            {isDraft && (
              <div className="flex items-start gap-2 mb-5">
                <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-blue-600 leading-snug">
                  You have permission to approve orders.
                </span>
              </div>
            )}

            {actionError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                {actionError}
              </div>
            )}

            {isDraft && (
              <>
                <button
                  onClick={handleSendToSupplier}
                  disabled={sending}
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors mb-3 disabled:opacity-60"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>🚀</span>
                  )}
                  Send to Supplier
                </button>

                <button
                  onClick={handleEdit}
                  disabled={!canEdit}
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors mb-5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>✏️</span>
                  Edit Draft
                </button>

              </>
            )}

            {!isDraft && (
              <>
                <button
                  onClick={handleEdit}
                  disabled={!canEdit}
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Purchase Order
                </button>

                {canWithdraw && (
                  <button
                    onClick={() => setShowWithdrawConfirm(true)}
                    className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-lg border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Withdraw Request
                  </button>
                )}

                {canWithdraw && (
                  <div className="flex items-start gap-2.5 bg-blue-50/60 border border-blue-100 rounded-lg p-3.5 mt-5">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Withdrawing the request will cancel the approval process and return
                      the order to your Drafts.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showWithdrawConfirm && (
        <ConfirmWithdrawModal
          onConfirm={handleWithdrawConfirm}
          onCancel={() => setShowWithdrawConfirm(false)}
          submitting={withdrawing}
        />
      )}
    </div>
  );
}