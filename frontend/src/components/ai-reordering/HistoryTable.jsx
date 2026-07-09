import HistoryRow from "./HistoryRow";

export default function HistoryTable({ items }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

      {items.map((item) => (
        <HistoryRow
          key={item.id}
          item={item}
        />
      ))}

    </div>
  );
}