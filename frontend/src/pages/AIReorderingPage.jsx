import { useEffect, useState } from "react";

import Breadcrumb from "../components/Breadcrumb";
import PageHeader from "../components/PageHeader";
import RecommendationBanner from "../components/ai-reordering/RecommendationBanner";
import SummaryCards from "../components/ai-reordering/SummaryCards";
import FilterTabs from "../components/ai-reordering/FilterTabs";
import RecommendationTable from "../components/ai-reordering/RecommendationTable";

import { getRecommendations } from "../services/aiReorderingService";

export default function AIReorderingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getRecommendations();

      setProducts(response.data.recommendations);
    } catch (err) {
      console.error(err);
      setError("Failed to load AI recommendations.");
    } finally {
      setLoading(false);
    }
  };

  // Filter by urgency + search
  const filteredProducts = products.filter((product) => {
    const matchesFilter =
      filter === "ALL" || product.urgency === filter;

    const matchesSearch =
      product.productName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

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
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {loading ? (
        <div className="py-10 text-center text-slate-500">
          Loading recommendations...
        </div>
      ) : error ? (
        <div className="py-10 text-center text-red-500">
          {error}
        </div>
      ) : (
        <RecommendationTable products={filteredProducts} />
      )}
    </div>
  );
}