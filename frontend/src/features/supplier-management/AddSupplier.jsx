import React, { useState } from 'react';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import CompanyDetails from './steps/CompanyDetails';
import ContactDetails from './steps/ContactDetails';
import BankingInfo from './steps/BankingInfo';
import TaxCompliance from './steps/TaxCompliance';
import Documents from './steps/Documents';
import { createSupplier, updateSupplier } from '../../services/supplierService';

// ─── Step Configuration ───────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Company Details' },
  { id: 2, label: 'Contact Details' },
  { id: 3, label: 'Banking Info' },
  { id: 4, label: 'Tax & Compliance' },
  { id: 5, label: 'Documents' },
];

// ─── Initial form state ───────────────────────────────────────────────────────
const INITIAL_FORM = {
  // Step 1
  companyName: '', businessType: '', industryCategory: '', registrationNumber: '',
  country: '', yearEstablished: '', employees: '', revenue: '', description: '',
  // Step 2
  primaryName: '', primaryTitle: '', primaryEmail: '', primaryPhone: '',
  secondaryName: '', secondaryEmail: '', secondaryPhone: '',
  website: '', linkedin: '', preferredComm: '',
  // Step 3
  bankName: '', accountHolder: '', accountNumber: '', routingNumber: '',
  paymentTerms: '', currency: '',
  billingStreet: '', billingCity: '', billingState: '', billingZip: '',
  // Step 4
  taxId: '', businessReg: '', complianceStatus: '',
  insuranceProvider: '', policyNumber: '', policyExpiry: '', coverageAmount: '',
  certifications: [],
  // Step 5
  contract: null, iso: null, w9: null, insurance: null,
};

