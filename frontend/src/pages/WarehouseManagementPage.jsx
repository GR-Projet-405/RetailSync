import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Building2,
  MapPin,
  Users,
  Boxes,
  Package,
  TrendingUp,
  ArrowLeftRight,
  CheckCircle2,
  Circle,
  Clock,
  Truck,
  ClipboardList,
  AlertTriangle,
  X,
  Phone,
  Mail,
  BarChart3,
  Activity,
  List as ListIcon,
  Warehouse as WarehouseIcon,
  ChevronRight,
  History,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import axios from "axios";
import { createWarehouse } from "../services/warehouseService";
import { getWarehouses } from "../services/warehouseService";

/* ------------------------------------------------------------------ */
/* Design tokens (matches the existing module: white cards, blue      */
/* accent, slate text, soft borders, rounded-xl surfaces)             */
/* ------------------------------------------------------------------ */

const STATUS_STYLES = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Maintenance: "bg-amber-50 text-amber-700 ring-amber-200",
  Inactive: "bg-rose-50 text-rose-700 ring-rose-200",
  Full: "bg-rose-50 text-rose-700 ring-rose-200",
  Empty: "bg-slate-100 text-slate-600 ring-slate-200",
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Approved: "bg-blue-50 text-blue-700 ring-blue-200",
  "In Transit": "bg-indigo-50 text-indigo-700 ring-indigo-200",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
};

const CHART_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#64748b", "#8b5cf6"];

/* ------------------------------------------------------------------ */
/* Mock data — swap for useWarehouses / useBranches / real API calls  */
/* ------------------------------------------------------------------ */

// const WAREHOUSES = [
//   {
//     id: "wh-1",
//     code: "WH-COL-01",
//     name: "Colombo Central DC",
//     city: "Colombo",
//     address: "14 Orugodawatta Rd, Colombo 14",
//     manager: "Nadeesha Perera",
//     phone: "+94 77 213 4455",
//     email: "nadeesha.p@company.lk",
//     status: "Active",
//     totalCapacity: 12000,
//     usedCapacity: 10260,
//     totalItems: 4820,
//     totalLocations: 86,
//     activeSkus: 612,
//     incomingTransfers: 3,
//     lastUpdated: "2026-07-13",
//     zoneData: [
//       {
//         zone: "Zone A — Fast Moving",
//         used: 1840,
//         total: 2000,
//         category: "Finished Goods",
//       },
//       {
//         zone: "Zone B — Bulk Storage",
//         used: 3620,
//         total: 4200,
//         category: "Raw Materials",
//       },
//       {
//         zone: "Zone C — Cold Chain",
//         used: 980,
//         total: 1200,
//         category: "Perishables",
//       },
//       { zone: "Zone D — Returns", used: 410, total: 900, category: "Returns" },
//     ],
//   },
//   {
//     id: "wh-2",
//     code: "WH-KDY-02",
//     name: "Kandy Regional Hub",
//     city: "Kandy",
//     address: "22 Katugastota Rd, Kandy",
//     manager: "Ruwan Silva",
//     phone: "+94 71 908 2210",
//     email: "ruwan.s@company.lk",
//     status: "Active",
//     totalCapacity: 8000,
//     usedCapacity: 4980,
//     totalItems: 2310,
//     totalLocations: 54,
//     activeSkus: 341,
//     incomingTransfers: 1,
//     lastUpdated: "2026-07-12",
//     zoneData: [
//       {
//         zone: "Zone A — Fast Moving",
//         used: 1200,
//         total: 2000,
//         category: "Finished Goods",
//       },
//       {
//         zone: "Zone B — Bulk Storage",
//         used: 2600,
//         total: 3600,
//         category: "Raw Materials",
//       },
//       {
//         zone: "Zone C — Packaging",
//         used: 1180,
//         total: 2400,
//         category: "Packaging",
//       },
//     ],
//   },
//   {
//     id: "wh-3",
//     code: "WH-GLE-03",
//     name: "Galle Coastal Depot",
//     city: "Galle",
//     address: "8 Matara Rd, Galle",
//     manager: "Ishara Fernando",
//     phone: "+94 76 445 9981",
//     email: "ishara.f@company.lk",
//     status: "Maintenance",
//     totalCapacity: 5000,
//     usedCapacity: 4550,
//     totalItems: 1870,
//     totalLocations: 38,
//     activeSkus: 205,
//     incomingTransfers: 0,
//     lastUpdated: "2026-07-10",
//     zoneData: [
//       {
//         zone: "Zone A — Fast Moving",
//         used: 1450,
//         total: 1500,
//         category: "Finished Goods",
//       },
//       {
//         zone: "Zone B — Bulk Storage",
//         used: 3100,
//         total: 3500,
//         category: "Raw Materials",
//       },
//     ],
//   },
//   {
//     id: "wh-4",
//     code: "WH-JAF-04",
//     name: "Jaffna North Store",
//     city: "Jaffna",
//     address: "3 Hospital Rd, Jaffna",
//     manager: "Thiviya Kumar",
//     phone: "+94 75 330 7712",
//     email: "thiviya.k@company.lk",
//     status: "Active",
//     totalCapacity: 4000,
//     usedCapacity: 1120,
//     totalItems: 640,
//     totalLocations: 22,
//     activeSkus: 118,
//     incomingTransfers: 2,
//     lastUpdated: "2026-07-09",
//     zoneData: [
//       {
//         zone: "Zone A — Fast Moving",
//         used: 520,
//         total: 1200,
//         category: "Finished Goods",
//       },
//       {
//         zone: "Zone B — Bulk Storage",
//         used: 600,
//         total: 2800,
//         category: "Raw Materials",
//       },
//     ],
//   },
//   {
//     id: "wh-5",
//     code: "WH-NEG-05",
//     name: "Negombo Export Yard",
//     city: "Negombo",
//     address: "56 Airport Rd, Negombo",
//     manager: "Dilan Jayasuriya",
//     phone: "+94 70 118 6623",
//     email: "dilan.j@company.lk",
//     status: "Inactive",
//     totalCapacity: 6000,
//     usedCapacity: 340,
//     totalItems: 95,
//     totalLocations: 18,
//     activeSkus: 40,
//     incomingTransfers: 0,
//     lastUpdated: "2026-06-28",
//     zoneData: [
//       {
//         zone: "Zone A — Bulk Storage",
//         used: 340,
//         total: 6000,
//         category: "Raw Materials",
//       },
//     ],
//   },
// ];

