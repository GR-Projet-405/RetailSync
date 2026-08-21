import Modal from "../Modal";
import Badge from "../Badge";

export default function RecommendationDetailsModal({
  isOpen,
  onClose,
  recommendation,
}) {
  if (!recommendation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recommendation.productName}
      size="xl"
    >
      <div className="grid grid-cols-2 gap-8">

        {/* LEFT */}

        <div className="space-y-5">

          <div className="rounded-xl border border-slate-200 p-5">
            <h4 className="text-xs uppercase font-semibold text-slate-500 mb-4">
              Product Details
            </h4>

            <div className="space-y-3 text-sm">

              <div className="flex justify-between">
                <span className="text-slate-500">Product</span>
                <span className="font-medium">
                  {recommendation.productName}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">SKU</span>
                <span>{recommendation.sku}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Category</span>
                <span>{recommendation.category}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Branch</span>
                <span>{recommendation.branchName}</span>
              </div>

            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-5">

            <h4 className="text-xs uppercase font-semibold text-slate-500 mb-4">
              Stock Information
            </h4>

            <div className="space-y-3 text-sm">

              <div className="flex justify-between">
                <span>Current Stock</span>
                <span>{recommendation.currentStock}</span>
              </div>

              <div className="flex justify-between">
                <span>Reorder Level</span>
                <span>{recommendation.reorderLevel}</span>
              </div>

              <div className="flex justify-between">
                <span>Recommended Qty</span>
                <span className="font-semibold text-blue-600">
                  {recommendation.recommendedQuantity}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Daily Sales</span>
                <span>
                  {recommendation.averageDailySales.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Projected Stockout</span>
                <span>
                  {recommendation.projectedStockoutDays} days
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="space-y-5">

          <div className="rounded-xl border border-slate-200 p-5">

            <h4 className="text-xs uppercase font-semibold text-slate-500 mb-4">
              Recommendation
            </h4>

            <div className="space-y-3">

              <div className="flex justify-between">

                <span>Status</span>

                <Badge variant="primary">
                  {recommendation.status}
                </Badge>

              </div>

              <div className="flex justify-between">
                <span>Urgency</span>

                <span className="font-semibold text-red-500">
                  {recommendation.urgency}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Confidence</span>

                <span>
                  {recommendation.confidenceScore}%
                </span>
              </div>

            </div>

          </div>

          <div className="rounded-xl border border-slate-200 p-5">

            <h4 className="text-xs uppercase font-semibold text-slate-500 mb-4">
              AI Reason
            </h4>

            <p className="leading-7 text-slate-600">
              {recommendation.reason}
            </p>

          </div>

        </div>

      </div>
    </Modal>
  );
}