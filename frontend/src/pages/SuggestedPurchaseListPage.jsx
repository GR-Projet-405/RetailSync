import { useState } from "react";
import { toast } from "react-toastify";

import Breadcrumb from "../components/Breadcrumb";
import PageHeader from "../components/PageHeader";

import SuggestedPurchaseSummary from "../components/ai-reordering/SuggestedPurchaseSummary";
import SupplierCard from "../components/ai-reordering/SupplierCard";
import PurchaseTable from "../components/ai-reordering/PurchaseTable";
import Button from "../components/Button";

import { useAIRecommendations, useConvertToPurchaseOrder } from "../hooks/useAIReordering";

export default function SuggestedPurchaseListPage() {
  const { data: response, isLoading: loading } = useAIRecommendations();
  const items = response?.data?.recommendations || [];

  const convertMutation = useConvertToPurchaseOrder();

  const handleGenerateOrders = () => {
    const pendingItem = items.find(
      (item) => item.status === "PENDING" || item.status === "APPROVED"
    );

    if (!pendingItem) {
      toast.info("No pending recommendations to convert.");
      return;
    }

    convertMutation.mutate({
      id: pendingItem._id,
      payload: { supplierId: pendingItem.supplierId },
    });
  };

  // Summary cards
  const summaryCards = [
    {
      title: "Total Items to Reorder",
      value: items.length,
    },
    {
      title: "Suppliers",
      value: new Set(items.map((item) => item.supplierName || "Default")).size,
    },
    {
      title: "Estimated Total Cost",
      value: "N/A",
    },
  ];

  // Temporary supplier information
  const supplier = {
    name: items[0]?.supplierName || "Default Supplier",
    email: "-",
    total: "N/A",
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          "Workspace",
          "AI Reordering",
          "Suggested Purchase List",
        ]}
      />

      <PageHeader
        title="Suggested Purchase List"
        description="Recommendations grouped by supplier, ready for ordering"
      />

      <SuggestedPurchaseSummary cards={summaryCards} />

      <SupplierCard supplier={supplier} />

      {loading ? (
        <div className="text-center py-8 text-slate-500">
          Loading purchase list...
        </div>
      ) : (
        <PurchaseTable items={items} />
      )}

      <div className="flex justify-end mt-8">
        <Button
          onClick={handleGenerateOrders}
          disabled={loading || convertMutation.isPending}
          className="bg-[#0F172A] hover:bg-slate-800 px-6 py-3 rounded-xl text-white disabled:opacity-50"
        >
          {convertMutation.isPending ? "Generating..." : "✓ Generate Purchase Orders"}
        </Button>
      </div>
    </div>
  );
}