const INVENTORY_BY_WAREHOUSE = {
  "wh-1": [
    {
      sku: "FG-1042",
      name: "Ceylon Tea 500g Pack",
      category: "Finished Goods",
      qty: 1840,
      location: "A-03-12",
    },
    {
      sku: "RM-2231",
      name: "Kraft Packaging Roll",
      category: "Raw Materials",
      qty: 960,
      location: "B-11-04",
    },
    {
      sku: "PR-0087",
      name: "Coconut Milk 400ml",
      category: "Perishables",
      qty: 512,
      location: "C-02-08",
    },
    {
      sku: "RT-0015",
      name: "Customer Return Batch #15",
      category: "Returns",
      qty: 74,
      location: "D-01-02",
    },
  ],
  "wh-2": [
    {
      sku: "FG-2210",
      name: "Spice Mix 200g",
      category: "Finished Goods",
      qty: 780,
      location: "A-05-01",
    },
    {
      sku: "PK-1187",
      name: "Corrugated Boxes M",
      category: "Packaging",
      qty: 1330,
      location: "C-04-10",
    },
  ],
  "wh-3": [
    {
      sku: "RM-3305",
      name: "Steel Coil 2mm",
      category: "Raw Materials",
      qty: 640,
      location: "B-02-03",
    },
  ],
  "wh-4": [
    {
      sku: "FG-4410",
      name: "Bottled Water 1L",
      category: "Finished Goods",
      qty: 420,
      location: "A-01-06",
    },
  ],
  "wh-5": [
    {
      sku: "RM-5502",
      name: "Export Pallet Wrap",
      category: "Raw Materials",
      qty: 95,
      location: "A-01-01",
    },
  ],
};

const ACTIVITY_LOG_BY_WAREHOUSE = {
  "wh-1": [
    {
      ts: "2026-07-13 09:12",
      user: "Nadeesha Perera",
      action: "Approved transfer TRF-1042 to Kandy Regional Hub",
    },
    {
      ts: "2026-07-12 16:40",
      user: "System",
      action: "Cycle count completed for Zone B — 3 discrepancies flagged",
    },
    {
      ts: "2026-07-11 11:05",
      user: "Kasun W.",
      action: "Received inbound shipment PO-8834 (1,200 units)",
    },
  ],
  "wh-2": [
    {
      ts: "2026-07-12 14:02",
      user: "Ruwan Silva",
      action: "Updated manager contact details",
    },
  ],
  "wh-3": [
    {
      ts: "2026-07-10 08:30",
      user: "System",
      action: "Warehouse status set to Maintenance",
    },
  ],
  "wh-4": [
    {
      ts: "2026-07-09 10:15",
      user: "Thiviya Kumar",
      action: "Added new storage location J-02-05",
    },
  ],
  "wh-5": [
    {
      ts: "2026-06-28 17:00",
      user: "System",
      action: "Warehouse marked Inactive — pending closure review",
    },
  ],
};

