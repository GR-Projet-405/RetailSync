import PredictionCard from "./PredictionCard";

export default function PredictionGrid({ items }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map((item) => (
        <PredictionCard
          key={item.id}
          item={item}
        />
      ))}
    </div>
  );
}