import SummaryCard from "./SummaryCard";

import {
  Package,
  Building2,
  DollarSign,
} from "lucide-react";

export default function SuggestedPurchaseSummary({ cards }) {
  const icons = [
    <Package className="w-6 h-6 text-blue-600" />,
    <Building2 className="w-6 h-6 text-blue-600" />,
    <DollarSign className="w-6 h-6 text-blue-600" />,
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <SummaryCard
          key={index}
          title={card.title}
          value={card.value}
          description=""
          icon={icons[index]}
          bgColor="bg-blue-50"
        />
      ))}
    </div>
  );
}