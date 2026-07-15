import { useEffect, useMemo, useState } from "react";

import Breadcrumb from "../components/Breadcrumb";
import PageHeader from "../components/PageHeader";

import HistoryFilterTabs from "../components/ai-reordering/HistoryFilterTabs";
import HistoryTable from "../components/ai-reordering/HistoryTable";
import RecommendationDetailsModal from "../components/ai-reordering/RecommendationDetailsModal";

import { getRecommendations } from "../services/aiReorderingService";

export default function ReorderHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTab, setSelectedTab] = useState("All");

  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await getRecommendations();

      console.log("History:", response);

      setHistory(response.data.recommendations);
    } catch (error) {
      console.error("Failed to load reorder history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    switch (selectedTab) {
      case "Approved":
        return history.filter((item) => item.status === "APPROVED");

      case "Modified":
        return history.filter(
          (item) => item.status === "CONVERTED_TO_PO"
        );

      case "Rejected":
        return history.filter((item) => item.status === "REJECTED");

      default:
        return history;
    }
  }, [history, selectedTab]);

  const tabs = [
    {
      label: "All",
      count: history.length,
    },
    {
      label: "Approved",
      count: history.filter(
        (item) => item.status === "APPROVED"
      ).length,
    },
    {
      label: "Modified",
      count: history.filter(
        (item) => item.status === "CONVERTED_TO_PO"
      ).length,
    },
    {
      label: "Rejected",
      count: history.filter(
        (item) => item.status === "REJECTED"
      ).length,
    },
  ];

  return (
    <div className="space-y-6">

      <Breadcrumb
        items={[
          "Workspace",
          "AI Reordering",
          "Reorder History",
        ]}
      />

      <PageHeader
        title="Reorder History"
        description="Past recommendations and their final outcomes"
      />

      <HistoryFilterTabs
        tabs={tabs}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      {loading ? (
        <div className="text-center py-8 text-slate-500">
          Loading history...
        </div>
      ) : (
        <HistoryTable
          items={filteredHistory}
          onViewDetails={(item) => {
            setSelectedRecommendation(item);
            setIsModalOpen(true);
          }}
        />
      )}

      <RecommendationDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recommendation={selectedRecommendation}
      />
    </div>
  );
}