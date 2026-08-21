export default function ConfidenceBar({
  confidence,
  level,
}) {

  const colors = {
    CRITICAL: {
      text: "text-red-600",
      bar: "bg-red-500",
    },

    HIGH: {
      text: "text-orange-600",
      bar: "bg-orange-500",
    },

    MEDIUM: {
      text: "text-amber-600",
      bar: "bg-amber-500",
    },

    LOW: {
      text: "text-green-600",
      bar: "bg-green-500",
    },
  };

  const color = colors[level] || {
    text: "text-slate-600",
    bar: "bg-slate-400",
  };

  return (
    <div>

      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold">
          {confidence}%
        </span>

        <span className={`text-sm font-semibold ${color.text}`}>
          {level}
        </span>
      </div>

      <div className="mt-2 h-2 w-24 rounded-full bg-slate-200">

        <div
          className={`h-2 rounded-full ${color.bar}`}
          style={{
            width: `${confidence}%`,
          }}
        />

      </div>

    </div>
  );
}