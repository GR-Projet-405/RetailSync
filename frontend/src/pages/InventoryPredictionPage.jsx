import Breadcrumb from "../components/Breadcrumb";
import PageHeader from "../components/PageHeader";

import PredictionBanner from "../components/ai-reordering/PredictionBanner";
import PredictionGrid from "../components/ai-reordering/PredictionGrid";

import { predictionItems } from "../data/aiReorderingData";

export default function InventoryPredictionPage() {
  return (
    <div className="space-y-6">

     <Breadcrumb
        items={[
          "Workspace",
          "AI Reordering",
          "Inventory Predictions",
        ]}
      />

      <PageHeader
        title="Inventory Predictions"
        description="Demand forecasts and projected stockout timelines"
      />

      <PredictionBanner />

      <PredictionGrid
        items={predictionItems}
      />

    </div>
  );
}