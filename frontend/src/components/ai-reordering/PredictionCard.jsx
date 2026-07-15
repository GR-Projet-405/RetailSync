import PredictionChart from "./PredictionChart";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function PredictionCard({ item }) {
  const getBadge = () => {
    switch (item.level) {
      case "Critical":
        return {
          bg: "bg-red-100 text-red-700",
          icon: <AlertTriangle size={16} className="text-red-600" />,
          text: `${item.days} days (Critical)`,
        };

      case "Warning":
        return {
          bg: "bg-yellow-100 text-yellow-700",
          icon: <AlertCircle size={16} className="text-yellow-600" />,
          text: `${item.days} days (Warning)`,
        };

      default:
        return {
          bg: "bg-green-100 text-green-700",
          icon: <CheckCircle size={16} className="text-green-600" />,
          text: `${item.days} days (Safe)`,
        };
    }
  };

  const badge = getBadge();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100">

        <h3 className="text-xl font-semibold text-slate-900 leading-snug">
          {item.product}
        </h3>

        <p className="mt-2 text-base text-slate-500">
          {item.branch}
        </p>

      </div>

      {/* Stats */}
      <div className="flex justify-between items-start px-6 py-5">

        {/* Current Stock */}
        <div>

          <p className="text-sm text-slate-400">
            Current Stock
          </p>

          <div className="mt-2 flex items-end gap-2">

            <span className="text-4xl font-bold text-slate-900">
              {item.current}
            </span>

            <span className="text-slate-500 mb-1">
              units
            </span>

          </div>

        </div>

        {/* Badge */}
        <div>

          <p className="text-sm text-slate-400 mb-2 text-right">
            Predicted Stockout
          </p>

          <div
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold ${badge.bg}`}
          >
            {badge.icon}
            {badge.text}
          </div>

        </div>

      </div>

      {/* Chart */}
      <div className="px-4 pb-4 h-56">
        <PredictionChart level={item.level} />
      </div>

    </div>
  );
}