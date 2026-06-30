import React, { useState } from 'react';
import {
  Star, ArrowLeft, Phone, Mail, Globe, MapPin, CreditCard,
  FileText, Activity, CheckCircle, TrendingUp, ChevronRight,
  Edit, Building2, Clock, AlertCircle, Package
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { CONTACTS_BY_SUPPLIER, COMMUNICATION_HISTORY, RECENT_ORDERS } from './data/mockData';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Active:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Inactive: 'bg-red-50 text-red-700 border border-red-200',
    Pending:  'bg-amber-50 text-amber-700 border border-amber-200',
  };
  const dot = { Active: 'bg-emerald-500', Inactive: 'bg-red-500', Pending: 'bg-amber-500' };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold', map[status])}>
      <span className={cn('w-1.5 h-1.5 rounded-full', dot[status])} />{status}
    </span>
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

// ─── Supplier Profile Page ────────────────────────────────────────────────────
const SupplierProfile = ({ supplier, onBack, onGoToContacts, onGoToPerformance }) => {
  const contacts = CONTACTS_BY_SUPPLIER[supplier.id] ?? [];

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
              <StatusBadge status={supplier.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {supplier.id} · <span className="text-amber-500 font-semibold">★ {supplier.rating.toFixed(1)}</span> · <span className="text-slate-500">New Member</span>
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
          <button className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-xl transition-colors shadow-sm">
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
                  <p className="text-sm font-semibold text-slate-800">{supplier.contact.name}</p>
                  <p className="text-xs text-slate-500">Account Manager</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <a href={`mailto:${supplier.contact.email}`} className="text-sm text-blue-600 hover:underline">{supplier.contact.email}</a>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-sm text-slate-700">{supplier.phone}</span>
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
                  <p>{supplier.address.street}</p>
                  <p>{supplier.address.city}, {supplier.address.state} {supplier.address.zip}</p>
                  <p className="text-slate-500">{supplier.address.country}</p>
                  <p className="text-xs text-slate-400 pt-1 font-mono">Tax ID: {supplier.address.taxId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Payment Information</h3>
            <div>
              <InfoRow label="Payment Terms" value={supplier.payment.terms} />
              <InfoRow label="Currency" value={supplier.payment.currency} />
              <InfoRow label="Bank" value={supplier.payment.bank} />
              <InfoRow label="Account" value={supplier.payment.account} />
              <InfoRow label="YTD Spend" value={supplier.payment.ytdSpend} />
            </div>
          </div>

          {/* Documents */}
          {supplier.documents.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Documents</h3>
                <button className="text-xs text-blue-600 font-medium hover:underline">Upload</button>
              </div>
              <div className="space-y-2">
                {supplier.documents.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{doc.name}</p>
                      <p className="text-xs text-slate-400">{doc.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Activity</h3>
            <div className="space-y-3">
              {COMMUNICATION_HISTORY.slice(0, 4).map(a => {
                const { Icon, cls } = activityIconMap[a.type] ?? activityIconMap.system;
                return (
                  <div key={a.id} className="flex items-start gap-2.5">
                    <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0', cls)}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 leading-snug">{a.text}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{a.time} · {a.user}</p>
                    </div>
                  </div>
                );
              })}
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
              <MetricCard label="On-Time Delivery" value={`${supplier.performance.onTimeDelivery}%`} />
              <MetricCard label="Quality Score" value={`${supplier.performance.qualityScore}%`} />
              <MetricCard label="Response Time" value={`${supplier.performance.responseTime}`} suffix="hrs" />
              <MetricCard label="Defect Rate" value={`${supplier.performance.defectRate}%`} />
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
              <button className="text-xs text-blue-600 font-medium hover:underline inline-flex items-center gap-1">
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
                {RECENT_ORDERS.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-semibold text-blue-600">{o.id}</td>
                    <td className="py-3 text-slate-600">{o.date}</td>
                    <td className="py-3 text-slate-600">{o.items} items</td>
                    <td className="py-3 font-semibold text-slate-800">{o.amount}</td>
                    <td className="py-3"><OrderStatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierProfile;
