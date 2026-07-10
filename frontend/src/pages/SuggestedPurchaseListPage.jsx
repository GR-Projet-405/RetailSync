import Breadcrumb from "../components/Breadcrumb";
import PageHeader from "../components/PageHeader";

import SuggestedPurchaseSummary from "../components/ai-reordering/SuggestedPurchaseSummary";
import SupplierCard from "../components/ai-reordering/SupplierCard";
import PurchaseTable from "../components/ai-reordering/PurchaseTable";
import Button from "../components/Button";

import {
  purchaseSummary,
  supplier,
  purchaseItems,
} from "../data/aiReorderingData";

export default function SuggestedPurchaseListPage() {
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

      <SuggestedPurchaseSummary cards={purchaseSummary} />

      <SupplierCard supplier={supplier} />

      <PurchaseTable items={purchaseItems} />

      <div className="flex justify-end mt-8">
        <Button
             className="bg-[#0F172A] hover:bg-slate-800 px-6 py-3 rounded-xl text-white">
            ✓ Generate Purchase Orders
        </Button>
</div>

    </div>
  );
}

