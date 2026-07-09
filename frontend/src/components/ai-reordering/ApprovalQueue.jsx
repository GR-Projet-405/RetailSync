import ApprovalCard from "./ApprovalCard";

export default function ApprovalQueue({

  items,

}) {

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

      {items.map((item) => (

        <ApprovalCard
          key={item.id}
          item={item}
        />

      ))}

    </div>

  );

}