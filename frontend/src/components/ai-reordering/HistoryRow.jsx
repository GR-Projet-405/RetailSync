import StatusBadge from "./StatusBadge";

export default function HistoryRow({ item }) {
  const confidenceColor = {
    CRITICAL: "text-red-600",
    HIGH: "text-orange-500",
    MEDIUM: "text-amber-600",
    LOW: "text-green-600",
  };

  const difference =
    item.decisionNote?.match(/[+-]\d+/)?.[0] || null;

  const differenceColor =
    difference?.startsWith("+")
      ? "text-green-600"
      : difference?.startsWith("-")
      ? "text-red-600"
      : "text-slate-400";

  return (
    <div className="grid grid-cols-[50px_2fr_1.2fr_0.8fr_1fr_1fr_1fr] items-center px-6 py-5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">

      {/* Checkbox */}
      <div>
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
      </div>

      {/* Product */}
      <div>
        <p className="text-[15px] font-medium text-slate-900 leading-6 max-w-[230px]">
          {item.productName}
        </p>
      </div>

      {/* Branch */}
      <div>
        <p className="text-[15px] text-slate-600 whitespace-pre-line">
          {item.branchName}
        </p>
      </div>

      {/* Recommended Qty */}
      <div className="text-[15px] text-slate-600">
        {item.recommendedQuantity}
      </div>

      {/* Final Qty */}
      <div className="text-[15px] font-medium">
        {item.status === "REJECTED" ? (
          <span className="text-slate-400">—</span>
        ) : (
          <>
            <span>{item.recommendedQuantity}</span>

            {difference && (
              <span className={`ml-1 ${differenceColor}`}>
                ({difference})
              </span>
            )}
          </>
        )}
      </div>

      {/* Status */}
      <div>
        <StatusBadge status={item.status} />
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-1 font-semibold">
        <span className={confidenceColor[item.urgency]}>
          {item.confidenceScore}%
        </span>

        <span
          className={`${confidenceColor[item.urgency]} text-sm`}
        >
          {item.urgency}
        </span>
      </div>

    </div>
  );
}