import { jsx, jsxs } from "react/jsx-runtime";
import { Plus, Search, MapPin, Package, TrendingUp, ArrowRight } from "lucide-react";
const WAREHOUSES = [
  { id: "wh-001", name: "Downtown Main Warehouse", code: "DWN-001", address: "150 Elm Street", city: "Melbourne, VIC", manager: "Sarah Mitchell", totalCapacity: 5e3, usedCapacity: 4250, totalLocations: 240, activeSkus: 1843, status: "Active" },
  { id: "wh-002", name: "North Distribution Center", code: "NDC-002", address: "890 Industrial Blvd", city: "Sydney, NSW", manager: "James Patel", totalCapacity: 8e3, usedCapacity: 4960, totalLocations: 380, activeSkus: 2910, status: "Active" },
  { id: "wh-003", name: "South Storage Facility", code: "SSF-003", address: "445 Commerce Ave", city: "Brisbane, QLD", manager: "Priya Nair", totalCapacity: 3200, usedCapacity: 2912, totalLocations: 160, activeSkus: 1205, status: "Active" },
  { id: "wh-004", name: "East Fulfillment Hub", code: "EFH-004", address: "1200 Harbor Drive", city: "Perth, WA", manager: "Tom Nguyen", totalCapacity: 6500, usedCapacity: 2145, totalLocations: 310, activeSkus: 878, status: "Maintenance" },
  { id: "wh-005", name: "West Regional Depot", code: "WRD-005", address: "78 Logistics Park", city: "Adelaide, SA", manager: "Anna Lee", totalCapacity: 2800, usedCapacity: 1260, totalLocations: 140, activeSkus: 654, status: "Active" }
];
const STATUS_STYLES = {
  Active: "bg-[#e6f9ee] text-[#16a34a]",
  Maintenance: "bg-[#fff7e6] text-[#d97706]",
  Inactive: "bg-[#fee2e2] text-[#dc2626]"
};
function WarehouseList({ onSelectWarehouse, onAddWarehouse, searchQuery, onSearchChange }) {
  const totalCapacity = WAREHOUSES.reduce((s, w) => s + w.totalCapacity, 0);
  const totalUsed = WAREHOUSES.reduce((s, w) => s + w.usedCapacity, 0);
  const totalLocations = WAREHOUSES.reduce((s, w) => s + w.totalLocations, 0);
  const pendingTransfers = 12;
  const filtered = WAREHOUSES.filter(
    (w) => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.code.toLowerCase().includes(searchQuery.toLowerCase()) || w.city.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-[24px] w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[12px] text-[#737686] tracking-[0.12px] leading-[16px]", children: "Inventory / Warehouse" }),
        /* @__PURE__ */ jsx("h1", { className: "font-['Hanken_Grotesk:Bold',sans-serif] font-bold text-[#131b2e] text-[24px] leading-[32px] mt-[4px]", children: "Warehouse Management" })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: onAddWarehouse,
          className: "flex items-center gap-[8px] bg-[#2563eb] text-white px-[16px] py-[9px] rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[13px] tracking-[0.13px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] hover:bg-[#1d4ed8] transition-colors",
          children: [
            /* @__PURE__ */ jsx(Plus, { size: 14, strokeWidth: 2.5 }),
            "Add Warehouse"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-[16px]", children: [
      { label: "Total Warehouses", value: WAREHOUSES.length.toString(), sub: `${WAREHOUSES.filter((w) => w.status === "Active").length} Active`, color: "#e9ebff", icon: /* @__PURE__ */ jsx(Package, { size: 20, color: "#004ac6" }) },
      { label: "Total Capacity", value: `${(totalCapacity / 1e3).toFixed(1)}K`, sub: "Pallet positions", color: "#e9ebff", icon: /* @__PURE__ */ jsx(Package, { size: 20, color: "#004ac6" }) },
      { label: "Capacity Used", value: `${Math.round(totalUsed / totalCapacity * 100)}%`, sub: `${totalUsed.toLocaleString()} / ${totalCapacity.toLocaleString()} units`, color: "#fff7e6", icon: /* @__PURE__ */ jsx(TrendingUp, { size: 20, color: "#d97706" }) },
      { label: "Storage Locations", value: totalLocations.toLocaleString(), sub: `${pendingTransfers} pending transfers`, color: "#e6f9ee", icon: /* @__PURE__ */ jsx(MapPin, { size: 20, color: "#16a34a" }) }
    ].map((card, i) => /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#c3c6d7] rounded-[12px] p-[20px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-[12px]", children: [
        /* @__PURE__ */ jsx("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#737686] text-[12px] tracking-[0.12px]", children: card.label }),
        /* @__PURE__ */ jsx("div", { className: "p-[8px] rounded-[8px]", style: { backgroundColor: card.color }, children: card.icon })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "font-['Hanken_Grotesk:Bold',sans-serif] font-bold text-[#131b2e] text-[28px] leading-[34px]", children: card.value }),
      /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#737686] text-[12px] mt-[4px]", children: card.sub })
    ] }, i)) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#c3c6d7] rounded-[12px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-[20px] py-[16px] border-b border-[#c3c6d7]", children: [
        /* @__PURE__ */ jsx("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#131b2e] text-[14px]", children: "All Warehouses" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { size: 14, className: "absolute left-[10px] top-1/2 -translate-y-1/2 text-[#737686]" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: searchQuery,
              onChange: (e) => onSearchChange(e.target.value),
              placeholder: "Search warehouses...",
              className: "pl-[32px] pr-[12px] py-[7px] rounded-[8px] border border-[#c3c6d7] font-['Inter:Regular',sans-serif] text-[12px] text-[#131b2e] placeholder:text-[#737686] focus:outline-none focus:border-[#004ac6] w-[220px] bg-white"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "bg-[#f8f9ff]", children: ["Warehouse", "Location", "Capacity", "Utilization", "Locations", "Manager", "Status", ""].map((h) => /* @__PURE__ */ jsx("th", { className: "px-[16px] py-[10px] text-left font-['Inter:Medium',sans-serif] font-medium text-[#737686] text-[11px] tracking-[0.5px] uppercase border-b border-[#c3c6d7]", children: h }, h)) }) }),
        /* @__PURE__ */ jsx("tbody", { children: filtered.map((w, idx) => {
          const pct = Math.round(w.usedCapacity / w.totalCapacity * 100);
          const barColor = pct >= 90 ? "#dc2626" : pct >= 70 ? "#d97706" : "#16a34a";
          return /* @__PURE__ */ jsxs(
            "tr",
            {
              className: `border-b border-[#c3c6d7] hover:bg-[#f8f9ff] transition-colors cursor-pointer ${idx === filtered.length - 1 ? "border-b-0" : ""}`,
              onClick: () => onSelectWarehouse(w.id),
              children: [
                /* @__PURE__ */ jsxs("td", { className: "px-[16px] py-[14px]", children: [
                  /* @__PURE__ */ jsx("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#131b2e] text-[13px]", children: w.name }),
                  /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#737686] text-[11px] mt-[1px]", children: w.code })
                ] }),
                /* @__PURE__ */ jsxs("td", { className: "px-[16px] py-[14px]", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-[4px]", children: [
                    /* @__PURE__ */ jsx(MapPin, { size: 12, className: "text-[#737686] shrink-0" }),
                    /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#505f76] text-[12px]", children: w.city })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#737686] text-[11px] mt-[1px]", children: w.address })
                ] }),
                /* @__PURE__ */ jsx("td", { className: "px-[16px] py-[14px]", children: /* @__PURE__ */ jsxs("p", { className: "font-['Inter:Regular',sans-serif] text-[#505f76] text-[12px]", children: [
                  w.totalCapacity.toLocaleString(),
                  " units"
                ] }) }),
                /* @__PURE__ */ jsx("td", { className: "px-[16px] py-[14px] w-[140px]", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-[8px]", children: [
                  /* @__PURE__ */ jsx("div", { className: "flex-1 h-[6px] bg-[#eaedff] rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full transition-all", style: { width: `${pct}%`, backgroundColor: barColor } }) }),
                  /* @__PURE__ */ jsxs("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[12px] shrink-0", style: { color: barColor }, children: [
                    pct,
                    "%"
                  ] })
                ] }) }),
                /* @__PURE__ */ jsx("td", { className: "px-[16px] py-[14px]", children: /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#505f76] text-[12px]", children: w.totalLocations }) }),
                /* @__PURE__ */ jsx("td", { className: "px-[16px] py-[14px]", children: /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#505f76] text-[12px]", children: w.manager }) }),
                /* @__PURE__ */ jsx("td", { className: "px-[16px] py-[14px]", children: /* @__PURE__ */ jsx("span", { className: `px-[8px] py-[3px] rounded-[4px] text-[11px] font-['Inter:Medium',sans-serif] font-medium ${STATUS_STYLES[w.status]}`, children: w.status }) }),
                /* @__PURE__ */ jsx("td", { className: "px-[16px] py-[14px]", children: /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-[4px] text-[#004ac6] font-['Inter:Medium',sans-serif] font-medium text-[12px] hover:text-[#2563eb] transition-colors", onClick: (e) => {
                  e.stopPropagation();
                  onSelectWarehouse(w.id);
                }, children: [
                  "View ",
                  /* @__PURE__ */ jsx(ArrowRight, { size: 12 })
                ] }) })
              ]
            },
            w.id
          );
        }) })
      ] }) })
    ] })
  ] });
}
export {
  WAREHOUSES,
  WarehouseList as default
};
