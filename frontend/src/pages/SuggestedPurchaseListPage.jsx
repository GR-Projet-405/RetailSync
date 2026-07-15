import { useEffect, useState } from "react";

import Breadcrumb from "../components/Breadcrumb";
import PageHeader from "../components/PageHeader";

import SuggestedPurchaseSummary from "../components/ai-reordering/SuggestedPurchaseSummary";
import SupplierCard from "../components/ai-reordering/SupplierCard";
import PurchaseTable from "../components/ai-reordering/PurchaseTable";
import Button from "../components/Button";

import {
  getRecommendations,
  convertToPurchaseOrder,
} from "../services/aiReorderingService";

export default function SuggestedPurchaseListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPurchaseItems();
  }, []);

  const loadPurchaseItems = async () => {
    try {
      const response = await getRecommendations();

      console.log("Purchase List:", response);

      setItems(response.data.recommendations);
    } catch (error) {
      console.error("Failed to load purchase list:", error);
    } finally {
      setLoading(false);
    }
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
      value: "--",
    },
  ];

  // Temporary supplier information
  const supplier = {
    name: items[0]?.supplierName || "Default Supplier",
    email: "-",
    total: "--",
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
        <Button className="bg-[#0F172A] hover:bg-slate-800 px-6 py-3 rounded-xl text-white">
          ✓ Generate Purchase Orders
        </Button>
      </div>
    </div>
  );
}