import { Info } from "lucide-react";

export default function ApprovalBanner() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl px-8 py-7 flex items-center gap-5">

      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
        <Info className="w-6 h-6 text-blue-600" />
      </div>

      <div>

        <p className="text-[18px] text-slate-700 leading-8">
          AI-generated purchase orders require approval from an Administrator
          or Branch Manager before being sent to suppliers.
        </p>

        <p className="font-semibold text-slate-900 mt-2 text-lg">
          1 orders awaiting review.
        </p>

      </div>

    </div>
  );
}