const STORAGE_LOCATIONS = [
  {
    id: "loc-1",
    code: "A-03-12",
    warehouseId: "wh-1",
    zone: "Zone A",
    rack: "03",
    shelf: "12",
    bin: "B1",
    capacity: 200,
    used: 184,
    status: "Active",
  },
  {
    id: "loc-2",
    code: "B-11-04",
    warehouseId: "wh-1",
    zone: "Zone B",
    rack: "11",
    shelf: "04",
    bin: "B2",
    capacity: 500,
    used: 480,
    status: "Full",
  },
  {
    id: "loc-3",
    code: "C-02-08",
    warehouseId: "wh-1",
    zone: "Zone C",
    rack: "02",
    shelf: "08",
    bin: "B1",
    capacity: 150,
    used: 96,
    status: "Active",
  },
  {
    id: "loc-4",
    code: "D-01-02",
    warehouseId: "wh-1",
    zone: "Zone D",
    rack: "01",
    shelf: "02",
    bin: "B3",
    capacity: 100,
    used: 0,
    status: "Empty",
  },
  {
    id: "loc-5",
    code: "A-05-01",
    warehouseId: "wh-2",
    zone: "Zone A",
    rack: "05",
    shelf: "01",
    bin: "B1",
    capacity: 250,
    used: 210,
    status: "Active",
  },
  {
    id: "loc-6",
    code: "C-04-10",
    warehouseId: "wh-2",
    zone: "Zone C",
    rack: "04",
    shelf: "10",
    bin: "B2",
    capacity: 400,
    used: 388,
    status: "Full",
  },
  {
    id: "loc-7",
    code: "B-02-03",
    warehouseId: "wh-3",
    zone: "Zone B",
    rack: "02",
    shelf: "03",
    bin: "B1",
    capacity: 300,
    used: 210,
    status: "Active",
  },
  {
    id: "loc-8",
    code: "A-01-06",
    warehouseId: "wh-4",
    zone: "Zone A",
    rack: "01",
    shelf: "06",
    bin: "B1",
    capacity: 180,
    used: 42,
    status: "Active",
  },
  {
    id: "loc-9",
    code: "A-01-01",
    warehouseId: "wh-5",
    zone: "Zone A",
    rack: "01",
    shelf: "01",
    bin: "B1",
    capacity: 600,
    used: 0,
    status: "Empty",
  },
];

const TRANSFER_STAGES = [
  "Requested",
  "Approved",
  "Picked",
  "Dispatched",
  "Received",
  "Completed",
];

const TRANSFERS = [
  {
    id: "TRF-1042",
    source: "Colombo Central DC",
    destination: "Kandy Regional Hub",
    requestedBy: "Nadeesha Perera",
    date: "2026-07-13",
    status: "Approved",
    reason: "Rebalance fast-moving stock ahead of regional promotion",
    items: [
      { sku: "FG-1042", name: "Ceylon Tea 500g Pack", qty: 300 },
      { sku: "FG-2210", name: "Spice Mix 200g", qty: 120 },
    ],
    stageIndex: 1,
  },
  {
    id: "TRF-1041",
    source: "Kandy Regional Hub",
    destination: "Jaffna North Store",
    requestedBy: "Ruwan Silva",
    date: "2026-07-11",
    status: "In Transit",
    reason: "New store opening — initial stock allocation",
    items: [{ sku: "PK-1187", name: "Corrugated Boxes M", qty: 500 }],
    stageIndex: 3,
  },
  {
    id: "TRF-1039",
    source: "Colombo Central DC",
    destination: "Galle Coastal Depot",
    requestedBy: "Kasun W.",
    date: "2026-07-08",
    status: "Completed",
    reason: "Scheduled monthly replenishment",
    items: [{ sku: "RM-2231", name: "Kraft Packaging Roll", qty: 200 }],
    stageIndex: 5,
  },
  {
    id: "TRF-1036",
    source: "Negombo Export Yard",
    destination: "Colombo Central DC",
    requestedBy: "Dilan Jayasuriya",
    date: "2026-07-02",
    status: "Rejected",
    reason: "Warehouse under maintenance review",
    items: [{ sku: "RM-5502", name: "Export Pallet Wrap", qty: 80 }],
    stageIndex: 0,
  },
];

const CAPACITY_TREND = [
  { month: "Feb", used: 21400 },
  { month: "Mar", used: 22800 },
  { month: "Apr", used: 24100 },
  { month: "May", used: 25950 },
  { month: "Jun", used: 27600 },
  { month: "Jul", used: 21250 },
];

const CATEGORY_USAGE = [
  { name: "Finished Goods", value: 5810 },
  { name: "Raw Materials", value: 10160 },
  { name: "Perishables", value: 980 },
  { name: "Packaging", value: 1718 },
  { name: "Returns", value: 484 },
];

/* ------------------------------------------------------------------ */
/* Small UI primitives (mirrors PageHeader / Card / Badge / Button)   */
/* ------------------------------------------------------------------ */

function Badge({ children, status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        STATUS_STYLES[status] || "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      {children || status}
    </span>
  );
}

