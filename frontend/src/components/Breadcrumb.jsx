import { Home, ChevronRight } from "lucide-react";

export default function Breadcrumb({ items = [] }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">

      <Home
        size={16}
        className="text-slate-400"
      />

      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-2"
        >
          <ChevronRight
            size={14}
            className="text-slate-400"
          />

          <span
            className={
              index === items.length - 1
                ? "font-medium text-slate-700"
                : ""
            }
          >
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}