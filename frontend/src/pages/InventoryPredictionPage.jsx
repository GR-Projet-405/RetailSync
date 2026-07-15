import { useEffect, useState } from "react";

import Breadcrumb from "../components/Breadcrumb";
import PageHeader from "../components/PageHeader";

import PredictionBanner from "../components/ai-reordering/PredictionBanner";
import PredictionGrid from "../components/ai-reordering/PredictionGrid";

// Future endpoint (currently not implemented in backend)
// import { getInventoryPredictions } from "../services/aiReorderingService";

import { getRecommendations } from "../services/aiReorderingService";

export default function InventoryPredictionPage() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      /*
       * Future implementation:
       * Enable this once the backend exposes:
       * GET /api/v1/ai-reordering/predictions
       */
      // const response = await getInventoryPredictions();
      // setPredictions(response.data.predictions);

      // Current implementation:
      // Reuse recommendation data because it already contains
      // prediction-related fields (stock, demand, forecast, etc.)
      const response = await getRecommendations();

      console.log("Predictions:", response);

      setPredictions(response.data.recommendations);
    } catch (err) {
      console.error("Failed to load predictions:", err);
    } finally {
      setLoading(false);
    }
  };

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