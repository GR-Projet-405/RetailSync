import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowLeft, MapPin, Package, Users, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { WAREHOUSES } from "./WarehouseList";
const RECENT_ACTIVITY = [
  { id: "ACT-001", type: "transfer_in", desc: "Received 240 units from NDC-002", time: "2 hours ago", status: "completed" },
  { id: "ACT-002", type: "transfer_out", desc: "Dispatched 80 units to SSF-003", time: "4 hours ago", status: "completed" },
  { id: "ACT-003", type: "audit", desc: "Zone B capacity audit performed", time: "Yesterday", status: "completed" },
  { id: "ACT-004", type: "maintenance", desc: "Racking inspection \u2014 Zone A Row 5", time: "Yesterday", status: "completed" },
  { id: "ACT-005", type: "transfer_in", desc: "Incoming shipment from Supplier #104", time: "2 days ago", status: "completed" }
];
const ZONE_DATA = [
  { zone: "Zone A", total: 60, used: 52, category: "Dry Goods" },
  { zone: "Zone B", total: 60, used: 48, category: "Cold Storage" },
  { zone: "Zone C", total: 60, used: 41, category: "Bulk Items" },
  { zone: "Zone D", total: 60, used: 58, category: "High-Value" }
];
function WarehouseDetails({ warehouseId, onBack, onViewLocations }) {
  const wh = WAREHOUSES.find((w) => w.id === warehouseId) ?? WAREHOUSES[0];
  const pct = Math.round(wh.usedCapacity / wh.totalCapacity * 100);
  const available = wh.totalCapacity - wh.usedCapacity;
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-[24px] w-full", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("button", { onClick: onBack, className: "flex items-center gap-[6px] text-[#505f76] font-['Inter:Medium',sans-serif] font-medium text-[12px] hover:text-[#004ac6] transition-colors mb-[12px]", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { size: 14 }),
        " Back to Warehouses"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-[10px]", children: [
            /* @__PURE__ */ jsx("h1", { className: "font-['Hanken_Grotesk:Bold',sans-serif] font-bold text-[#131b2e] text-[24px] leading-[32px]", children: wh.name }),
            /* @__PURE__ */ jsx("span", { className: `px-[8px] py-[3px] rounded-[4px] text-[11px] font-['Inter:Medium',sans-serif] font-medium ${wh.status === "Active" ? "bg-[#e6f9ee] text-[#16a34a]" : "bg-[#fff7e6] text-[#d97706]"}`, children: wh.status })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-[16px] mt-[4px]", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-[4px] text-[#737686]", children: [
              /* @__PURE__ */ jsx(MapPin, { size: 12 }),
              /* @__PURE__ */ jsxs("p", { className: "font-['Inter:Regular',sans-serif] text-[12px]", children: [
                wh.address,
                ", ",
                wh.city
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-[4px] text-[#737686]", children: [
              /* @__PURE__ */ jsx(Users, { size: 12 }),
              /* @__PURE__ */ jsxs("p", { className: "font-['Inter:Regular',sans-serif] text-[12px]", children: [
                "Manager: ",
                wh.manager
              ] })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "font-['Inter:Regular',sans-serif] text-[#737686] text-[12px]", children: [
              "Code: ",
              /* @__PURE__ */ jsx("span", { className: "text-[#505f76]", children: wh.code })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: onViewLocations,
            className: "flex items-center gap-[8px] bg-[#2563eb] text-white px-[16px] py-[9px] rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[13px] tracking-[0.13px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] hover:bg-[#1d4ed8] transition-colors",
            children: [
              /* @__PURE__ */ jsx(Package, { size: 14 }),
              "View Storage Locations"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-[16px]", children: [
      { label: "Total Capacity", value: wh.totalCapacity.toLocaleString(), sub: "Pallet positions", icon: /* @__PURE__ */ jsx(Package, { size: 18, color: "#004ac6" }), bg: "#e9ebff" },
      { label: "Used Capacity", value: wh.usedCapacity.toLocaleString(), sub: `${pct}% utilization`, icon: /* @__PURE__ */ jsx(TrendingUp, { size: 18, color: pct >= 90 ? "#dc2626" : "#d97706" }), bg: pct >= 90 ? "#fee2e2" : "#fff7e6" },
      { label: "Available", value: available.toLocaleString(), sub: "Free positions", icon: /* @__PURE__ */ jsx(CheckCircle, { size: 18, color: "#16a34a" }), bg: "#e6f9ee" },
      { label: "Active SKUs", value: wh.activeSkus.toLocaleString(), sub: `${wh.totalLocations} locations`, icon: /* @__PURE__ */ jsx(Package, { size: 18, color: "#7c3aed" }), bg: "#f3e8ff" }
    ].map((s, i) => /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#c3c6d7] rounded-[12px] p-[18px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-[10px]", children: [
        /* @__PURE__ */ jsx("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#737686] text-[12px] tracking-[0.12px]", children: s.label }),
        /* @__PURE__ */ jsx("div", { className: "p-[7px] rounded-[8px]", style: { backgroundColor: s.bg }, children: s.icon })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "font-['Hanken_Grotesk:Bold',sans-serif] font-bold text-[#131b2e] text-[26px] leading-[32px]", children: s.value }),
      /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#737686] text-[12px] mt-[4px]", children: s.sub })
    ] }, i)) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#c3c6d7] rounded-[12px] p-[20px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-[14px]", children: [
        /* @__PURE__ */ jsx("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#131b2e] text-[14px]", children: "Overall Capacity" }),
        /* @__PURE__ */ jsxs("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[12px]", style: { color: pct >= 90 ? "#dc2626" : pct >= 70 ? "#d97706" : "#16a34a" }, children: [
          pct,
          "% Used"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-[10px] bg-[#eaedff] rounded-full overflow-hidden mb-[8px]", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full", style: { width: `${pct}%`, backgroundColor: pct >= 90 ? "#dc2626" : pct >= 70 ? "#d97706" : "#16a34a" } }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#737686] text-[11px]", children: "0" }),
        /* @__PURE__ */ jsxs("p", { className: "font-['Inter:Regular',sans-serif] text-[#737686] text-[11px]", children: [
          wh.totalCapacity.toLocaleString(),
          " units"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-[16px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#c3c6d7] rounded-[12px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]", children: [
        /* @__PURE__ */ jsx("div", { className: "px-[20px] py-[16px] border-b border-[#c3c6d7]", children: /* @__PURE__ */ jsx("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#131b2e] text-[14px]", children: "Zone Breakdown" }) }),
        /* @__PURE__ */ jsx("div", { className: "p-[16px] flex flex-col gap-[14px]", children: ZONE_DATA.map((z) => {
          const zPct = Math.round(z.used / z.total * 100);
          const zColor = zPct >= 90 ? "#dc2626" : zPct >= 70 ? "#d97706" : "#16a34a";
          return /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-[6px]", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#131b2e] text-[13px]", children: z.zone }),
                /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#737686] text-[11px]", children: z.category })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxs("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[12px]", style: { color: zColor }, children: [
                  zPct,
                  "%"
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "font-['Inter:Regular',sans-serif] text-[#737686] text-[11px]", children: [
                  z.used,
                  "/",
                  z.total,
                  " locations"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-[6px] bg-[#eaedff] rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full", style: { width: `${zPct}%`, backgroundColor: zColor } }) })
          ] }, z.zone);
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#c3c6d7] rounded-[12px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]", children: [
        /* @__PURE__ */ jsx("div", { className: "px-[20px] py-[16px] border-b border-[#c3c6d7]", children: /* @__PURE__ */ jsx("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#131b2e] text-[14px]", children: "Recent Activity" }) }),
        /* @__PURE__ */ jsx("div", { className: "p-[16px] flex flex-col gap-[12px]", children: RECENT_ACTIVITY.map((a) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-[10px]", children: [
          /* @__PURE__ */ jsx("div", { className: "mt-[2px] shrink-0", children: a.type === "transfer_in" ? /* @__PURE__ */ jsx(CheckCircle, { size: 15, color: "#16a34a" }) : a.type === "transfer_out" ? /* @__PURE__ */ jsx(TrendingUp, { size: 15, color: "#2563eb" }) : a.type === "maintenance" ? /* @__PURE__ */ jsx(AlertCircle, { size: 15, color: "#d97706" }) : /* @__PURE__ */ jsx(Clock, { size: 15, color: "#737686" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#131b2e] text-[12px] leading-[18px]", children: a.desc }),
            /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#737686] text-[11px] mt-[1px]", children: a.time })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "bg-[#e6f9ee] text-[#16a34a] px-[6px] py-[2px] rounded-[4px] text-[10px] font-['Inter:Medium',sans-serif] font-medium shrink-0", children: "Done" })
        ] }, a.id)) })
      ] })
    ] })
  ] });
}
export {
  WarehouseDetails as default
};
