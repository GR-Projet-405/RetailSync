import { useState } from 'react';
import { CalendarDays, MapPin, User, Info } from 'lucide-react';
import Button from '../../../components/Button';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9 ()+\-\.]{7,20}$/;

export const AddCustomerForm = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'Male',
    customerType: 'Regular',
    loyaltyProgram: true,
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};
    if (!form.firstName.trim()) nextErrors.firstName = 'Please enter the first name.';
    if (!form.lastName.trim()) nextErrors.lastName = 'Please enter the last name.';
    if (!form.email.trim()) nextErrors.email = 'Please enter the email address.';
    else if (!emailPattern.test(form.email.trim())) nextErrors.email = 'Please enter a valid email address.';
    if (!form.phone.trim()) nextErrors.phone = 'Please enter the phone number.';
    else if (!phonePattern.test(form.phone.trim())) nextErrors.phone = 'Please enter a valid phone number.';
    if (!form.address.trim()) nextErrors.address = 'Please enter the full address.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    onSubmit({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender || null,
      customerType: form.customerType,
      loyaltyProgram: form.loyaltyProgram,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Personal Information</h2>
            <p className="text-sm text-slate-500">Enter the customer’s basic contact details.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">First Name <span className="text-red-500">*</span></span>
            <input
              type="text"
              value={form.firstName}
              onChange={handleChange('firstName')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              placeholder="Enter first name"
            />
            {errors.firstName && <p className="text-xs text-red-600">{errors.firstName}</p>}
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Last Name <span className="text-red-500">*</span></span>
            <input
              type="text"
              value={form.lastName}
              onChange={handleChange('lastName')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              placeholder="Enter last name"
            />
            {errors.lastName && <p className="text-xs text-red-600">{errors.lastName}</p>}
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Email Address <span className="text-red-500">*</span></span>
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              placeholder="Enter email address"
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Phone Number <span className="text-red-500">*</span></span>
            <input
              type="tel"
              value={form.phone}
              onChange={handleChange('phone')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              placeholder="Enter phone number"
            />
            {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <MapPin size={20} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Address</h2>
            <p className="text-sm text-slate-500">Provide the customer’s full address.</p>
          </div>
        </div>

        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Full Address <span className="text-red-500">*</span></span>
          <textarea
            value={form.address}
            onChange={handleChange('address')}
            className="min-h-[130px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            placeholder="Enter full address"
          />
          {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
        </label>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <Info size={20} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Additional Details</h2>
            <p className="text-sm text-slate-500">Add extra customer profile attributes.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Date of Birth</span>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange('dateOfBirth')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Gender</span>
            <select
              value={form.gender}
              onChange={handleChange('gender')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
              <option>Prefer not to say</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Customer Type</span>
            <select
              value={form.customerType}
              onChange={handleChange('customerType')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            >
              <option>Regular</option>
              <option>VIP</option>
              <option>Wholesale</option>
            </select>
          </label>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-3 flex items-center gap-3 text-slate-700">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
              <Info size={18} />
            </span>
            <div>
              <p className="font-semibold text-slate-900">Loyalty Program</p>
              <p className="text-sm text-slate-500">Enable customer enrollment in rewards program.</p>
            </div>
          </div>
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            {['Yes', 'No'].map((option) => {
              const isActive = (option === 'Yes') === form.loyaltyProgram;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, loyaltyProgram: option === 'Yes' }))}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <Button type="submit" variant="primary" className="w-full sm:w-auto">
          Save Customer
        </Button>
      </div>
    </form>
  );
};

export default AddCustomerForm;
