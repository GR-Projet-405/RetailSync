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

// ─── Step 2: Contact Details ──────────────────────────────────────────────────
const ContactDetails = ({ data, onChange, errors = {} }) => {
  const set = (key) => (e) => onChange({ ...data, [key]: e.target.value });

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Contact Details</h2>
        <p className="text-sm text-slate-500 mt-0.5">Primary and secondary contact information</p>
      </div>

      {/* Primary Contact */}
      <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-blue-700 flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
          Primary Contact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Full Name" required>
            <Input value={data.primaryName} onChange={set('primaryName')} placeholder="Marcus Chen" hasError={!!errors.primaryName} />
            {errors.primaryName && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.primaryName}</p>}
          </FormField>
          <FormField label="Job Title" required>
            <Input value={data.primaryTitle} onChange={set('primaryTitle')} placeholder="Account Manager" />
          </FormField>
          <FormField label="Email Address" required>
            <Input type="email" value={data.primaryEmail} onChange={set('primaryEmail')} placeholder="m.chen@supplier.com" hasError={!!errors.primaryEmail} />
            {errors.primaryEmail && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.primaryEmail}</p>}
          </FormField>
          <FormField label="Phone Number" required>
            <Input type="tel" value={data.primaryPhone} onChange={set('primaryPhone')} placeholder="+1 (555) 234-5678" hasError={!!errors.primaryPhone} />
            {errors.primaryPhone && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.primaryPhone}</p>}
          </FormField>
        </div>
      </div>

      {/* Secondary Contact */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-slate-400" />
          Secondary Contact <span className="text-slate-400 font-normal text-xs ml-1">(optional)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Full Name">
            <Input value={data.secondaryName} onChange={set('secondaryName')} placeholder="Sarah Kim" />
          </FormField>
          <FormField label="Email Address">
            <Input type="email" value={data.secondaryEmail} onChange={set('secondaryEmail')} placeholder="s.kim@supplier.com" />
          </FormField>
          <FormField label="Phone Number">
            <Input type="tel" value={data.secondaryPhone} onChange={set('secondaryPhone')} placeholder="+1 (555) 234-5679" />
          </FormField>
        </div>
      </div>

      {/* Online Presence */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Online Presence</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Website URL">
            <Input type="url" value={data.website} onChange={set('website')} placeholder="https://www.supplier.com" />
          </FormField>
          <FormField label="LinkedIn">
            <Input type="url" value={data.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/company/..." />
          </FormField>
        </div>
      </div>

      {/* Preferred Communication */}
      <FormField label="Preferred Communication Method">
        <Select value={data.preferredComm} onChange={set('preferredComm')}>
          <option value="">Select method...</option>
          <option>Email</option>
          <option>Phone</option>
          <option>Video Call</option>
          <option>In-Person</option>
        </Select>
      </FormField>
    </div>
  );
};

export default ContactDetails;
