import React from "react";
import { Sparkles } from "lucide-react";
import Button from "../Button";

export default function RecommendationBanner() {
  return (
    <div className="flex items-start justify-between rounded-2xl border border-blue-100 bg-blue-50 p-6">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
          <Sparkles className="h-6 w-6 text-blue-600" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            AI Restock Summary
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
            <span className="font-semibold text-blue-700">
              2 products
            </span>{" "}
            are projected to stock out within{" "}
            <span className="font-semibold">48 hours</span>. Approving the
            suggested quantities will cover an estimated demand for the next{" "}
            <span className="font-semibold">14 days</span>.
          </p>
        </div>
      </div>

      <Button variant="primary">
        Approve all critical
      </Button>
    </div>
  );
}