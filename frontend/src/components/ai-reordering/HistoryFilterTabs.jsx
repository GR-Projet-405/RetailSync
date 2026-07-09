import { useState } from "react";
import SearchInput from "../SearchInput";

export default function HistoryFilterTabs({ tabs = [] }) {
  const [active, setActive] = useState("All");

  return (
    <div className="flex items-center justify-between mb-6">

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200">

        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActive(tab.label)}
            className={`relative pb-3 flex items-center gap-2 text-sm font-medium transition-all
              ${
                active === tab.label
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }
            `}
          >
            {tab.label}

            <span
              className={`text-xs px-2 py-0.5 rounded-full
                ${
                  active === tab.label
                    ? "bg-blue-100 text-blue-600"
                    : "bg-slate-100 text-slate-500"
                }`}
            >
              {tab.count}
            </span>

            {active === tab.label && (
              <span className="absolute left-0 -bottom-px w-full h-0.5 bg-blue-600 rounded-full"></span>
            )}
          </button>
        ))}

      </div>


    </div>
  );
}