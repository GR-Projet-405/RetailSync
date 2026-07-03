import PageHeader from '../components/PageHeader';

export default function HelpSupportPage() {
  return (
    <div>
      <PageHeader
        title="Help & Support"
        description="Help & Support Module - Under Development"
      />
      <div className="mt-8 p-8 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-center text-slate-600 min-h-[540px] flex items-center justify-center">
        <p className="text-sm font-medium max-w-xl">
          Help & Support components, filters, and records are under active development. Use the Knowledge Base submenu under Help & Support in the sidebar to open step-by-step help articles.
        </p>
      </div>
    </div>
  );
}
