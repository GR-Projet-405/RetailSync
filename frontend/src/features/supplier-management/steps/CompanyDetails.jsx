import React from 'react';

const FormField = ({ label, required, children, hint }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-slate-700">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

const Input = ({ value, onChange, placeholder, type = 'text', hasError, ...rest }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`px-3.5 py-2.5 text-sm bg-white text-slate-900 rounded-xl border focus:ring-2 focus:ring-blue-500/15 outline-none transition-all placeholder:text-slate-400 ${hasError ? 'border-red-400 focus:border-red-400' : 'border-slate-300 focus:border-blue-500'}`}
    {...rest}
  />
);

const Select = ({ value, onChange, children, ...rest }) => (
  <select
    value={value}
    onChange={onChange}
    className="px-3.5 py-2.5 text-sm bg-white text-slate-900 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all appearance-none cursor-pointer"
    {...rest}
  >
    {children}
  </select>
);

const Textarea = ({ value, onChange, placeholder, rows = 4, ...rest }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className="px-3.5 py-2.5 text-sm bg-white text-slate-900 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all placeholder:text-slate-400 resize-none"
    {...rest}
  />
);

// ─── Step 1: Company Details ──────────────────────────────────────────────────
const CompanyDetails = ({ data, onChange, errors = {} }) => {
  const set = (key) => (e) => onChange({ ...data, [key]: e.target.value });

  return (
    <div className="space-y-5 fade-up">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Company Details</h2>
        <p className="text-sm text-slate-500 mt-0.5">Basic information about the supplier company</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Company Name" required>
          <Input value={data.companyName} onChange={set('companyName')} placeholder="Apex Global Trading Co." hasError={!!errors.companyName} />
          {errors.companyName && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.companyName}</p>}
        </FormField>
        <FormField label="Business Type" required>
          <div className="relative">
            <Select value={data.businessType} onChange={set('businessType')}>
              <option value="">Select type...</option>
              <option>Manufacturer</option>
              <option>Distributor</option>
              <option>Wholesaler</option>
              <option>Retailer</option>
              <option>Farmer/Co-op</option>
              <option>Service Provider</option>
            </Select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
          </div>
        </FormField>
        <FormField label="Industry Category" required>
          <div className="relative">
            <Select
              value={data.industryCategory}
              onChange={set('industryCategory')}
              style={errors.industryCategory ? { borderColor: '#f87171' } : {}}
            >
              <option value="">Select category...</option>
              <option>Raw Materials</option>
              <option>Electronics</option>
              <option>Packaging</option>
              <option>Perishables</option>
              <option>Components</option>
              <option>Chemicals</option>
              <option>Textiles</option>
              <option>Other</option>
            </Select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
          </div>
          {errors.industryCategory && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.industryCategory}</p>}
        </FormField>
        <FormField label="Registration Number">
          <Input value={data.registrationNumber} onChange={set('registrationNumber')} placeholder="REG-20241234" />
        </FormField>
        <FormField label="Country of Origin" required>
          <div className="relative">
            <Select value={data.country} onChange={set('country')}>
              <option value="">Select country...</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Canada</option>
              <option>Germany</option>
              <option>China</option>
              <option>India</option>
              <option>Japan</option>
              <option>Australia</option>
              <option>France</option>
              <option>Brazil</option>
            </Select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
          </div>
        </FormField>
        <FormField label="Year Established">
          <Input value={data.yearEstablished} onChange={set('yearEstablished')} placeholder="2008" type="number" min="1900" max="2026" />
        </FormField>
        <FormField label="Number of Employees">
          <div className="relative">
            <Select value={data.employees} onChange={set('employees')}>
              <option value="">Select range...</option>
              <option>1-10</option>
              <option>10-50</option>
              <option>50-100</option>
              <option>100-250</option>
              <option>250-500</option>
              <option>500-1000</option>
              <option>1000+</option>
            </Select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
          </div>
        </FormField>
        <FormField label="Annual Revenue Range">
          <div className="relative">
            <Select value={data.revenue} onChange={set('revenue')}>
              <option value="">Select range...</option>
              <option>Under $1M</option>
              <option>$1M – $5M</option>
              <option>$5M – $10M</option>
              <option>$10M – $50M</option>
              <option>$50M – $100M</option>
              <option>$100M+</option>
            </Select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
          </div>
        </FormField>
      </div>
      <FormField label="Company Description">
        <Textarea
          value={data.description}
          onChange={set('description')}
          placeholder="Brief description of the supplier..."
          rows={4}
        />
      </FormField>
    </div>
  );
};

export default CompanyDetails;
