import Breadcrumb from "../components/Breadcrumb";
import PageHeader from "../components/PageHeader";
import RecommendationBanner from "../components/ai-reordering/RecommendationBanner";
import SummaryCards  from "../components/ai-reordering/SummaryCards";
import FilterTabs from "../components/ai-reordering/FilterTabs";
import RecommendationTable from "../components/ai-reordering/RecommendationTable";
import { recommendationProducts } from "../data/aiReorderingData";

export default function AIReorderingPage() {
  return (
    <div>

      {/* Breadcrumb */}

      <Breadcrumb
        items={[
          "Workspace",
          "AI Reordering",
          "Recommendations",
        ]}
      />

     
      <PageHeader />
      <RecommendationBanner />
      <SummaryCards />
      <FilterTabs />
      <RecommendationTable
          products={recommendationProducts}
      />

    </div>
  );
}