import React from "react";
import SummaryCard from "./SummaryCard";

import {
  Package,
  AlertTriangle,
  AlertCircle,
  Info,
} from "lucide-react";

export default function SummaryCards({ products = [] }) {

  const totalFlagged = products.length;

  const critical = products.filter(
    (item) => item.urgency === "CRITICAL"
  ).length;

  const high = products.filter(
    (item) => item.urgency === "HIGH"
  ).length;

  const low = products.filter(
    (item) => item.urgency === "LOW"
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">

      {/* Total Flagged */}
      <SummaryCard
        title="Total Flagged"
        value={totalFlagged}
        description="Products below reorder level"
        icon={<Package className="text-slate-600" size={20} />}
        bgColor="bg-slate-100"
        cardColor="bg-white"
        textColor="text-slate-800"
        descColor="text-slate-500"
      />

      {/* Critical */}
      <SummaryCard
        title="Critical"
        value={critical}
        description="Immediate attention required"
        icon={<AlertTriangle className="text-red-600" size={20} />}
        bgColor="bg-red-100"
        cardColor="bg-red-50"
        textColor="text-red-600"
        descColor="text-red-600"
      />

      {/* High */}
      <SummaryCard
        title="High"
        value={high}
        description="Reorder soon"
        icon={<AlertCircle className="text-yellow-600" size={20} />}
        bgColor="bg-yellow-100"
        cardColor="bg-yellow-50"
        textColor="text-yellow-600"
        descColor="text-yellow-600"
      />

      {/* Low */}
      <SummaryCard
        title="Low"
        value={low}
        description="Monitor only"
        icon={<Info className="text-green-600" size={20} />}
        bgColor="bg-green-100"
        cardColor="bg-green-50"
        textColor="text-green-600"
        descColor="text-green-600"
      />

    </div>
  );
}