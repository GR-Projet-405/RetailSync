import React from 'react';
import { Lock } from 'lucide-react';

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

// ─── Step 3: Banking Info ─────────────────────────────────────────────────────
const BankingInfo = ({ data, onChange }) => {
  const set = (key) => (e) => onChange({ ...data, [key]: e.target.value });

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Banking Information</h2>
        <p className="text-sm text-slate-500 mt-0.5">Payment and banking details for transactions</p>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <Lock className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 font-medium">
          Banking information is stored securely and encrypted. Only authorized personnel can view full account details.
        </p>
      </div>

      {/* Bank Account Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Bank Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Bank Name" required>
            <Input value={data.bankName} onChange={set('bankName')} placeholder="Wells Fargo NA" />
          </FormField>
          <FormField label="Account Holder Name" required>
            <Input value={data.accountHolder} onChange={set('accountHolder')} placeholder="Apex Global Trading Co." />
          </FormField>
          <FormField label="Account Number" required hint="Displayed masked after saving">
            <Input type="password" value={data.accountNumber} onChange={set('accountNumber')} placeholder="••••••••••" />
          </FormField>
          <FormField label="Routing / SWIFT Number" required>
            <Input value={data.routingNumber} onChange={set('routingNumber')} placeholder="021000021 or WFBIUS6S" />
          </FormField>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Payment Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Payment Terms" required>
            <Select value={data.paymentTerms} onChange={set('paymentTerms')}>
              <option value="">Select terms...</option>
              <option>Net 15</option>
              <option>Net 30</option>
              <option>Net 45</option>
              <option>Net 60</option>
              <option>Net 90</option>
              <option>COD</option>
              <option>Prepaid</option>
            </Select>
          </FormField>
          <FormField label="Currency" required>
            <Select value={data.currency} onChange={set('currency')}>
              <option value="">Select currency...</option>
              <option>USD – US Dollar</option>
              <option>EUR – Euro</option>
              <option>GBP – British Pound</option>
              <option>CAD – Canadian Dollar</option>
              <option>AUD – Australian Dollar</option>
              <option>JPY – Japanese Yen</option>
            </Select>
          </FormField>
        </div>
      </div>

      {/* Billing Address */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Billing Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Street Address" required>
            <Input value={data.billingStreet} onChange={set('billingStreet')} placeholder="1294 Commerce Drive, Suite 400" />
          </FormField>
          <FormField label="City" required>
            <Input value={data.billingCity} onChange={set('billingCity')} placeholder="San Francisco" />
          </FormField>
          <FormField label="State / Province">
            <Input value={data.billingState} onChange={set('billingState')} placeholder="CA" />
          </FormField>
          <FormField label="ZIP / Postal Code">
            <Input value={data.billingZip} onChange={set('billingZip')} placeholder="94107" />
          </FormField>
        </div>
      </div>
    </div>
  );
};

export default BankingInfo;
