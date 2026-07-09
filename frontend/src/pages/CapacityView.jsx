import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { WAREHOUSES } from "./WarehouseList";
const ZONE_CAPACITY = [
  { zone: "Zone A", capacity: 1250, used: 1040, available: 210, category: "Dry Goods" },
  { zone: "Zone B", capacity: 1250, used: 875, available: 375, category: "Cold Storage" },
  { zone: "Zone C", capacity: 1250, used: 1175, available: 75, category: "Bulk Items" },
  { zone: "Zone D", capacity: 1250, used: 1160, available: 90, category: "High-Value" }
];
const TREND_DATA = [
  { month: "Jan", Downtown: 72, North: 58, South: 80, East: 30 },
  { month: "Feb", Downtown: 75, North: 60, South: 83, East: 32 },
  { month: "Mar", Downtown: 78, North: 61, South: 85, East: 31 },
  { month: "Apr", Downtown: 80, North: 59, South: 87, East: 33 },
  { month: "May", Downtown: 82, North: 62, South: 89, East: 32 },
  { month: "Jun", Downtown: 85, North: 62, South: 91, East: 33 }
];
const FORECAST_DATA = [
  { month: "Jul", forecast: 87, actual: null },
  { month: "Aug", forecast: 89, actual: null },
  { month: "Sep", forecast: 92, actual: null },
  { month: "Oct", forecast: 91, actual: null }
];
const COLORS = ["#004ac6", "#2563eb", "#7c3aed", "#059669"];
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#c3c6d7] rounded-[8px] p-[10px] shadow-sm", children: [
      /* @__PURE__ */ jsx("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#131b2e] text-[12px] mb-[4px]", children: label }),
      payload.map((p, i) => /* @__PURE__ */ jsxs("p", { className: "font-['Inter:Regular',sans-serif] text-[12px]", style: { color: p.color }, children: [
        p.name,
        ": ",
        p.value,
        typeof p.value === "number" && p.unit ? p.unit : ""
      ] }, i))
    ] });
  }
  return null;
};
function CapacityView({ warehouseId }) {
  const [selectedWh, setSelectedWh] = useState(warehouseId ?? "all");
  const wh = selectedWh !== "all" ? WAREHOUSES.find((w) => w.id === selectedWh) : null;
  const totalCap = WAREHOUSES.reduce((s, w) => s + w.totalCapacity, 0);
  const totalUsed = WAREHOUSES.reduce((s, w) => s + w.usedCapacity, 0);
  const overallPct = Math.round(totalUsed / totalCap * 100);
  const pieData = [
    { name: "Used", value: totalUsed, color: "#004ac6" },
    { name: "Available", value: totalCap - totalUsed, color: "#eaedff" }
  ];
  const warehouseBar = WAREHOUSES.map((w) => ({
    name: w.name.replace(" Warehouse", "").replace(" Center", "").replace(" Facility", "").replace(" Hub", "").replace(" Depot", ""),
    used: w.usedCapacity,
    available: w.totalCapacity - w.usedCapacity,
    pct: Math.round(w.usedCapacity / w.totalCapacity * 100)
  }));
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-[24px] w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "font-['Hanken_Grotesk:Bold',sans-serif] font-bold text-[#131b2e] text-[24px] leading-[32px]", children: "Capacity Analytics" }),
        /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#737686] text-[13px] mt-[2px]", children: "Real-time warehouse capacity overview" })
      ] }),
      /* @__PURE__ */ jsxs("select", { value: selectedWh, onChange: (e) => setSelectedWh(e.target.value), className: "px-[12px] py-[8px] rounded-[8px] border border-[#c3c6d7] font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#131b2e] bg-white focus:outline-none focus:border-[#004ac6]", children: [
        /* @__PURE__ */ jsx("option", { value: "all", children: "All Warehouses" }),
        WAREHOUSES.map((w) => /* @__PURE__ */ jsx("option", { value: w.id, children: w.name }, w.id))
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-[16px]", children: [
      { label: "Network Capacity", value: `${(totalCap / 1e3).toFixed(0)}K`, sub: "Total pallet positions" },
      { label: "Network Utilization", value: `${overallPct}%`, sub: `${totalUsed.toLocaleString()} units occupied` },
      { label: "Critical (>90%)", value: WAREHOUSES.filter((w) => w.usedCapacity / w.totalCapacity >= 0.9).length.toString(), sub: "Warehouses above threshold" },
      { label: "Available Positions", value: `${((totalCap - totalUsed) / 1e3).toFixed(1)}K`, sub: "Free pallet positions" }
    ].map((s, i) => /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#c3c6d7] rounded-[12px] p-[18px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]", children: [
      /* @__PURE__ */ jsx("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#737686] text-[12px] tracking-[0.12px] mb-[8px]", children: s.label }),
      /* @__PURE__ */ jsx("p", { className: "font-['Hanken_Grotesk:Bold',sans-serif] font-bold text-[#131b2e] text-[28px] leading-[34px]", children: s.value }),
      /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#737686] text-[12px] mt-[4px]", children: s.sub })
    ] }, i)) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-[16px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#c3c6d7] rounded-[12px] p-[20px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]", children: [
        /* @__PURE__ */ jsx("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#131b2e] text-[14px] mb-[16px]", children: "Overall Utilization" }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(PieChart, { width: 180, height: 180, children: /* @__PURE__ */ jsx(Pie, { data: pieData, cx: 90, cy: 90, innerRadius: 55, outerRadius: 80, dataKey: "value", startAngle: 90, endAngle: -270, children: pieData.map((entry, i) => /* @__PURE__ */ jsx(Cell, { fill: entry.color }, i)) }) }),
          /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none", children: [
            /* @__PURE__ */ jsxs("p", { className: "font-['Hanken_Grotesk:Bold',sans-serif] font-bold text-[#131b2e] text-[26px]", children: [
              overallPct,
              "%"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#737686] text-[11px]", children: "Used" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-center gap-[20px] mt-[8px]", children: pieData.map((d) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-[6px]", children: [
          /* @__PURE__ */ jsx("div", { className: "w-[8px] h-[8px] rounded-full", style: { backgroundColor: d.color } }),
          /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#505f76] text-[11px]", children: d.name })
        ] }, d.name)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-span-2 bg-white border border-[#c3c6d7] rounded-[12px] p-[20px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]", children: [
        /* @__PURE__ */ jsx("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#131b2e] text-[14px] mb-[16px]", children: "Zone Capacity Breakdown" }),
        /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxs(BarChart, { data: ZONE_CAPACITY, barGap: 4, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#eaedff", vertical: false }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "zone", tick: { fontSize: 11, fill: "#737686", fontFamily: "Inter" }, axisLine: false, tickLine: false }),
          /* @__PURE__ */ jsx(YAxis, { tick: { fontSize: 11, fill: "#737686", fontFamily: "Inter" }, axisLine: false, tickLine: false }),
          /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(CustomTooltip, {}) }),
          /* @__PURE__ */ jsx(Legend, { wrapperStyle: { fontSize: 11, fontFamily: "Inter", color: "#737686" } }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "used", name: "Used", fill: "#004ac6", radius: [3, 3, 0, 0] }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "available", name: "Available", fill: "#eaedff", radius: [3, 3, 0, 0] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-[16px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#c3c6d7] rounded-[12px] p-[20px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]", children: [
        /* @__PURE__ */ jsx("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#131b2e] text-[14px] mb-[16px]", children: "Warehouse Utilization" }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-[12px]", children: warehouseBar.map((w) => {
          const barColor = w.pct >= 90 ? "#dc2626" : w.pct >= 70 ? "#d97706" : "#16a34a";
          return /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-[4px]", children: [
              /* @__PURE__ */ jsx("p", { className: "font-['Inter:Regular',sans-serif] text-[#505f76] text-[12px]", children: w.name }),
              /* @__PURE__ */ jsxs("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[12px]", style: { color: barColor }, children: [
                w.pct,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-[8px] bg-[#eaedff] rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full transition-all duration-500", style: { width: `${w.pct}%`, backgroundColor: barColor } }) })
          ] }, w.name);
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#c3c6d7] rounded-[12px] p-[20px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-[16px]", children: [
          /* @__PURE__ */ jsx("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#131b2e] text-[14px]", children: "Utilization Trends" }),
          /* @__PURE__ */ jsx("span", { className: "px-[8px] py-[2px] bg-[#e9ebff] text-[#004ac6] rounded-[4px] text-[11px] font-['Inter:Medium',sans-serif] font-medium", children: "6 Months" })
        ] }),
        /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxs(LineChart, { data: TREND_DATA, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#eaedff", vertical: false }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "month", tick: { fontSize: 11, fill: "#737686", fontFamily: "Inter" }, axisLine: false, tickLine: false }),
          /* @__PURE__ */ jsx(YAxis, { tick: { fontSize: 11, fill: "#737686", fontFamily: "Inter" }, axisLine: false, tickLine: false, unit: "%", domain: [0, 100] }),
          /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(CustomTooltip, {}) }),
          /* @__PURE__ */ jsx(Legend, { wrapperStyle: { fontSize: 10, fontFamily: "Inter" } }),
          /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "Downtown", stroke: "#004ac6", strokeWidth: 2, dot: false }),
          /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "North", stroke: "#2563eb", strokeWidth: 2, dot: false }),
          /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "South", stroke: "#7c3aed", strokeWidth: 2, dot: false }),
          /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "East", stroke: "#059669", strokeWidth: 2, dot: false })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#c3c6d7] rounded-[12px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]", children: [
      /* @__PURE__ */ jsx("div", { className: "px-[20px] py-[14px] border-b border-[#c3c6d7]", children: /* @__PURE__ */ jsx("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#131b2e] text-[14px]", children: "Capacity Alerts" }) }),
      /* @__PURE__ */ jsx("div", { className: "p-[16px] grid grid-cols-3 gap-[12px]", children: WAREHOUSES.filter((w) => w.usedCapacity / w.totalCapacity >= 0.7).map((w) => {
        const pct = Math.round(w.usedCapacity / w.totalCapacity * 100);
        const isHigh = pct >= 90;
        return /* @__PURE__ */ jsxs("div", { className: `rounded-[8px] p-[14px] border ${isHigh ? "bg-[#fff1f2] border-[#fecdd3]" : "bg-[#fffbeb] border-[#fde68a]"}`, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-[6px]", children: [
            /* @__PURE__ */ jsx("p", { className: "font-['Inter:Medium',sans-serif] font-medium text-[#131b2e] text-[13px]", children: w.name }),
            /* @__PURE__ */ jsx("span", { className: `px-[7px] py-[2px] rounded-[4px] text-[11px] font-['Inter:Medium',sans-serif] font-medium ${isHigh ? "bg-[#fee2e2] text-[#dc2626]" : "bg-[#fff7e6] text-[#d97706]"}`, children: isHigh ? "Critical" : "Warning" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-[6px] bg-white rounded-full overflow-hidden mb-[6px]", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full", style: { width: `${pct}%`, backgroundColor: isHigh ? "#dc2626" : "#d97706" } }) }),
          /* @__PURE__ */ jsxs("p", { className: "font-['Inter:Regular',sans-serif] text-[12px]", style: { color: isHigh ? "#dc2626" : "#d97706" }, children: [
            pct,
            "% \u2014 ",
            (w.totalCapacity - w.usedCapacity).toLocaleString(),
            " units remaining"
          ] })
        ] }, w.id);
      }) })
    ] })
  ] });
}
export {
  CapacityView as default
};
