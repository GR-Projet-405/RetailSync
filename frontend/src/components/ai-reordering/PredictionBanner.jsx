import { Info } from "lucide-react";

export default function PredictionBanner() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl px-6 py-5 flex items-start gap-4">

      {/* Icon */}
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
        <Info className="w-5 h-5 text-blue-600" />
      </div>

      {/* Text */}
      <div className="text-slate-700 text-base leading-8">
        <span className="font-semibold text-blue-700">
          Forecasts
        </span>{" "}
        are generated from historical sales patterns and updated daily.
        <span className="font-semibold text-slate-900">
          {" "}Solid lines
        </span>{" "}
        show actual stock levels;
        <span className="font-semibold text-slate-900">
          {" "}dashed lines
        </span>{" "}
        show the AI-projected trajectory.
      </div>

    </div>
  );
}