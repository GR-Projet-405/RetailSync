import ApprovalCard from "./ApprovalCard";

export default function ApprovalQueue({ items = [], onViewDetails }) {
  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="grid grid-cols-5 px-8 text-sm uppercase font-semibold tracking-wide text-slate-500">
        <div>PO Number</div>

        <div>Status</div>

        <div>AI Confidence</div>

        <div>Amount</div>

        <div className="text-right">
          Actions
        </div>
      </div>

      {items.length > 0 ? (
        items.map((item) => (
          <ApprovalCard
              key={item._id}
              item={item}
               onViewDetails={onViewDetails}
          />
        ))
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          No recommendations available.
        </div>
      )}

    </div>
  );
}