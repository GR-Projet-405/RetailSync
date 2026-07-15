import DataTable from "../DataTable";
import Badge from "../Badge";

export default function RecommendationTable({ products }) {
  const getVariant = (status) => {
    switch (status) {
      case "Critical":
        return "danger";
      case "Medium":
        return "warning";
      case "Low":
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
      key: "product",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>{row.product}</span>

          <Badge variant={getVariant(row.status)}>
            {row.status}
          </Badge>
        </div>
      ),
    },

    {
      header: "Branch",
      key: "branch",
    },

    {
      header: "Current Stock",
      key: "stock",
    },

    {
      header: "Reorder Level",
      key: "reorder",

      render: (row) => {
          const colors = {
          Critical: "bg-red-50 text-red-600",
          Medium: "bg-yellow-50 text-yellow-600",
          Low: "bg-green-50 text-green-600",
          };

          return (
          <span
              className={`px-3 py-1 rounded-md text-sm font-semibold ${colors[row.status]}`}
          >
              {row.reorder}
          </span>
          );
        },
    },

    {
      header: "AI Suggested Qty",
      key: "suggested",
    },

    {
      header: "Confidence",
      key: "confidence",
      render: (row) => (
        <Badge variant="neutral">
          {row.confidence}
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