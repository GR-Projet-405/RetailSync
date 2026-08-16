import SearchInput from "../SearchInput";

export default function HistoryFilterTabs({
  tabs = [],
  activeTab,
  onTabChange,
}) {
  return (
    <div className="flex items-center justify-between mb-6">

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => onTabChange(tab.label)}
            className={`relative pb-3 flex items-center gap-2 text-sm font-medium transition-all ${
              activeTab === tab.label
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}

            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.label
                  ? "bg-blue-100 text-blue-600"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {tab.count}
            </span>

            {activeTab === tab.label && (
              <span className="absolute left-0 -bottom-px w-full h-0.5 bg-blue-600 rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Search (optional) */}
      {/* <SearchInput placeholder="Search history..." /> */}

    </div>
  );
}