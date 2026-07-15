import SearchInput from "../SearchInput";

export default function FilterTabs({
  filter,
  setFilter,
  products = [],
}) {

  const tabs = [
    {
      label: "All",
      value: "ALL",
      count: products.length,
    },
    {
      label: "Critical",
      value: "CRITICAL",
      color: "bg-red-500",
      count: products.filter(
        (p) => p.urgency === "CRITICAL"
      ).length,
    },
    {
      label: "High",
      value: "HIGH",
      color: "bg-yellow-500",
      count: products.filter(
        (p) => p.urgency === "HIGH"
      ).length,
    },
    {
      label: "Low",
      value: "LOW",
      color: "bg-green-500",
      count: products.filter(
        (p) => p.urgency === "LOW"
      ).length,
    },
  ];

  return (
    <div className="flex items-center justify-between mt-6 mb-6">

      {/* Left Tabs */}
      <div className="flex items-center bg-slate-100 rounded-xl p-1">

        {tabs.map((tab) => (

          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all
              ${
                filter === tab.value
                  ? "bg-white shadow text-slate-900 font-medium"
                  : "text-slate-500 hover:text-slate-700"
              }`}
          >

            {tab.color && (
              <span
                className={`w-2 h-2 rounded-full ${tab.color}`}
              />
            )}

            {tab.label}

            <span className="text-xs text-slate-400">
              ({tab.count})
            </span>

          </button>

        ))}

      </div>

      <SearchInput
        placeholder="Search products..."
        className="w-72"
      />

    </div>
  );
}