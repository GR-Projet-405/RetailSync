import { Building2 } from "lucide-react";
import Button from "../Button";

export default function SupplierCard({ supplier }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-8 py-6">

      <div className="grid grid-cols-3 items-center">

        {/* Left */}
        <div className="flex items-center gap-4">

          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
            <Building2 className="w-7 h-7 text-blue-600" />
          </div>

          <div>
            <h3 className="text-[18px] font-bold text-slate-900">
              {supplier.name}
            </h3>

            <p className="text-slate-500 text-[15px] mt-1">
              {supplier.email}
            </p>
          </div>

        </div>

        {/* Center */}
        <div className="text-center">

          <p className="text-slate-500 text-[15px]">
            Est. Order Value
          </p>

          <h2 className="mt-1 text-[24px] font-bold text-slate-900">
            ${supplier.total}
          </h2>

        </div>

        {/* Right */}
        <div className="flex justify-end">
          <Button className="px-6 py-2">
            Approve All
          </Button>
        </div>

      </div>

    </div>
  );
}