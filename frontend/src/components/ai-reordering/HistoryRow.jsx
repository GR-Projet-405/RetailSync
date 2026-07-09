import StatusBadge from "./StatusBadge";

export default function HistoryRow({ item }) {
  const differenceColor =
    item.difference?.startsWith("+")
      ? "text-green-600"
      : item.difference?.startsWith("-")
      ? "text-red-600"
      : "text-slate-400";

  const confidenceColor = {
    HIGH: "text-green-700",
    MEDIUM: "text-amber-600",
    LOW: "text-red-600",
  };

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
          {item.product}
        </p>
      </div>

      {/* Branch */}
      <div>
        <p className="text-[15px] text-slate-600 leading-6 whitespace-pre-line">
          {item.branch.replace(" ", "\n")}
        </p>
      </div>

      {/* Current */}
      <div className="text-[15px] text-slate-600">
        {item.current}
      </div>

      {/* Reordered */}
      <div className="text-[15px] font-medium">

        {item.reordered ? (
          <>
            <span>{item.reordered}</span>

            {item.difference && (
              <span className={`ml-1 ${differenceColor}`}>
                ({item.difference})
              </span>
            )}
          </>
        ) : (
          <span className="text-slate-400">—</span>
        )}

      </div>

      {/* Status */}
      <div>
        <StatusBadge status={item.status} />
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-1 font-semibold">

        <span className={confidenceColor[item.level]}>
          {item.confidence}%
        </span>

        <span className={`${confidenceColor[item.level]} text-sm`}>
          {item.level}
        </span>

      </div>

    </div>
  );
}