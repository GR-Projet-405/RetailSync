import Breadcrumb from "../components/Breadcrumb";
import PageHeader from "../components/PageHeader";

import ApprovalBanner from "../components/ai-reordering/ApprovalBanner";
import ApprovalQueue from "../components/ai-reordering/ApprovalQueue";

import {
  approvalItems,
} from "../data/aiReorderingData";

export default function ApprovalWorkflowPage() {
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

      <ApprovalQueue
        items={approvalItems}
        />

    </div>
  );
}