import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../config/roles';
import {
  Search,
  Download,
  Plus,
  ListFilter,
  Building2,
  CalendarDays,
  Eye,
  Send,
  CheckCircle2,
  Clock,
  FileText,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

const API_BASE = "/api/v1/purchase-orders";
const PAGE_SIZE = 5;

const STATUS_CONFIG = {
  FULLY_RECEIVED: {
    label: "FULLY RECEIVED",
    className: "bg-green-100 text-green-700 border border-green-200",
    Icon: CheckCircle2,
    iconClass: "text-green-500",
  },
  SENT: {
    label: "SENT",
    className: "bg-blue-50 text-blue-600 border border-blue-200",
    Icon: Send,
    iconClass: "text-blue-500",
  },
  DRAFT: {
    label: "DRAFT",
    className: "bg-gray-100 text-gray-500 border border-gray-200",
    Icon: FileText,
    iconClass: "text-gray-400",
  },
  PARTIALLY_RECEIVED: {
    label: "PARTIALLY RECEIVED",
    className: "bg-yellow-50 text-yellow-700 border border-yellow-300",
    Icon: PackageCheck,
    iconClass: "text-yellow-500",
  },
};

// Map the status filter dropdown labels to the values the API expects
const STATUS_FILTER_MAP = {
  "Status: All": "All",
  "Fully Received": "FULLY_RECEIVED",
  "Sent": "SENT",
  "Draft": "DRAFT",
  "Partially Received": "PARTIALLY_RECEIVED",
};

const currency = (n) =>
  `Rs. ${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return d;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// Backend fields don't always line up 1:1 with what the table needs
// (e.g. grandTotal vs totalAmount, createdAt vs orderDate) — normalize here.
const getTotalAmount = (order) => order.totalAmount ?? order.grandTotal ?? 0;
const getOrderDate = (order) => order.orderDate ?? order.createdAt ?? null;

// The backend doesn't send an `overdue` flag, so we derive it here:
// an order is overdue if its expected delivery date has passed and it
// hasn't reached a final "done" state (fully received / cancelled).
const isOverdue = (order) => {
  if (["FULLY_RECEIVED", "CANCELLED"].includes(order.status)) return false;
  if (!order.expectedDeliveryDate) return false;
  const due = new Date(order.expectedDeliveryDate);
  if (isNaN(due)) return false;
  due.setHours(0, 0, 0, 0);
  return due < new Date().setHours(0, 0, 0, 0);
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  const { Icon, iconClass } = config;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${config.className}`}>
      <Icon className={`w-3 h-3 ${iconClass}`} />
      {config.label}
    </span>
  );
}

function ActionButtons({ onView }) {
  return (
    <div className="flex items-center justify-end">
      <button
        onClick={onView}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
      >
        <Eye className="w-3.5 h-3.5" />
        View
      </button>
    </div>
  );
}

