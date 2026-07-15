import {
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

export default function PredictionChart({ level }) {
  // Sample prediction data
  const data = [
    { day: 1, actual: 100, forecast: null },
    { day: 2, actual: 92, forecast: null },
    { day: 3, actual: 82, forecast: null },
    { day: 4, actual: 70, forecast: null },
    { day: 5, actual: 62, forecast: null },
    { day: 6, actual: 50, forecast: 50 },
    { day: 7, actual: null, forecast: 40 },
    { day: 8, actual: null, forecast: 30 },
    { day: 9, actual: null, forecast: 22 },
    { day: 10, actual: null, forecast: 12 },
  ];

  const endColor =
    level === "Critical"
      ? "#dc2626"
      : level === "Warning"
      ? "#d97706"
      : "#16a34a";

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <XAxis hide />
          <YAxis hide domain={[0, 110]} />

          {/* Reorder Level */}
          <ReferenceLine
            y={45}
            stroke="#F59E0B"
            strokeWidth={2}
          />

          {/* Actual Stock */}
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#2563EB"
            strokeWidth={3}
            dot={false}
          />

          {/* AI Forecast */}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#94A3B8"
            strokeWidth={3}
            strokeDasharray="7 6"
            dot={false}
          />

          {/* Final Prediction Point */}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="transparent"
            dot={(props) => {
              const { cx, cy, index } = props;

              if (index !== data.length - 1) return null;

              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill={endColor}
                  stroke="white"
                  strokeWidth={2}
                />
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}