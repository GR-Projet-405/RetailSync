import { useEffect, useState } from "react";

import Breadcrumb from "../components/Breadcrumb";
import PageHeader from "../components/PageHeader";

import ApprovalBanner from "../components/ai-reordering/ApprovalBanner";
import ApprovalQueue from "../components/ai-reordering/ApprovalQueue";
import RecommendationDetailsModal from "../components/ai-reordering/RecommendationDetailsModal";

import { getRecommendations } from "../services/aiReorderingService";

export default function AIApprovalWorkflowPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const response = await getRecommendations();

      console.log("Approval Items:", response.data.recommendations);

      setItems(response.data.recommendations);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          "Workspace",
          "AI Reordering",
          "Approval Workflow",
        ]}
      />

      <PageHeader
        title="Approval Workflow"
        description="Review AI-generated purchase recommendations before submitting purchase orders."
      />

      <ApprovalBanner />

      {loading ? (
        <div className="text-center py-10">
          Loading...
        </div>
      ) : (
        <ApprovalQueue
          items={items}
          onViewDetails={handleViewDetails}
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