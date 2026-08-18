import DataTable from "../DataTable";
import Badge from "../Badge";

export default function RecommendationTable({ products }) {
const getVariant = (urgency) => {
  switch (urgency) {
    case "CRITICAL":
      return "danger";

    case "HIGH":
      return "warning";

    case "MEDIUM":
      return "warning";

    case "LOW":
      return "success";

    default:
      return "neutral";
  }
};

const columns = [
  {
    header: "",
    key: "checkbox",
    width: "50px",
    render: () => (
      <input
        type="checkbox"
        className="w-4 h-4 rounded border-slate-300"
      />
    ),
  },

  {
    header: "Product",
    key: "productName",
    render: (row) => (
      <div className="flex items-center gap-3">
        <span>{row.productName}</span>

        <Badge variant={getVariant(row.urgency)}>
          {row.urgency}
        </Badge>
      </div>
    ),
  },

  {
    header: "Branch",
    key: "branchName",
  },

  {
    header: "Current Stock",
    key: "currentStock",
  },

  {
    header: "Reorder Level",
    key: "reorderLevel",

    render: (row) => {
      const colors = {
        CRITICAL: "bg-red-50 text-red-600",
        HIGH: "bg-yellow-50 text-yellow-600",
        MEDIUM: "bg-yellow-50 text-yellow-600",
        LOW: "bg-green-50 text-green-600",
      };

      return (
        <span
          className={`px-3 py-1 rounded-md text-sm font-semibold ${
            colors[row.urgency]
          }`}
        >
          {row.reorderLevel}
        </span>
      );
    },
  },

  {
    header: "AI Suggested Qty",
    key: "recommendedQuantity",
  },

  {
    header: "Confidence",
    key: "confidenceScore",
    render: (row) => (
      <Badge variant="neutral">
        {row.confidenceScore}%
      </Badge>
    ),
  },
];

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">

        <DataTable
        columns={columns}
        data={products}
        />

        <div className="px-6 py-4 text-sm text-slate-500 border-t">
        Showing {products.length} of {products.length} flagged items
        </div>

    </div>
    );
}