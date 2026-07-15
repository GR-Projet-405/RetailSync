import { FileText, Check, X } from "lucide-react";
import Button from "../Button";

import StatusBadge from "./StatusBadge";
import ConfidenceBar from "./ConfidenceBar";

import { updateRecommendationStatus } from "../../services/aiReorderingService";

export default function ApprovalCard({ item, onViewDetails }) {

  const handleStatusUpdate = async (status) => {
    try {
      await updateRecommendationStatus(item._id, {
        status,
      });

      alert(`Recommendation ${status.toLowerCase()} successfully.`);

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to update recommendation.");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-8 py-7 shadow-sm">

      <div className="grid grid-cols-5 items-center">

        {/* Product */}
        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <FileText className="w-6 h-6 text-slate-500" />
          </div>

          <div>
            <p className="font-bold text-lg">
              {item.productName}
            </p>

            <p className="text-sm text-slate-500">
              {item.branchName}
            </p>
          </div>

        </div>

        {/* Status */}
        <StatusBadge status={item.status} />

        {/* Confidence */}
        <ConfidenceBar
          confidence={item.confidenceScore}
          level={item.urgency}
        />

        {/* Recommended Quantity */}
        <h2 className="text-2xl font-bold">
          {item.recommendedQuantity}
        </h2>

        {/* Actions */}
        <div className="flex justify-end gap-3">

          {item.status === "PENDING" ? (
            <>
              <button
                onClick={() => handleStatusUpdate("REJECTED")}
                className="text-slate-400 hover:text-red-500"
              >
                <X size={24} />
              </button>

              <Button
                onClick={() => handleStatusUpdate("APPROVED")}
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </> 
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                console.log("View Details clicked");
                onViewDetails(item);
              }}
            >
              View Details
            </Button>
          )}

        </div>

      </div>

    </div>
  );
}