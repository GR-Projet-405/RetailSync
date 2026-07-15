import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Plus, Search, ArrowRight, Clock, CheckCircle, XCircle, Package, X } from "lucide-react";
import { WAREHOUSES } from "./WarehouseList";
const TRANSFERS = [
  { id: "TRF-0891", from: "Downtown Main Warehouse", to: "North Distribution Center", sku: "SKU-10045", product: "Wireless Headphones", qty: 120, priority: "High", status: "In Transit", requestedBy: "Sarah Mitchell", date: "2026-06-10", notes: "Urgent replenishment" },
  { id: "TRF-0890", from: "South Storage Facility", to: "Downtown Main Warehouse", sku: "SKU-10089", product: "Smart Watch Pro", qty: 45, priority: "Normal", status: "Pending", requestedBy: "Priya Nair", date: "2026-06-10" },
  { id: "TRF-0889", from: "North Distribution Center", to: "East Fulfillment Hub", sku: "SKU-10112", product: "USB-C Hub 7-in-1", qty: 200, priority: "Normal", status: "Pending", requestedBy: "James Patel", date: "2026-06-09" },
  { id: "TRF-0888", from: "West Regional Depot", to: "South Storage Facility", sku: "SKU-10034", product: "Laptop Stand Adjustable", qty: 60, priority: "Low", status: "Completed", requestedBy: "Anna Lee", date: "2026-06-08", completedDate: "2026-06-09" },
  { id: "TRF-0887", from: "Downtown Main Warehouse", to: "West Regional Depot", sku: "SKU-10078", product: "Mechanical Keyboard TKL", qty: 30, priority: "High", status: "Completed", requestedBy: "Alex Chen", date: "2026-06-07", completedDate: "2026-06-08" },
  { id: "TRF-0886", from: "East Fulfillment Hub", to: "Downtown Main Warehouse", sku: "SKU-10156", product: "4K Webcam", qty: 15, priority: "High", status: "Cancelled", requestedBy: "Tom Nguyen", date: "2026-06-06", notes: "Supplier delay" },
  { id: "TRF-0885", from: "North Distribution Center", to: "South Storage Facility", sku: "SKU-10023", product: "Phone Case MagSafe", qty: 500, priority: "Normal", status: "Completed", requestedBy: "James Patel", date: "2026-06-05", completedDate: "2026-06-06" },
  { id: "TRF-0884", from: "South Storage Facility", to: "East Fulfillment Hub", sku: "SKU-10067", product: "Monitor Arm Dual", qty: 25, priority: "Normal", status: "Completed", requestedBy: "Priya Nair", date: "2026-06-04", completedDate: "2026-06-05" },
  { id: "TRF-0883", from: "West Regional Depot", to: "North Distribution Center", sku: "SKU-10099", product: "SSD Drive 1TB", qty: 80, priority: "High", status: "Completed", requestedBy: "Anna Lee", date: "2026-06-03", completedDate: "2026-06-04" }
];
const STATUS_STYLES = {
  Pending: { badge: "bg-[#fff7e6] text-[#d97706]", icon: /* @__PURE__ */ jsx(Clock, { size: 13, color: "#d97706" }) },
  "In Transit": { badge: "bg-[#e9ebff] text-[#004ac6]", icon: /* @__PURE__ */ jsx(ArrowRight, { size: 13, color: "#004ac6" }) },
  Completed: { badge: "bg-[#e6f9ee] text-[#16a34a]", icon: /* @__PURE__ */ jsx(CheckCircle, { size: 13, color: "#16a34a" }) },
  Cancelled: { badge: "bg-[#fee2e2] text-[#dc2626]", icon: /* @__PURE__ */ jsx(XCircle, { size: 13, color: "#dc2626" }) }
};
const PRIORITY_STYLES = {
  High: "text-[#dc2626] bg-[#fee2e2]",
  Normal: "text-[#505f76] bg-[#f2f3ff]",
  Low: "text-[#737686] bg-[#f8f9ff]"
};
function TransferRequests() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ from: "", to: "", sku: "", product: "", qty: "", priority: "Normal", notes: "" });
  const counts = { All: TRANSFERS.length, Pending: 0, "In Transit": 0, Completed: 0, Cancelled: 0 };
  TRANSFERS.forEach((t) => {
    counts[t.status]++;
  });
  const filtered = TRANSFERS.filter((t) => {
    const matchSearch = search === "" || t.id.toLowerCase().includes(search.toLowerCase()) || t.product.toLowerCase().includes(search.toLowerCase()) || t.sku.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-[24px] w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "font-['Hanken_Grotesk:Bold',sans-serif] font-bold text-[#131b2e] text-[24px] leading-[32px]", children: "Transfer Requests" }),
        /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#737686] text-[13px] mt-[2px]", children: "Manage inter-warehouse inventory transfers" })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: () => setShowModal(true), className: "flex items-center gap-[8px] bg-[#2563eb] text-white px-[16px] py-[9px] rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[13px] tracking-[0.13px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] hover:bg-[#1d4ed8] transition-colors", children: [
        /* @__PURE__ */ jsx(Plus, { size: 14, strokeWidth: 2.5 }),
        "New Transfer Request"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-[16px]", children: ["Pending", "In Transit", "Completed", "Cancelled"].map((s) => /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#c3c6d7] rounded-[12px] p-[18px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-[8px]", children: [
        /* @__PURE__ */ jsx("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#737686] text-[12px]", children: s }),
        STATUS_STYLES[s].icon
      ] }),
      /* @__PURE__ */ jsx("p", { className: "font-['Hanken_Grotesk:Bold',sans-serif] font-bold text-[#131b2e] text-[28px] leading-[34px]", children: counts[s] }),
      /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#737686] text-[11px] mt-[4px]", children: "requests" })
    ] }, s)) }),
    /* @__PURE__ */ jsx("div", { className: "bg-white border border-[#c3c6d7] rounded-[12px] p-[14px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-[12px] flex-wrap", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1 min-w-[220px]", children: [
        /* @__PURE__ */ jsx(Search, { size: 14, className: "absolute left-[10px] top-1/2 -translate-y-1/2 text-[#737686]" }),
        /* @__PURE__ */ jsx("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search by ID, product, or SKU...", className: "w-full pl-[32px] pr-[12px] py-[7px] rounded-[8px] border border-[#c3c6d7] font-['Inter:Regular',sans-serif] text-[12px] text-[#131b2e] placeholder:text-[#737686] focus:outline-none focus:border-[#004ac6] bg-white" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-[6px]", children: ["All", "Pending", "In Transit", "Completed", "Cancelled"].map((s) => /* @__PURE__ */ jsxs("button", { onClick: () => setStatusFilter(s), className: `px-[12px] py-[5px] rounded-[8px] text-[12px] font-['Inter:Medium',sans-serif] font-medium transition-colors ${statusFilter === s ? "bg-[#004ac6] text-white" : "bg-[#f2f3ff] text-[#505f76] hover:bg-[#e9ebff]"}`, children: [
        s,
        " (",
        counts[s],
        ")"
      ] }, s)) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "bg-white border border-[#c3c6d7] rounded-[12px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "bg-[#f8f9ff] border-b border-[#c3c6d7]", children: ["Request ID", "From \u2192 To", "Product", "Qty", "Priority", "Requested By", "Date", "Status"].map((h) => /* @__PURE__ */ jsx("th", { className: "px-[16px] py-[10px] text-left font-['Inter:Medium',sans-serif] font-medium text-[#737686] text-[11px] tracking-[0.5px] uppercase", children: h }, h)) }) }),
      /* @__PURE__ */ jsx("tbody", { children: filtered.map((t, i) => /* @__PURE__ */ jsxs("tr", { className: `border-b border-[#c3c6d7] hover:bg-[#f8f9ff] transition-colors ${i === filtered.length - 1 ? "border-b-0" : ""}`, children: [
        /* @__PURE__ */ jsxs("td", { className: "px-[16px] py-[14px]", children: [
          /* @__PURE__ */ jsx("p", { className: "font-['Liberation_Mono:Regular',monospace] text-[12px] text-[#131b2e]", children: t.id }),
          t.notes && /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#737686] text-[10px] mt-[1px] max-w-[100px] truncate", children: t.notes })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-[16px] py-[14px]", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-[4px] max-w-[200px]", children: [
          /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#505f76] text-[11px] truncate", children: t.from.replace(" Warehouse", "").replace(" Center", "").replace(" Facility", "").replace(" Hub", "").replace(" Depot", "") }),
          /* @__PURE__ */ jsx(ArrowRight, { size: 10, className: "text-[#737686] shrink-0" }),
          /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#505f76] text-[11px] truncate", children: t.to.replace(" Warehouse", "").replace(" Center", "").replace(" Facility", "").replace(" Hub", "").replace(" Depot", "") })
        ] }) }),
        /* @__PURE__ */ jsxs("td", { className: "px-[16px] py-[14px]", children: [
          /* @__PURE__ */ jsx("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#131b2e] text-[12px]", children: t.product }),
          /* @__PURE__ */ jsx("p", { className: "font-['Liberation_Mono:Regular',monospace] text-[10px] text-[#737686]", children: t.sku })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-[16px] py-[14px]", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-[4px]", children: [
          /* @__PURE__ */ jsx(Package, { size: 12, className: "text-[#737686]" }),
          /* @__PURE__ */ jsx("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#131b2e] text-[12px]", children: t.qty })
        ] }) }),
        /* @__PURE__ */ jsx("td", { className: "px-[16px] py-[14px]", children: /* @__PURE__ */ jsx("span", { className: `px-[7px] py-[2px] rounded-[4px] text-[11px] font-['Inter:Medium',sans-serif] font-medium ${PRIORITY_STYLES[t.priority]}`, children: t.priority }) }),
        /* @__PURE__ */ jsx("td", { className: "px-[16px] py-[14px]", children: /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#505f76] text-[12px]", children: t.requestedBy }) }),
        /* @__PURE__ */ jsxs("td", { className: "px-[16px] py-[14px]", children: [
          /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#505f76] text-[12px]", children: t.date }),
          t.completedDate && /* @__PURE__ */ jsxs("p", { className: "font-['Inter:Regular',sans-serif] text-[#737686] text-[10px]", children: [
            "Done: ",
            t.completedDate
          ] })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-[16px] py-[14px]", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-[5px]", children: [
          STATUS_STYLES[t.status].icon,
          /* @__PURE__ */ jsx("span", { className: `px-[7px] py-[2px] rounded-[4px] text-[11px] font-['Inter:Medium',sans-serif] font-medium ${STATUS_STYLES[t.status].badge}`, children: t.status })
        ] }) })
      ] }, t.id)) })
    ] }) }),
    showModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-[24px]", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[16px] shadow-xl w-full max-w-[520px] border border-[#c3c6d7]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-[24px] py-[18px] border-b border-[#c3c6d7]", children: [
        /* @__PURE__ */ jsx("p", { className: "font-['Hanken_Grotesk:SemiBold',sans-serif] font-semibold text-[#131b2e] text-[18px]", children: "New Transfer Request" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setShowModal(false), className: "p-[6px] rounded-[8px] hover:bg-[#f2f3ff] transition-colors text-[#737686]", children: /* @__PURE__ */ jsx(X, { size: 16 }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-[24px] flex flex-col gap-[16px]", children: [
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-[12px]", children: ["from", "to"].map((field) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#505f76] text-[12px] tracking-[0.12px] mb-[6px] block capitalize", children: field === "from" ? "From Warehouse" : "To Warehouse" }),
          /* @__PURE__ */ jsxs("select", { value: form[field], onChange: (e) => setForm((f) => ({ ...f, [field]: e.target.value })), className: "w-full px-[12px] py-[8px] rounded-[8px] border border-[#c3c6d7] font-['Inter:Regular',sans-serif] text-[12px] text-[#131b2e] bg-white focus:outline-none focus:border-[#004ac6]", children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Select warehouse..." }),
            WAREHOUSES.map((w) => /* @__PURE__ */ jsx("option", { value: w.name, children: w.name }, w.id))
          ] })
        ] }, field)) }),
        [{ key: "sku", label: "SKU", placeholder: "e.g. SKU-10045" }, { key: "product", label: "Product Name", placeholder: "e.g. Wireless Headphones" }].map(({ key, label, placeholder }) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#505f76] text-[12px] tracking-[0.12px] mb-[6px] block", children: label }),
          /* @__PURE__ */ jsx("input", { value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })), placeholder, className: "w-full px-[12px] py-[8px] rounded-[8px] border border-[#c3c6d7] font-['Inter:Regular',sans-serif] text-[12px] text-[#131b2e] placeholder:text-[#737686] focus:outline-none focus:border-[#004ac6] bg-white" })
        ] }, key)),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-[12px]", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#505f76] text-[12px] tracking-[0.12px] mb-[6px] block", children: "Quantity" }),
            /* @__PURE__ */ jsx("input", { type: "number", value: form.qty, onChange: (e) => setForm((f) => ({ ...f, qty: e.target.value })), placeholder: "0", className: "w-full px-[12px] py-[8px] rounded-[8px] border border-[#c3c6d7] font-['Inter:Regular',sans-serif] text-[12px] text-[#131b2e] placeholder:text-[#737686] focus:outline-none focus:border-[#004ac6] bg-white" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#505f76] text-[12px] tracking-[0.12px] mb-[6px] block", children: "Priority" }),
            /* @__PURE__ */ jsxs("select", { value: form.priority, onChange: (e) => setForm((f) => ({ ...f, priority: e.target.value })), className: "w-full px-[12px] py-[8px] rounded-[8px] border border-[#c3c6d7] font-['Inter:Regular',sans-serif] text-[12px] text-[#131b2e] bg-white focus:outline-none focus:border-[#004ac6]", children: [
              /* @__PURE__ */ jsx("option", { children: "High" }),
              /* @__PURE__ */ jsx("option", { children: "Normal" }),
              /* @__PURE__ */ jsx("option", { children: "Low" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#505f76] text-[12px] tracking-[0.12px] mb-[6px] block", children: "Notes (optional)" }),
          /* @__PURE__ */ jsx("textarea", { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), placeholder: "Add any notes...", rows: 2, className: "w-full px-[12px] py-[8px] rounded-[8px] border border-[#c3c6d7] font-['Inter:Regular',sans-serif] text-[12px] text-[#131b2e] placeholder:text-[#737686] focus:outline-none focus:border-[#004ac6] bg-white resize-none" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-[8px] px-[24px] py-[16px] border-t border-[#c3c6d7]", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowModal(false), className: "px-[16px] py-[8px] rounded-[8px] border border-[#c3c6d7] font-['Inter:Medium',sans-serif] font-medium text-[#505f76] text-[13px] hover:bg-[#f2f3ff] transition-colors", children: "Cancel" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setShowModal(false), className: "px-[16px] py-[8px] rounded-[8px] bg-[#2563eb] text-white font-['Inter:Medium',sans-serif] font-medium text-[13px] hover:bg-[#1d4ed8] transition-colors drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]", children: "Submit Request" })
      ] })
    ] }) })
  ] });
}
export {
  TransferRequests as default
};
