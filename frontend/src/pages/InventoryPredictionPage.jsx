import Breadcrumb from "../components/Breadcrumb";
import PageHeader from "../components/PageHeader";

import PredictionBanner from "../components/ai-reordering/PredictionBanner";
import PredictionGrid from "../components/ai-reordering/PredictionGrid";

import { useAIRecommendations } from "../hooks/useAIReordering";

export default function InventoryPredictionPage() {
  const { data: response, isLoading: loading } = useAIRecommendations();
  const predictions = response?.data?.recommendations || [];

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

      {loading ? (
        <div className="text-center py-8 text-slate-500">
          Loading predictions...
        </div>
      ) : (
        <PredictionGrid items={predictions} />
      )}
    </div>
  );
}