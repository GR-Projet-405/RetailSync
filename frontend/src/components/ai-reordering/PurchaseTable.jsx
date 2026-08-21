import DataTable from "../DataTable";
import { Check, X, TrendingUp } from "lucide-react";
import { useUpdateAIRecommendationStatus } from "../../hooks/useAIReordering";

export default function PurchaseTable({ items }) {
  const updateStatusMutation = useUpdateAIRecommendationStatus();

  const handleStatusUpdate = (id, status) => {
    updateStatusMutation.mutate({ id, status });
  };

  const columns = [
    {
      header: "Product",
      key: "productName",
      width: "300px",

      render: (row) => (
        <div className="py-2">
          <p className="font-semibold text-slate-900 leading-6 w-[220px]">
            {row.productName}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            SKU: {row.sku}
          </p>
        </div>
      ),
    },

    {
      header: "Stock Status",
      key: "currentStock",

      render: (row) => (
        <div>
          <div className="text-[15px] font-semibold">
            <span className="text-red-600">
              {row.currentStock}
            </span>

            <span className="text-slate-400">
              {" "} / {row.reorderLevel} min
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>

            <span className="text-red-600 text-sm">
              Low Stock
            </span>
          </div>
        </div>
      ),
    },

    {
      header: "Rec. Qty",
      key: "recommendedQuantity",

      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-semibold">
            {row.recommendedQuantity}
          </div>

          <TrendingUp
            size={18}
            className="text-green-500"
          />
        </div>
      ),
    },

    {
      header: "Unit Cost",
      key: "unitCost",

      render: () => (
        <span className="font-medium">
          --
        </span>
      ),
    },

    {
      header: "Total",
      key: "total",

      render: () => (
        <span className="font-semibold text-slate-900">
          --
        </span>
      ),
    },

    {
      header: "Action",
      key: "action",

      render: (row) => (
        <div className="flex items-center gap-5">
          <button 
            onClick={() => handleStatusUpdate(row._id, "REJECTED")}
            className="text-slate-400 hover:text-red-500 transition"
          >
            <X size={20} />
          </button>

          <button 
            onClick={() => handleStatusUpdate(row._id, "APPROVED")}
            className="text-blue-600 hover:text-blue-700 transition"
          >
            <Check size={20} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
      <DataTable
        columns={columns}
        data={items}
      />
    </div>
  );
}