export default function PurchaseOrderPage() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  // Admin / Branch Manager can create, edit and approve POs. Inventory
  // Manager gets read-only access to this list — they update PO status
  // (partially/fully received) from the Goods Receiving flow instead.
  const canManagePOs = hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER);
  // Only Admin and Branch Manager should see the "Create New PO" button
  const canCreatePOs = hasRole(ROLES.ADMIN, ROLES.BRANCH_MANAGER);

  const [selectedRows,   setSelectedRows]   = useState(new Set());
  const [allSelected,    setAllSelected]    = useState(false);

  const [search,         setSearch]         = useState("");
  const [statusFilter,   setStatusFilter]   = useState("Status: All");
  const [supplierFilter, setSupplierFilter] = useState("Supplier: All");
  const [suppliers,      setSuppliers]      = useState([]);
  const [orderDateFilter, setOrderDateFilter] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Clicking "View" opens the right screen depending on where the order is
  // in its lifecycle: DRAFT orders still need approval action, so they go
  // to the Approval Workflow page (Admin/Branch Manager only — Inventory
  // Manager won't see DRAFT rows lead anywhere useful since that route is
  // gated). Everything else (SENT, PARTIALLY_RECEIVED, FULLY_RECEIVED,
  // CANCELLED) is a settled record, so it goes to the read-only Supplier
  // Order Details page, which everyone in PO_VIEW_ROLES can open.
  const goToDetail = (order) => {
    const id = order._id || order.id;
    if (order.status === "DRAFT" && canManagePOs) {
      navigate(`/purchase-orders/${id}/approval`);
    } else {
      navigate(`/purchase-orders/${id}`);
    }
  };

  // Load supplier options once for the filter dropdown
  useEffect(() => {
    fetch(`${API_BASE}/suppliers`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setSuppliers(json.data || []);
      })
      .catch((err) => console.error("Failed to load suppliers:", err));
  }, []);

  // Reset to page 1 whenever filters/search change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, supplierFilter, orderDateFilter]);

  // Fetch purchase orders from the backend whenever filters/search/page change
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "Status: All") params.set("status", STATUS_FILTER_MAP[statusFilter]);
    if (supplierFilter !== "Supplier: All") params.set("supplier", supplierFilter);
    if (orderDateFilter) params.set("orderDate", orderDateFilter);
    params.set("page", page);
    params.set("limit", PAGE_SIZE);

    const timer = setTimeout(() => {
      fetch(`${API_BASE}?${params.toString()}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((json) => {
          if (!json.success) throw new Error(json.message || "Failed to load purchase orders");

          // Backend returns { data: { orders, total, page, limit, totalPages } }
          const payload = json.data ?? {};
          const list = Array.isArray(payload.orders)
            ? payload.orders
            : Array.isArray(json.data)
            ? json.data
            : Array.isArray(json.orders)
            ? json.orders
            : [];

          const limit = payload.limit || PAGE_SIZE;
          const total = payload.total ?? list.length;

          setOrders(list);
          setTotalOrders(total);
          setTotalPages(payload.totalPages || Math.max(1, Math.ceil(total / limit)));
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Failed to load purchase orders:", err);
            setError(err.message || "Failed to load purchase orders");
          }
          setOrders([]);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, statusFilter, supplierFilter, orderDateFilter, page]);

  const toggleAll = () => {
    if (allSelected) {
      setSelectedRows(new Set());
      setAllSelected(false);
    } else {
      setSelectedRows(new Set(orders.map((_, i) => i)));
      setAllSelected(true);
    }
  };

  const toggleRow = (i) => {
    const next = new Set(selectedRows);
    if (next.has(i)) next.delete(i); else next.add(i);
    setSelectedRows(next);
    setAllSelected(next.size === orders.length && orders.length > 0);
  };

  // Exports every order matching the CURRENT filters/search (not just the
  // current page) as a CSV file the browser downloads directly.
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "Status: All") params.set("status", STATUS_FILTER_MAP[statusFilter]);
      if (supplierFilter !== "Supplier: All") params.set("supplier", supplierFilter);
      if (orderDateFilter) params.set("orderDate", orderDateFilter);
      params.set("page", 1);
      params.set("limit", 10000); // effectively "all" matching rows

      const res = await fetch(`${API_BASE}?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to export purchase orders");

      const payload = json.data ?? {};
      const list = Array.isArray(payload.orders) ? payload.orders : [];

      const headers = ["PO Number", "Supplier", "Order Date", "Total Amount", "Status", "Expected Delivery", "Overdue"];
      const rows = list.map((o) => [
        o.poNumber || o.id || "",
        o.supplier?.name || o.supplierNameSnapshot || "",
        formatDate(getOrderDate(o)),
        getTotalAmount(o).toFixed(2),
        o.status || "",
        formatDate(o.expectedDeliveryDate),
        isOverdue(o) ? "Yes" : "No",
      ]);

      const escapeCsv = (val) => `"${String(val).replace(/"/g, '""')}"`;
      const csvContent = [headers, ...rows]
        .map((row) => row.map(escapeCsv).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `purchase-orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export CSV:", err);
      alert(err.message || "Failed to export purchase orders.");
    } finally {
      setExporting(false);
    }
  };

  const from = orders.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = (page - 1) * PAGE_SIZE + orders.length;

  return (
    <div>
      {/* ── Page header + action buttons ── */}
      <div className="flex items-start justify-between">
        <PageHeader
          title="Purchase Orders"
          description="Manage and track your procurement logistics"
        />
        <div className="flex gap-3 mt-1">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            EXPORT CSV
          </button>
          {canCreatePOs && (
            <button
              onClick={() => navigate("/purchase-orders/create")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create New PO
            </button>
          )}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="mt-6 border border-gray-200 rounded-xl p-4 bg-white">
        <div className="flex gap-3 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[220px] border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              className="outline-none text-sm text-gray-600 placeholder-gray-400 w-full bg-transparent"
              placeholder="Search by PO # or supplier"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white min-w-[160px]">
            <ListFilter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              className="outline-none text-sm text-gray-600 bg-transparent flex-1"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>Status: All</option>
              <option>Fully Received</option>
              <option>Sent</option>
              <option>Draft</option>
              <option>Partially Received</option>
            </select>
          </div>

          {/* Supplier */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white min-w-[160px]">
            <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              className="outline-none text-sm text-gray-600 bg-transparent flex-1"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            >
              <option>Supplier: All</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Order Date */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white min-w-[160px]">
            <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="date"
              value={orderDateFilter}
              onChange={(e) => setOrderDateFilter(e.target.value)}
              className="outline-none text-sm text-gray-600 bg-transparent flex-1"
            />
            {orderDateFilter && (
              <button
                type="button"
                onClick={() => setOrderDateFilter("")}
                className="text-gray-300 hover:text-gray-500 text-xs flex-shrink-0"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {canManagePOs && (
                <th className="w-10 py-3 px-4">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 accent-blue-600 w-4 h-4"
                    checked={allSelected}
                    onChange={toggleAll}
                  />
                </th>
              )}
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">PO Number</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Date</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={canManagePOs ? 7 : 6} className="py-12 text-center text-sm text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading purchase orders...
                  </div>
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={canManagePOs ? 7 : 6} className="py-12 text-center text-sm text-red-500">
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                </td>
              </tr>
            )}

            {!loading && !error && orders.length === 0 && (
              <tr>
                <td colSpan={canManagePOs ? 7 : 6} className="py-12 text-center text-sm text-gray-400">
                  No purchase orders found.
                </td>
              </tr>
            )}

            {!loading && !error && orders.map((order, i) => (
              <tr
                key={order._id || order.id || i}
                className={`border-b border-gray-100 last:border-0 hover:bg-blue-50/30 transition-colors ${
                  selectedRows.has(i) ? "bg-blue-50/40" : ""
                }`}
              >
                {canManagePOs && (
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 accent-blue-600 w-4 h-4"
                      checked={selectedRows.has(i)}
                      onChange={() => toggleRow(i)}
                    />
                  </td>
                )}
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-blue-600 font-semibold text-sm hover:underline">
                      {order.poNumber || order.id}
                    </span>
                    {isOverdue(order) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-500 bg-red-50 border border-red-200 rounded-full px-2 py-0.5 w-fit">
                        <AlertCircle className="w-3 h-3" /> OVERDUE
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-700">{order.supplier?.name || order.supplierNameSnapshot || order.supplier}</td>
                <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">{formatDate(getOrderDate(order))}</td>
                <td className="py-4 px-4 text-sm font-semibold text-gray-900">{currency(getTotalAmount(order))}</td>
                <td className="py-4 px-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="py-4 px-4">
                  {/* Inventory Manager has no useful destination for DRAFT
                      orders (the Approval Workflow page is gated to
                      Admin/Branch Manager), so hide the View action for
                      DRAFT rows for that role instead of sending them to
                      a screen they can't act on. */}
                  {order.status === "DRAFT" && !canManagePOs ? null : (
                    <ActionButtons onView={() => goToDetail(order)} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
          <span className="text-sm text-gray-500">
            {totalOrders > 0 ? `Showing ${from} to ${to} of ${totalOrders} orders` : "No orders to show"}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "…" ? (
                  <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}