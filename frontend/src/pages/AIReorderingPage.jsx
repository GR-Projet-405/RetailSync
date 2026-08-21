import { useState } from "react";
import Breadcrumb from "../components/Breadcrumb";
import PageHeader from "../components/PageHeader";
import RecommendationBanner from "../components/ai-reordering/RecommendationBanner";
import SummaryCards from "../components/ai-reordering/SummaryCards";
import FilterTabs from "../components/ai-reordering/FilterTabs";
import RecommendationTable from "../components/ai-reordering/RecommendationTable";

import { useAIRecommendations } from "../hooks/useAIReordering";

export default function AIReorderingPage() {
  const [filter, setFilter] = useState("ALL");

  const { data: response, isLoading: loading, error: queryError } = useAIRecommendations();
  const products = response?.data?.recommendations || [];

  const filteredProducts =
    filter === "ALL"
      ? products
      : products.filter((item) => item.urgency === filter);

  return (
    <div>
      <Breadcrumb
        items={[
          "Workspace",
          "AI Reordering",
          "Recommendations",
        ]}
      />

      <PageHeader />

      <RecommendationBanner />

      <SummaryCards products={products} />

      <FilterTabs
        filter={filter}
        setFilter={setFilter}
        products={products}
      />

      {loading ? (
        <div className="py-10 text-center text-slate-500">
          Loading recommendations...
        </div>
      ) : queryError ? (
        <div className="py-10 text-center text-red-500">
          {queryError.message || "Failed to load AI recommendations."}
        </div>
      ) : (
        <RecommendationTable products={filteredProducts} />
      )}
    </div>
  );
}