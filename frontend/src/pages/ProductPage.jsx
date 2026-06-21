import PageHeader from '../components/PageHeader';

export default function ProductPage() {
  return (
    <div>
      <PageHeader
        title="Product Management"
        description="Product Management Module - Under Development"
      />
      <div className="mt-8 p-8 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-center text-slate-600">
        <p className="text-sm font-medium">Product Management components, filters, and records are under active development.</p>
      </div>
    </div>
  );
}
