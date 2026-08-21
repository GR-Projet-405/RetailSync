import HistoryRow from "./HistoryRow";

export default function HistoryTable({ items = [] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

      {items.length > 0 ? (
        items.map((item) => (
          <HistoryRow
            key={item._id}
            item={item}
          />
        ))
      ) : (
        <div className="p-12 text-center text-slate-500">
          No reorder history found.
        </div>
      )}

    </div>
  );
} 