// ─── Step Progress Indicator ──────────────────────────────────────────────────
const StepIndicator = ({ steps, current }) => (
  <div className="flex items-center gap-0">
    {steps.map((step, idx) => {
      const done = current > step.id;
      const active = current === step.id;
      return (
        <React.Fragment key={step.id}>
          <div className="flex items-center gap-2 shrink-0">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 shrink-0',
              done ? 'bg-blue-600 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-100 text-slate-400'
            )}>
              {done ? <CheckCircle className="w-4 h-4" /> : step.id}
            </div>
            <span className={cn(
              'text-sm font-semibold whitespace-nowrap hidden sm:block',
              active ? 'text-blue-600' : done ? 'text-slate-600' : 'text-slate-400'
            )}>
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={cn(
              'flex-1 h-px mx-3 min-w-[24px] transition-colors duration-300',
              done ? 'bg-blue-400' : 'bg-slate-200'
            )} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Add Supplier Page ────────────────────────────────────────────────────────
const AddSupplier = ({ onCancel, onComplete, initialData = null }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      const pContact = initialData.contacts?.find(c => c.isPrimary) || initialData.contacts?.[0] || {};
      const sContact = initialData.contacts?.find(c => !c.isPrimary) || {};
      return {
        ...INITIAL_FORM,
        companyName: initialData.name || '',
        businessType: initialData.businessType || '',
        industryCategory: initialData.industryCategory || '',
        registrationNumber: initialData.registrationNumber || '',
        country: initialData.country || '',
        yearEstablished: initialData.yearEstablished || '',
        employees: initialData.employees || '',
        revenue: initialData.revenue || '',
        description: initialData.description || '',
        website: initialData.website || '',
        linkedin: initialData.linkedin || '',
        preferredComm: initialData.preferredComm || '',
        primaryName: pContact.name || '',
        primaryTitle: pContact.role || '',
        primaryEmail: pContact.email || '',
        primaryPhone: pContact.phone || '',
        secondaryName: sContact.name || '',
        secondaryEmail: sContact.email || '',
        secondaryPhone: sContact.phone || '',
        bankName: initialData.payment?.bankName || '',
        accountHolder: initialData.payment?.accountHolder || '',
        accountNumber: initialData.payment?.accountNumber || '',
        routingNumber: initialData.payment?.routingNumber || '',
        paymentTerms: initialData.payment?.terms || '',
        currency: initialData.payment?.currency || '',
        billingStreet: initialData.payment?.billingAddress?.street || '',
        billingCity: initialData.payment?.billingAddress?.city || '',
        billingState: initialData.payment?.billingAddress?.state || '',
        billingZip: initialData.payment?.billingAddress?.zip || '',
        taxId: initialData.compliance?.taxId || '',
        businessReg: initialData.compliance?.businessReg || '',
        complianceStatus: initialData.compliance?.complianceStatus || '',
        insuranceProvider: initialData.compliance?.insuranceProvider || '',
        policyNumber: initialData.compliance?.policyNumber || '',
        policyExpiry: initialData.compliance?.policyExpiry ? initialData.compliance.policyExpiry.substring(0, 10) : '',
        coverageAmount: initialData.compliance?.coverageAmount || '',
        certifications: initialData.compliance?.certifications || [],
      };
    }
    return INITIAL_FORM;
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const updateForm = (updates) => setFormData(prev => ({ ...prev, ...updates }));

  const handleNext = () => {
    if (step < STEPS.length) setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Map multi-step form data to MongoDB schema
      const payload = {
        name: formData.companyName,
        businessType: formData.businessType,
        industryCategory: formData.industryCategory,
        registrationNumber: formData.registrationNumber,
        country: formData.country,
        yearEstablished: formData.yearEstablished ? parseInt(formData.yearEstablished, 10) : undefined,
        employees: formData.employees,
        revenue: formData.revenue,
        description: formData.description,
        website: formData.website,
        linkedin: formData.linkedin,
        preferredComm: formData.preferredComm,
        // Primary contact embedded in contacts[]
        contacts: [
          {
            name: formData.primaryName,
            role: formData.primaryTitle,
            email: formData.primaryEmail,
            phone: formData.primaryPhone,
            isPrimary: true,
            tags: ['Primary'],
          },
          ...(formData.secondaryName ? [{
            name: formData.secondaryName,
            email: formData.secondaryEmail,
            phone: formData.secondaryPhone,
            isPrimary: false,
            tags: [],
          }] : []),
        ].filter(c => c.name && c.email),
        payment: {
          bankName: formData.bankName,
          accountHolder: formData.accountHolder,
          accountNumber: formData.accountNumber,
          routingNumber: formData.routingNumber,
          terms: formData.paymentTerms,
          currency: formData.currency,
          billingAddress: {
            street: formData.billingStreet,
            city: formData.billingCity,
            state: formData.billingState,
            zip: formData.billingZip,
          },
        },
        compliance: {
          taxId: formData.taxId,
          businessReg: formData.businessReg,
          complianceStatus: formData.complianceStatus,
          certifications: formData.certifications,
          insuranceProvider: formData.insuranceProvider,
          policyNumber: formData.policyNumber,
          policyExpiry: formData.policyExpiry || undefined,
          coverageAmount: formData.coverageAmount,
        },
      };
      if (initialData) {
        const res = await updateSupplier(initialData._id, payload);
        setSubmitted(true);
        if (onComplete) onComplete(res.supplier || { ...initialData, ...payload });
      } else {
        await createSupplier(payload);
        setSubmitted(true);
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to register supplier. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <CompanyDetails data={formData} onChange={updateForm} />;
      case 2: return <ContactDetails data={formData} onChange={updateForm} />;
      case 3: return <BankingInfo data={formData} onChange={updateForm} />;
      case 4: return <TaxCompliance data={formData} onChange={updateForm} />;
      case 5: return <Documents data={formData} onChange={updateForm} />;
      default: return null;
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5 fade-up">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">{initialData ? 'Supplier Updated!' : 'Supplier Registered!'}</h2>
          <p className="text-sm text-slate-500 mt-2">
            <span className="font-semibold text-slate-700">{formData.companyName || 'New Supplier'}</span> has been successfully {initialData ? 'updated' : 'added'}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!initialData && (
            <button
              onClick={() => { setSubmitted(false); setFormData(INITIAL_FORM); setStep(1); }}
              className="px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl transition-colors"
            >
              Add Another
            </button>
          )}
          <button
            onClick={() => onComplete && onComplete()}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
          >
            {initialData ? 'Back to Profile' : 'View All Suppliers'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-up">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{initialData ? 'Edit Supplier' : 'Add New Supplier'}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{initialData ? 'Update supplier information' : 'Complete all required sections to register a new supplier'}</p>
      </div>

      {/* Step Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-5">
        <StepIndicator steps={STEPS} current={step} />
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] p-6 min-h-[400px]">
        {renderStep()}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={step === 1 ? onCancel : handleBack}
          className="px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl transition-colors"
        >
          {step === 1 ? 'Cancel' : '← Back'}
        </button>
        <div className="flex flex-col items-end gap-2">
          {submitError && (
            <p className="text-xs text-red-500 font-medium">{submitError}</p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Step {step} of {STEPS.length}</span>
            {step < STEPS.length ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-xl shadow-sm transition-colors"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                    Registering...
                  </>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> {initialData ? 'Update Supplier' : 'Register Supplier'}</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSupplier;
