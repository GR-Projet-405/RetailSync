import React from "react";
import SummaryCard from "./SummaryCard";

import {
  Package,
  AlertTriangle,
  AlertCircle,
  Info,
} from "lucide-react";

export default function SummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">

      {/* Total Flagged */}
      <SummaryCard
        title="Total Flagged"
        value="6"
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
        value="2"
        description="Stockout within 2 days"
        icon={<AlertTriangle className="text-red-600" size={20} />}
        bgColor="bg-red-100"
        cardColor="bg-red-50"
        textColor="text-red-600"
        descColor="text-red-600"
      />

      {/* Medium */}
      <SummaryCard
        title="Medium"
        value="3"
        description="Stockout within 7 days"
        icon={<AlertCircle className="text-yellow-600" size={20} />}
        bgColor="bg-yellow-100"
        cardColor="bg-yellow-50"
        textColor="text-yellow-600"
        descColor="text-yellow-600"
      />

      {/* Low */}
      <SummaryCard
        title="Low"
        value="1"
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