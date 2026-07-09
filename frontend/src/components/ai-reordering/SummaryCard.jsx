import React from "react";
import Card from "../Card";

export default function SummaryCard({
  title,
  value,
  description,
  icon,
  bgColor,
  cardColor = "bg-white",
  textColor = "text-slate-900",
  descColor = "text-slate-500",
}) {
  return (
    <Card className={`p-7 h-full ${cardColor}`}>
      {/* Icon + Title */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}
        >
          {icon}
        </div>

        <h3 className={`text-lg font-semibold ${textColor}`}>
          {title}
        </h3>
      </div>

      {/* Value */}
      <h2 className={`text-5xl font-bold ${textColor}`}>
        {value}
      </h2>

      {/* Description */}
      {description && (
        <p className={`mt-3 text-[15px] ${descColor}`}>
          {description}
        </p>
      )}
    </Card>
  );
}