import React from 'react';
import PageHeader from '../components/PageHeader';

export default function ReportsPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Reports"
        description="Reports Module - Under Development"
      />
      <div className="mt-8 p-8 border border-dashed border-slate-800 rounded-xl bg-slate-900/20 text-center text-slate-500">
        <p className="text-sm font-medium">Reports components, filters, and records are under active development.</p>
      </div>
    </div>
  );
}