function Button({ children, variant = "secondary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary:
      "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
    danger: "text-rose-600 hover:bg-rose-50",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
function CardHeader({ children, className = "" }) {
  return (
    <div className={`border-b border-slate-100 px-5 py-4 ${className}`}>
      {children}
    </div>
  );
}
function CardTitle({ children }) {
  return <h3 className="text-base font-semibold text-slate-900">{children}</h3>;
}
function CardContent({ children, className = "" }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {actions}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone = "text-blue-600" }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${tone}`} />
      </CardContent>
    </Card>
  );
}

function pct(used, total) {
  if (!total) return 0;
  return Math.round((used / total) * 100);
}

function UtilizationBar({ used, total }) {
  const value = pct(used, total);
  const tone =
    value >= 90 ? "bg-rose-500" : value >= 75 ? "bg-amber-500" : "bg-blue-600";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-sm text-slate-600">{value}%</span>
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

//add warehouse modal

const EMPTY_WAREHOUSE_FORM = {
  code: "",
  name: "",
  city: "",
  address: "",
  manager: "",
  phone: "",
  email: "",
  status: "Active",
  totalCapacity: "",
};

function AddWarehouseModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY_WAREHOUSE_FORM);
  const [saveState, setSaveState] = useState("idle");

  useEffect(() => {
    if (open) {
      setForm(EMPTY_WAREHOUSE_FORM);
      setSaveState("idle");
    }
  }, [open]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveState("saving");

    try {
      const warehouse = await createWarehouse({
        ...form,
        totalCapacity: Number(form.totalCapacity),
      });

      console.log("Warehouse created:", warehouse);

      onSuccess?.();
      setForm(EMPTY_WAREHOUSE_FORM);
      setSaveState("success");
    } catch (err) {
      console.log(err);
      setSaveState("idle");
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Add Warehouse">
      <form onSubmit={handleSubmit} className="space-y-4">
        {saveState === "success" ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Warehouse saved successfully. Add another warehouse or close.
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Warehouse Code">
            <input
              name="code"
              value={form.code}
              placeholder="e.g. WH-001"
              onChange={handleChange}
              className={inputClass}
              disabled={saveState === "saving"}
            />
          </Field>
          <Field label="Warehouse Name">
            <input
              name="name"
              value={form.name}
              placeholder="Warehouse Name"
              onChange={handleChange}
              className={inputClass}
              disabled={saveState === "saving"}
            />
          </Field>
          <Field label="City">
            <input
              name="city"
              value={form.city}
              placeholder="City"
              onChange={handleChange}
              className={inputClass}
              disabled={saveState === "saving"}
            />
          </Field>
          <Field label="Capacity">
            <input
              type="number"
              name="totalCapacity"
              value={form.totalCapacity}
              placeholder="Capacity"
              onChange={handleChange}
              className={inputClass}
              disabled={saveState === "saving"}
            />
          </Field>
        </div>

        <Field label="Address">
          <input
            name="address"
            value={form.address}
            placeholder="Address"
            onChange={handleChange}
            className={inputClass}
            disabled={saveState === "saving"}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Manager">
            <input
              name="manager"
              value={form.manager}
              placeholder="Manager"
              onChange={handleChange}
              className={inputClass}
              disabled={saveState === "saving"}
            />
          </Field>
          <Field label="Phone">
            <input
              name="phone"
              value={form.phone}
              placeholder="Phone"
              onChange={handleChange}
              className={inputClass}
              disabled={saveState === "saving"}
            />
          </Field>
          <Field label="Email">
            <input
              name="email"
              value={form.email}
              placeholder="Email"
              onChange={handleChange}
              className={inputClass}
              disabled={saveState === "saving"}
            />
          </Field>
          <Field label="Status">
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={inputClass}
              disabled={saveState === "saving"}
            >
              {["Active", "Maintenance", "Inactive"].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saveState === "saving"}
          >
            Close
          </Button>
          {saveState === "success" ? (
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                setForm(EMPTY_WAREHOUSE_FORM);
                setSaveState("idle");
              }}
            >
              Add Another Warehouse
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              disabled={saveState === "saving"}
            >
              {saveState === "saving" ? "Saving..." : "Save Warehouse"}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}

//fetching the warehouse list from the backend API

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none";

function normalizeWarehouse(warehouse, fallbackIndex = 0) {
  const location = warehouse.location || {};
  const status = String(warehouse.status || "ACTIVE").toLowerCase();
  const normalizedStatus =
    status === "active"
      ? "Active"
      : status === "maintenance"
        ? "Maintenance"
        : status === "inactive"
          ? "Inactive"
          : warehouse.status || "Active";

  return {
    id:
      warehouse.id ||
      warehouse._id ||
      warehouse.warehouseId ||
      `warehouse-${fallbackIndex}`,
    code: warehouse.code || warehouse.warehouseCode || "—",
    name: warehouse.name || warehouse.warehouseName || "Unnamed Warehouse",
    city: warehouse.city || location.city || "—",
    address:
      warehouse.address ||
      location.address ||
      location.line1 ||
      location.line2 ||
      "—",
    manager:
      warehouse.manager || warehouse.managerName || warehouse.managerId || "—",
    phone:
      warehouse.phone ||
      warehouse.contactPhone ||
      warehouse.contactNumber ||
      "—",
    email: warehouse.email || warehouse.contactEmail || "—",
    status: normalizedStatus,
    totalCapacity: Number(warehouse.totalCapacity || warehouse.capacity || 0),
    usedCapacity: Number(warehouse.usedCapacity || 0),
    totalItems: Number(warehouse.totalItems || warehouse.itemsCount || 0),
    totalLocations: Number(
      warehouse.totalLocations || warehouse.locationsCount || 0,
    ),
    activeSkus: Number(warehouse.activeSkus || 0),
    incomingTransfers: Number(warehouse.incomingTransfers || 0),
    lastUpdated:
      warehouse.lastUpdated ||
      warehouse.updatedAt ||
      warehouse.createdAt ||
      "—",
    zoneData: Array.isArray(warehouse.zoneData) ? warehouse.zoneData : [],
    raw: warehouse,
  };
}

/* ------------------------------------------------------------------ */
/* 1. Warehouse List                                                  */
/* ------------------------------------------------------------------ */

function WarehouseListView({ warehouses, loading, onView, onRefresh }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [isOpen, setIsOpen] = useState(false); //this will open the add  warehouse modal

  const cities = useMemo(
    () => ["All", ...new Set(warehouses.map((w) => w.city))],
    [warehouses],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return warehouses.filter((w) => {
      const matchesSearch = [w.code, w.name, w.manager, w.city]
        .join(" ")
        .toLowerCase()
        .includes(q);
      const matchesStatus = statusFilter === "All" || w.status === statusFilter;
      const matchesCity = locationFilter === "All" || w.city === locationFilter;
      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [warehouses, search, statusFilter, locationFilter]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Warehouse Directory</CardTitle>
        <Button onClick={() => setIsOpen(true)} variant="primary">
          <Plus className="h-4 w-4" /> Add Warehouse
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-400">
            Loading warehouses...
          </div>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by warehouse, code, city, or manager"
              className={`${inputClass} pl-9`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputClass}
            >
              {["All", "Active", "Maintenance", "Inactive"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className={inputClass}
            >
              {cities.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-4">Code</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Location</th>
                <th className="py-2 pr-4">Manager</th>
                <th className="py-2 pr-4">Capacity Used</th>
                <th className="py-2 pr-4">Total Items</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Last Updated</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                filtered.map((w) => (
                  <tr
                    key={w.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-3 pr-4 font-medium text-slate-900">
                      {w.code}
                    </td>
                    <td className="py-3 pr-4 text-slate-700">{w.name}</td>
                    <td className="py-3 pr-4 text-slate-500">{w.city}</td>
                    <td className="py-3 pr-4 text-slate-500">{w.manager}</td>
                    <td className="py-3 pr-4">
                      <UtilizationBar
                        used={w.usedCapacity}
                        total={w.totalCapacity}
                      />
                    </td>
                    <td className="py-3 pr-4 text-slate-500">
                      {w.totalItems.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge status={w.status} />
                    </td>
                    <td className="py-3 pr-4 text-slate-500">
                      {w.lastUpdated}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => onView(w)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-6 text-center text-sm text-slate-400"
                  >
                    No warehouses match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
      <AddWarehouseModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => {
          onRefresh?.();
        }}
      />
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Warehouse Details                                               */
/* ------------------------------------------------------------------ */

function WarehouseDetailsView({ warehouse, storageLocations, transfers }) {
  const [tab, setTab] = useState("Overview");
  const tabs = [
    "Overview",
    "Inventory",
    "Storage Locations",
    "Transfer History",
    "Activity Log",
  ];

  const locations = storageLocations.filter(
    (l) => l.warehouseId === warehouse.id,
  );
  const inventory = INVENTORY_BY_WAREHOUSE[warehouse.id] || [];
  const activity = ACTIVITY_LOG_BY_WAREHOUSE[warehouse.id] || [];
  const relatedTransfers = transfers.filter(
    (t) => t.source === warehouse.name || t.destination === warehouse.name,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-slate-900">
                {warehouse.name}
              </h2>
              <Badge status={warehouse.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {warehouse.code} • {warehouse.address}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-slate-400" /> {warehouse.manager}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-slate-400" /> {warehouse.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-slate-400" /> {warehouse.email}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">
              <Pencil className="h-4 w-4" /> Edit Warehouse
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Inventory Count"
          value={warehouse.totalItems.toLocaleString()}
          icon={Boxes}
        />
        <StatCard
          label="Storage Locations"
          value={warehouse.totalLocations}
          icon={MapPin}
          tone="text-amber-600"
        />
        <StatCard
          label="Capacity Used"
          value={`${pct(warehouse.usedCapacity, warehouse.totalCapacity)}%`}
          icon={TrendingUp}
          tone="text-emerald-600"
        />
        <StatCard
          label="Incoming Transfers"
          value={warehouse.incomingTransfers}
          icon={ArrowLeftRight}
          tone="text-indigo-600"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-wrap gap-1 border-b-0 pb-0">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-t-lg border-b-2 px-3 py-2 text-sm font-medium transition ${
                tab === t
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </CardHeader>
        <CardContent>
          {tab === "Overview" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">
                Zone Breakdown
              </p>
              {warehouse.zoneData.map((zone) => (
                <div
                  key={zone.zone}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800">
                      {zone.zone}
                    </span>
                    <UtilizationBar used={zone.used} total={zone.total} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{zone.category}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "Inventory" && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-4">SKU</th>
                  <th className="py-2 pr-4">Item</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Qty</th>
                  <th className="py-2 pr-4">Location</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.sku} className="border-b border-slate-100">
                    <td className="py-2.5 pr-4 font-medium text-slate-900">
                      {item.sku}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-700">{item.name}</td>
                    <td className="py-2.5 pr-4 text-slate-500">
                      {item.category}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-500">
                      {item.qty.toLocaleString()}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-500">
                      {item.location}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "Storage Locations" && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-4">Location Code</th>
                  <th className="py-2 pr-4">Zone</th>
                  <th className="py-2 pr-4">Capacity</th>
                  <th className="py-2 pr-4">Used</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.id} className="border-b border-slate-100">
                    <td className="py-2.5 pr-4 font-medium text-slate-900">
                      {loc.code}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-500">{loc.zone}</td>
                    <td className="py-2.5 pr-4 text-slate-500">
                      {loc.capacity}
                    </td>
                    <td className="py-2.5 pr-4">
                      <UtilizationBar used={loc.used} total={loc.capacity} />
                    </td>
                    <td className="py-2.5 pr-4">
                      <Badge status={loc.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "Transfer History" && (
            <div className="space-y-2">
              {relatedTransfers.length === 0 && (
                <p className="text-sm text-slate-400">
                  No transfers involve this warehouse yet.
                </p>
              )}
              {relatedTransfers.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {t.id} — {t.source} → {t.destination}
                    </p>
                    <p className="text-xs text-slate-500">{t.date}</p>
                  </div>
                  <Badge status={t.status} />
                </div>
              ))}
            </div>
          )}

          {tab === "Activity Log" && (
            <div className="space-y-3">
              {activity.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <History className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-700">{a.action}</p>
                    <p className="text-xs text-slate-400">
                      {a.ts} • {a.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Storage Locations                                               */
/* ------------------------------------------------------------------ */

function StorageLocationsView({ locations, warehouses }) {
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);

  const warehouseName = (id) =>
    warehouses.find((w) => w.id === id)?.name || "—";

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return locations.filter((l) => {
      const matchesSearch = [l.code, l.zone, warehouseName(l.warehouseId)]
        .join(" ")
        .toLowerCase()
        .includes(q);
      const matchesWarehouse =
        warehouseFilter === "All" || l.warehouseId === warehouseFilter;
      const matchesStatus = statusFilter === "All" || l.status === statusFilter;
      return matchesSearch && matchesWarehouse && matchesStatus;
    });
  }, [locations, search, warehouseFilter, statusFilter]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Storage Locations</CardTitle>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Add Storage Location
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by location code or zone"
              className={`${inputClass} pl-9`}
            />
          </div>
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className={inputClass}
          >
            <option value="All">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={inputClass}
          >
            {["All", "Active", "Full", "Empty"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-4">Location Code</th>
                <th className="py-2 pr-4">Warehouse</th>
                <th className="py-2 pr-4">Zone</th>
                <th className="py-2 pr-4">Rack</th>
                <th className="py-2 pr-4">Shelf</th>
                <th className="py-2 pr-4">Bin</th>
                <th className="py-2 pr-4">Capacity</th>
                <th className="py-2 pr-4">Used Space</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-2.5 pr-4 font-medium text-slate-900">
                    {l.code}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-500">
                    {warehouseName(l.warehouseId)}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-500">{l.zone}</td>
                  <td className="py-2.5 pr-4 text-slate-500">{l.rack}</td>
                  <td className="py-2.5 pr-4 text-slate-500">{l.shelf}</td>
                  <td className="py-2.5 pr-4 text-slate-500">{l.bin}</td>
                  <td className="py-2.5 pr-4 text-slate-500">{l.capacity}</td>
                  <td className="py-2.5 pr-4">
                    <UtilizationBar used={l.used} total={l.capacity} />
                  </td>
                  <td className="py-2.5 pr-4">
                    <Badge status={l.status} />
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex justify-end gap-1">
                      <button className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Storage Location"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setModalOpen(false);
          }}
        >
          <Field label="Warehouse">
            <select className={inputClass}>
              {warehouses.map((w) => (
                <option key={w.id}>{w.name}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Zone">
              <input className={inputClass} placeholder="e.g. Zone A" />
            </Field>
            <Field label="Rack">
              <input className={inputClass} placeholder="e.g. 03" />
            </Field>
            <Field label="Shelf">
              <input className={inputClass} placeholder="e.g. 12" />
            </Field>
            <Field label="Bin">
              <input className={inputClass} placeholder="e.g. B1" />
            </Field>
          </div>
          <Field label="Capacity (units)">
            <input
              type="number"
              className={inputClass}
              placeholder="e.g. 200"
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Location
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Warehouse Capacity View                                         */
/* ------------------------------------------------------------------ */

function CapacityView({ warehouses, locations }) {
  const totalCapacity = warehouses.reduce((sum, w) => sum + w.totalCapacity, 0);
  const usedCapacity = warehouses.reduce((sum, w) => sum + w.usedCapacity, 0);
  const availableCapacity = totalCapacity - usedCapacity;
  const utilization = pct(usedCapacity, totalCapacity);

  const nearlyFull = warehouses.filter(
    (w) => pct(w.usedCapacity, w.totalCapacity) >= 85,
  );
  const unusedLocations = locations.filter((l) => l.used === 0);

  const barData = warehouses.map((w) => ({
    name: w.code,
    Capacity: w.totalCapacity,
    Used: w.usedCapacity,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Capacity"
          value={totalCapacity.toLocaleString()}
          icon={Boxes}
        />
        <StatCard
          label="Used Capacity"
          value={usedCapacity.toLocaleString()}
          icon={Package}
          tone="text-amber-600"
        />
        <StatCard
          label="Available Capacity"
          value={availableCapacity.toLocaleString()}
          icon={MapPin}
          tone="text-emerald-600"
        />
        <StatCard
          label="Utilization"
          value={`${utilization}%`}
          icon={TrendingUp}
          tone="text-blue-600"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Capacity by Warehouse</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    borderColor: "#e2e8f0",
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="Capacity" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Used" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capacity Trend (6 months)</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CAPACITY_TREND}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    borderColor: "#e2e8f0",
                    fontSize: 13,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="used"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Usage</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_USAGE}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {CATEGORY_USAGE.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    borderColor: "#e2e8f0",
                    fontSize: 13,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nearlyFull.map((w) => (
              <div
                key={w.id}
                className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-800">
                  <span className="font-medium">{w.name}</span> is at{" "}
                  {pct(w.usedCapacity, w.totalCapacity)}% capacity — plan a
                  transfer soon.
                </p>
              </div>
            ))}
            {unusedLocations.map((l) => (
              <div
                key={l.id}
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <p className="text-sm text-slate-600">
                  Storage location <span className="font-medium">{l.code}</span>{" "}
                  has been empty — consider reallocating.
                </p>
              </div>
            ))}
            {nearlyFull.length === 0 && unusedLocations.length === 0 && (
              <p className="text-sm text-slate-400">
                No capacity alerts right now.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Transfer Requests                                               */
/* ------------------------------------------------------------------ */

function TransferTimeline({ stageIndex, rejected }) {
  return (
    <div className="flex items-center">
      {TRANSFER_STAGES.map((stage, i) => {
        const done = !rejected && i <= stageIndex;
        const isLast = i === TRANSFER_STAGES.length - 1;
        return (
          <div key={stage} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              ) : (
                <Circle className="h-5 w-5 text-slate-300" />
              )}
              <span
                className={`text-center text-[11px] ${done ? "text-slate-700" : "text-slate-400"}`}
              >
                {stage}
              </span>
            </div>
            {!isLast && (
              <div
                className={`mx-1 h-0.5 flex-1 ${i < stageIndex && !rejected ? "bg-blue-600" : "bg-slate-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function TransferRequestsView({ transfers, warehouses }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return transfers.filter((t) => {
      const matchesSearch = [t.id, t.source, t.destination, t.requestedBy]
        .join(" ")
        .toLowerCase()
        .includes(q);
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transfers, search, statusFilter]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Transfer Requests</CardTitle>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> New Transfer Request
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by transfer ID, warehouse, or requester"
              className={`${inputClass} pl-9`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={inputClass}
          >
            {[
              "All",
              "Pending",
              "Approved",
              "In Transit",
              "Completed",
              "Rejected",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-4">Transfer ID</th>
                <th className="py-2 pr-4">Source</th>
                <th className="py-2 pr-4">Destination</th>
                <th className="py-2 pr-4">Requested By</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <>
                  <tr
                    key={t.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-2.5 pr-4 font-medium text-slate-900">
                      {t.id}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-500">{t.source}</td>
                    <td className="py-2.5 pr-4 text-slate-500">
                      {t.destination}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-500">
                      {t.requestedBy}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-500">{t.date}</td>
                    <td className="py-2.5 pr-4">
                      <Badge status={t.status} />
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() =>
                            setExpanded(expanded === t.id ? null : t.id)
                          }
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                          title="View progress"
                        >
                          <ChevronRight
                            className={`h-4 w-4 transition-transform ${expanded === t.id ? "rotate-90" : ""}`}
                          />
                        </button>
                        <button
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded === t.id && (
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <td colSpan={7} className="px-4 py-4">
                        <p className="mb-3 text-sm text-slate-600">
                          {t.reason}
                        </p>
                        <TransferTimeline
                          stageIndex={t.stageIndex}
                          rejected={t.status === "Rejected"}
                        />
                        <div className="mt-4 flex flex-wrap gap-2">
                          {t.items.map((item) => (
                            <span
                              key={item.sku}
                              className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 ring-1 ring-slate-200"
                            >
                              {item.name} × {item.qty}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Transfer Request"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setModalOpen(false);
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Source Warehouse">
              <select className={inputClass}>
                {warehouses.map((w) => (
                  <option key={w.id}>{w.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Destination Warehouse">
              <select className={inputClass}>
                {warehouses.map((w) => (
                  <option key={w.id}>{w.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Items & Quantities">
            <textarea
              className={inputClass}
              rows={3}
              placeholder="e.g. Ceylon Tea 500g Pack × 200"
            />
          </Field>
          <Field label="Reason">
            <textarea
              className={inputClass}
              rows={2}
              placeholder="Why is this transfer needed?"
            />
          </Field>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
            <ClipboardList className="h-4 w-4" />
            Submitting sends this for manager approval before it moves to
            Picked.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Root module — top tab navigation across the five screens           */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = [
  { key: "list", label: "Warehouse List", icon: ListIcon },
  { key: "details", label: "Warehouse Details", icon: Building2 },
  { key: "locations", label: "Storage Locations", icon: MapPin },
  { key: "capacity", label: "Capacity View", icon: BarChart3 },
  { key: "transfers", label: "Transfer Requests", icon: ArrowLeftRight },
];

export default function WarehouseManagementModule() {
  const [view, setView] = useState("list");
  const [warehouses, setWarehouses] = useState([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  const fetchWarehouses = async () => {
    try {
      setLoadingWarehouses(true);
      const response = await getWarehouses();
      const nextWarehouses = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.warehouses)
            ? response.warehouses
            : [];

      const normalizedWarehouses = nextWarehouses.map((warehouse, index) =>
        normalizeWarehouse(warehouse, index),
      );

      setWarehouses(normalizedWarehouses);
      setSelectedWarehouse(
        (current) => current || normalizedWarehouses[0] || null,
      );
    } catch (error) {
      console.error("Failed to load warehouses:", error);
      setWarehouses([]);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const summary = useMemo(() => {
    const totalCapacity = warehouses.reduce(
      (sum, w) => sum + w.totalCapacity,
      0,
    );
    const usedCapacity = warehouses.reduce((sum, w) => sum + w.usedCapacity, 0);
    const activeWarehouses = warehouses.filter(
      (w) => w.status === "Active",
    ).length;
    const totalLocations = warehouses.reduce(
      (sum, w) => sum + w.totalLocations,
      0,
    );
    return { totalCapacity, usedCapacity, activeWarehouses, totalLocations };
  }, [warehouses]);

  const handleView = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setView("details");
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-6">
      <PageHeader
        title="Warehouse Management"
        description="Monitor warehouse capacity, zones, and stock movement in one place."
        actions={
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <WarehouseIcon className="h-4 w-4" /> {warehouses.length} warehouses
            tracked
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Active Warehouses"
          value={summary.activeWarehouses}
          icon={Building2}
        />
        <StatCard
          label="Total Capacity"
          value={summary.totalCapacity.toLocaleString()}
          icon={Boxes}
          tone="text-slate-600"
        />
        <StatCard
          label="Used Capacity"
          value={summary.usedCapacity.toLocaleString()}
          icon={MapPin}
          tone="text-amber-600"
        />
        <StatCard
          label="Storage Locations"
          value={summary.totalLocations}
          icon={Users}
          tone="text-emerald-600"
        />
      </div>

      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              view === key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {view === "list" && (
        <WarehouseListView
          warehouses={warehouses}
          loading={loadingWarehouses}
          onView={handleView}
          onRefresh={fetchWarehouses}
        />
      )}
      {view === "details" && selectedWarehouse && (
        <WarehouseDetailsView
          warehouse={selectedWarehouse}
          storageLocations={STORAGE_LOCATIONS}
          transfers={TRANSFERS}
        />
      )}
      {view === "locations" && (
        <StorageLocationsView
          locations={STORAGE_LOCATIONS}
          warehouses={warehouses}
        />
      )}
      {view === "capacity" && (
        <CapacityView warehouses={warehouses} locations={STORAGE_LOCATIONS} />
      )}
      {view === "transfers" && (
        <TransferRequestsView transfers={TRANSFERS} warehouses={warehouses} />
      )}

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Activity className="h-3.5 w-3.5" /> Prototype uses mock data — wire up
        to useWarehouses / useBranches / your API layer.
      </div>
    </div>
  );
}
