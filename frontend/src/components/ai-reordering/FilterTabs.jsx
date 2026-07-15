import React, { useState } from "react";
import SearchInput from "../SearchInput";

export default function FilterTabs() {
  const [active, setActive] = useState("All");

  const tabs = [
    { name: "All" },
    { name: "Critical", color: "bg-red-500" },
    { name: "Medium", color: "bg-yellow-500" },
    { name: "Low", color: "bg-green-500" },
  ];

  return (
    <div className="flex items-center justify-between mt-6 mb-6">

      {/* Left Tabs */}
      <div className="flex items-center bg-slate-100 rounded-xl p-1">

        {tabs.map((tab) => (

          <button
            key={tab.name}
            onClick={() => setActive(tab.name)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all

            ${
              active === tab.name
                ? "bg-white shadow text-slate-900 font-medium"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >

            {tab.color && (
              <span className={`w-2 h-2 rounded-full ${tab.color}`}></span>
            )}

            {tab.name}

          </button>

        ))}

      </div>

      {/* Search */}

      <SearchInput
        placeholder="Search products..."
        className="w-72"
      />

    </div>
  );
}