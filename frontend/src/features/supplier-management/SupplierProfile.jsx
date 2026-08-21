import React, { useState } from 'react';
import {
  Star, ArrowLeft, Phone, Mail, Globe, MapPin, CreditCard,
  FileText, Activity, CheckCircle, TrendingUp, ChevronRight,
  Edit, Building2, Clock, AlertCircle, Package
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { updateSupplierStatus } from '../../services/supplierService';
import { toast } from 'react-toastify';

const EditableStatusBadge = ({ status, onChange, saving }) => {
  const map = {
    Active:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Inactive: 'bg-red-50 text-red-700 border border-red-200',
    Pending:  'bg-amber-50 text-amber-700 border border-amber-200',
  };
  const dot = { Active: 'bg-emerald-500', Inactive: 'bg-red-500', Pending: 'bg-amber-500' };

  return (
    <div className={cn('relative inline-flex items-center', saving && 'opacity-70')}>
      <select
        value={status || 'Active'}
        disabled={saving}
        onChange={(e) => { e.stopPropagation(); onChange(e.target.value); }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'appearance-none pl-6 pr-7 py-0.5 rounded-full text-xs font-semibold outline-none transition-colors border',
          saving ? 'cursor-wait' : 'cursor-pointer',
          map[status] || 'bg-slate-100 text-slate-700 border-slate-200'
        )}
      >
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
        <option value="Pending">Pending</option>
      </select>
      <span className={cn('absolute left-2.5 w-1.5 h-1.5 rounded-full pointer-events-none', dot[status] || 'bg-slate-400')} />
      <span className="absolute right-2 text-[10px] pointer-events-none opacity-50">▾</span>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-xs text-slate-500 font-medium">{label}</span>
    <span className="text-xs text-slate-800 font-semibold text-right max-w-[55%]">{value}</span>
  </div>
);

const MetricCard = ({ label, value, suffix = '' }) => (
  <div className="bg-slate-50 rounded-xl px-4 py-3 text-center">
    <p className="text-xl font-bold text-slate-900">{value}<span className="text-sm ml-0.5">{suffix}</span></p>
    <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
  </div>
);

const OrderStatusBadge = ({ status }) => {
  const map = {
    Delivered: 'bg-emerald-50 text-emerald-700',
    'In Transit': 'bg-blue-50 text-blue-700',
    Pending: 'bg-amber-50 text-amber-700',
    Cancelled: 'bg-red-50 text-red-700',
  };
  return <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', map[status] ?? 'bg-slate-100 text-slate-600')}>{status}</span>;
};

// ─── Mini Line Chart (pure SVG) ───────────────────────────────────────────────
const MiniLineChart = () => {
  const data = [72, 78, 75, 80, 79, 82, 84, 83, 85, 86, 88, 87];
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 580, h = 70;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h * 0.85 - h * 0.05;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

// ─── Activity Icon ────────────────────────────────────────────────────────────
const activityIconMap = {
  email: { Icon: Mail, cls: 'bg-blue-50 text-blue-500' },
  call: { Icon: Phone, cls: 'bg-emerald-50 text-emerald-500' },
  note: { Icon: FileText, cls: 'bg-amber-50 text-amber-500' },
  system: { Icon: CheckCircle, cls: 'bg-slate-100 text-slate-400' },
};

// ─── Supplier Profile Page ───────────────────────────────────────────────────────────────────

const SupplierProfile = ({ supplier, onBack, onGoToContacts, onGoToPerformance, onEditSupplier }) => {
  // localStatus is initialized from prop ONCE (on mount).
  // The parent uses key={supplier._id} so this component remounts
  // when navigating to a different supplier, giving a fresh initial value.
  const [localStatus, setLocalStatus] = useState(supplier?.status || 'Active');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleStatusChange = async (newStatus) => {
    if (saving || newStatus === localStatus) return;
    const prevStatus = localStatus;
    setSaving(true);
    setSaveError(null);
    setLocalStatus(newStatus); // optimistic update - UI changes immediately
    try {
      await updateSupplierStatus(supplier._id, newStatus);
    } catch (err) {
      console.error('Status update failed:', err);
      setSaveError('Failed to save');
      setLocalStatus(prevStatus); // rollback
    } finally {
      setSaving(false);
    }
  };

  // All other data comes directly from the supplier prop
  // Use contacts embedded in supplier document from the API
  const contacts = supplier?.contacts ?? [];
  const primaryContact = contacts.find(c => c.isPrimary) ?? contacts[0];
  const recentDocs = supplier?.documents ?? [];

  return (
    <div className="space-y-5 fade-up">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">{supplier.name}</h1>
              <EditableStatusBadge status={localStatus} onChange={handleStatusChange} saving={saving} />
              {saveError && <span className="text-xs text-red-500">{saveError}</span>}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {supplier.supplierId} · <span className="text-amber-500 font-semibold">★ {(supplier.rating ?? 0).toFixed(1)}</span> · <span className="text-slate-500">New Member</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onGoToPerformance}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-colors"
          >
            <TrendingUp className="w-4 h-4" /> Performance
          </button>
          <button
            onClick={onGoToContacts}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-colors"
          >
            <Phone className="w-4 h-4" /> Contacts
          </button>
          <button
            onClick={onEditSupplier}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-xl transition-colors shadow-sm"
          >
            <Edit className="w-4 h-4" /> Edit Supplier
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Contact Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Contact Information</h3>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Primary Contact</p>
                  <p className="text-sm font-semibold text-slate-800">{primaryContact?.name ?? '—'}</p>
                  <p className="text-xs text-slate-500">{primaryContact?.role ?? 'Contact'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <a href={`mailto:${primaryContact?.email}`} className="text-sm text-blue-600 hover:underline">{primaryContact?.email ?? '—'}</a>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-sm text-slate-700">{primaryContact?.phone ?? '—'}</span>
              </div>
              {supplier.website && (
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-sm text-slate-700">{supplier.website}</span>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Address Details</h3>
            <div className="space-y-1.5 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <p>{supplier.address?.street ?? '—'}</p>
                  <p>{supplier.address?.city ?? ''}{supplier.address?.city && supplier.address?.state ? ', ' : ''}{supplier.address?.state ?? ''} {supplier.address?.zip ?? ''}</p>
                  <p className="text-slate-500">{supplier.address?.country ?? '—'}</p>
                  <p className="text-xs text-slate-400 pt-1 font-mono">Tax ID: {supplier.address?.taxId ?? supplier.compliance?.taxId ?? '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Payment Information</h3>
            <div>
              <InfoRow label="Payment Terms" value={supplier.payment?.terms ?? '—'} />
              <InfoRow label="Currency" value={supplier.payment?.currency ?? '—'} />
              <InfoRow label="Bank" value={supplier.payment?.bankName ?? '—'} />
              <InfoRow label="Account Holder" value={supplier.payment?.accountHolder ?? '—'} />
              <InfoRow label="YTD Spend" value={supplier.performance?.ytdSpend != null ? `$${supplier.performance.ytdSpend.toLocaleString()}` : '—'} />
            </div>
          </div>

          {/* Documents */}
          {recentDocs.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Documents</h3>
                <button
                  onClick={() => toast.info('Document upload — Feature coming soon')}
                  className="text-xs text-blue-600 font-medium hover:underline"
                >
                  Upload
                </button>
              </div>
              <div className="space-y-2">
                {recentDocs.map((doc, i) => (
                  <div key={doc._id ?? i} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{doc.name}</p>
                      <p className="text-xs text-slate-400">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity — no dedicated backend endpoint yet; shows placeholder */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Activity</h3>
            <div className="space-y-3">
              <p className="text-xs text-slate-400 text-center py-4">No recent activity recorded.</p>
            </div>
          </div>
        </div>

        {/* Middle + Right Columns */}
        <div className="lg:col-span-2 space-y-4">
          {/* Performance Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Performance Overview</h3>
              <button
                onClick={onGoToPerformance}
                className="text-xs text-blue-600 font-medium hover:underline inline-flex items-center gap-1"
              >
                View full report <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {/* Metric Cards */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              <MetricCard label="On-Time Delivery" value={`${supplier.performance?.onTimeDelivery ?? 0}%`} />
              <MetricCard label="Quality Score" value={`${supplier.performance?.qualityScore ?? 0}%`} />
              <MetricCard label="Response Time" value={`${supplier.performance?.responseTime ?? 0}`} suffix="hrs" />
              <MetricCard label="Defect Rate" value={`${supplier.performance?.defectRate ?? 0}%`} />
            </div>
            {/* Mini chart */}
            <div className="bg-slate-50 rounded-xl p-4">
              <MiniLineChart />
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Recent Orders</h3>
              <button
                onClick={() => toast.info('View all orders — Feature coming soon')}
                className="text-xs text-blue-600 font-medium hover:underline inline-flex items-center gap-1"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Order ID', 'Date', 'Items', 'Amount', 'Status'].map(h => (
                    <th key={h} className="pb-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr>
                  <td colSpan={5} className="py-6 text-center text-xs text-slate-400">No orders linked yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierProfile;