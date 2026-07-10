import Breadcrumb from "../components/Breadcrumb";
import PageHeader from "../components/PageHeader";

import HistoryFilterTabs from "../components/ai-reordering/HistoryFilterTabs";
import HistoryTable from "../components/ai-reordering/HistoryTable";

import { reorderHistoryItems } from "../data/aiReorderingData";

export default function ReorderHistoryPage() {
  const tabs = [
    { label: "All", count: 10 },
    { label: "Approved", count: 4 },
    { label: "Modified", count: 3 },
    { label: "Rejected", count: 3 },
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

      <HistoryFilterTabs tabs={tabs} />

      <HistoryTable items={reorderHistoryItems} />
    </div>
  );
}