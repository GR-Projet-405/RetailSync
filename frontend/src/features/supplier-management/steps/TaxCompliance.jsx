import React from 'react';
import { cn } from '../../../utils/cn';

const FormField = ({ label, required, children, hint }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-slate-700">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

const Input = ({ value, onChange, placeholder, type = 'text', ...rest }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="px-3.5 py-2.5 text-sm bg-white text-slate-900 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all placeholder:text-slate-400"
    {...rest}
  />
);

const Select = ({ value, onChange, children, ...rest }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all appearance-none cursor-pointer"
      {...rest}
    >
      {children}
    </select>
    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
  </div>
);

const CERTIFICATIONS = [
  'ISO 9001 (Quality Management)',
  'ISO 14001 (Environmental Management)',
  'ISO 45001 (Occupational Health & Safety)',
  'ISO 27001 (Information Security)',
  'SA8000 (Social Accountability)',
  'FDA Registered',
  'USDA Organic',
  'Fair Trade Certified',
];

// ─── Step 4: Tax & Compliance ─────────────────────────────────────────────────
const TaxCompliance = ({ data, onChange }) => {
  const set = (key) => (e) => onChange({ ...data, [key]: e.target.value });

  const toggleCert = (cert) => {
    const certs = data.certifications ?? [];
    const updated = certs.includes(cert)
      ? certs.filter(c => c !== cert)
      : [...certs, cert];
    onChange({ ...data, certifications: updated });
  };

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Tax & Compliance</h2>
        <p className="text-sm text-slate-500 mt-0.5">Legal, tax, and compliance documentation</p>
      </div>

      {/* Tax & Legal */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Tax & Legal Registration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Tax ID / VAT Number" required>
            <Input value={data.taxId} onChange={set('taxId')} placeholder="US-86-1234567" />
          </FormField>
          <FormField label="Business Registration Number" required>
            <Input value={data.businessReg} onChange={set('businessReg')} placeholder="BRN-20241234" />
          </FormField>
          <FormField label="Compliance Status" required>
            <Select value={data.complianceStatus} onChange={set('complianceStatus')}>
              <option value="">Select status...</option>
              <option>Fully Compliant</option>
              <option>Conditionally Compliant</option>
              <option>Under Review</option>
              <option>Non-Compliant</option>
            </Select>
          </FormField>
        </div>
      </div>

      {/* Insurance */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Insurance Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Insurance Provider">
            <Input value={data.insuranceProvider} onChange={set('insuranceProvider')} placeholder="Nationwide Insurance" />
          </FormField>
          <FormField label="Policy Number">
            <Input value={data.policyNumber} onChange={set('policyNumber')} placeholder="POL-2024-000123" />
          </FormField>
          <FormField label="Policy Expiry Date">
            <Input type="date" value={data.policyExpiry} onChange={set('policyExpiry')} />
          </FormField>
          <FormField label="Coverage Amount">
            <Input value={data.coverageAmount} onChange={set('coverageAmount')} placeholder="$2,000,000" />
          </FormField>
        </div>
      </div>

      {/* Certifications */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">
          Certifications <span className="text-slate-400 font-normal text-xs">(select all that apply)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CERTIFICATIONS.map(cert => {
            const checked = (data.certifications ?? []).includes(cert);
            return (
              <label
                key={cert}
                className={cn(
                  'flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150',
                  checked
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <div className={cn(
                  'w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-colors',
                  checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                )}>
                  {checked && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <input type="checkbox" checked={checked} onChange={() => toggleCert(cert)} className="hidden" />
                <span className={cn('text-sm font-medium', checked ? 'text-blue-700' : 'text-slate-700')}>
                  {cert}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TaxCompliance;
