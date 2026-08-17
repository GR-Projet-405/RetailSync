import { useState } from "react";
import Breadcrumb from "../components/Breadcrumb";
import PageHeader from "../components/PageHeader";
import ApprovalBanner from "../components/ai-reordering/ApprovalBanner";
import ApprovalQueue from "../components/ai-reordering/ApprovalQueue";
import RecommendationDetailsModal from "../components/ai-reordering/RecommendationDetailsModal";

import { useAIRecommendations } from "../hooks/useAIReordering";

export default function AIApprovalWorkflowPage() {
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: response, isLoading: loading } = useAIRecommendations();
  const items = response?.data?.recommendations || [];
  const pendingCount = items.filter((item) => item.status === "pending").length;

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

      <ApprovalBanner pendingCount={pendingCount} />

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