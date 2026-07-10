import { useState } from 'react';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../../components/Button';

function PasswordField({ field, label, show, value, error, onChange, onToggleShow }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Lock size={14} className="text-slate-400" />
        </div>
        <input
          type={show ? 'text' : 'password'}
          placeholder="••••••••"
          value={value}
          onChange={onChange}
          className={cn(
            'w-full text-sm rounded-lg border bg-white pl-9 pr-10 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
              : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${field}-error` : undefined}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
          aria-label={show ? `Hide ${label}` : `Show ${label}`}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {error && (
        <p id={`${field}-error`} className="flex items-center gap-1 text-xs text-red-600 font-medium">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

export default function ResetPasswordForm({ user, onSubmit, onCancel, isLoading = false }) {
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState({ new: false, confirm: false });

  const validate = () => {
    const e = {};
    if (!form.newPassword) e.newPassword = 'New password is required';
    else if (form.newPassword.length < 8) e.newPassword = 'Password must be at least 8 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm the password';
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(form.newPassword, form.confirmPassword);
  };

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  return (
    <div className="space-y-5">
      {/* User info */}
      <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-slate-500">@{user?.username}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordField
          field="newPassword"
          label="New Password"
          value={form.newPassword}
          error={errors.newPassword}
          show={show.new}
          onChange={set('newPassword')}
          onToggleShow={() => setShow((p) => ({ ...p, new: !p.new }))}
        />
        <PasswordField
          field="confirmPassword"
          label="Confirm New Password"
          value={form.confirmPassword}
          error={errors.confirmPassword}
          show={show.confirm}
          onChange={set('confirmPassword')}
          onToggleShow={() => setShow((p) => ({ ...p, confirm: !p.confirm }))}
        />

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="warning" disabled={isLoading} className="min-w-[120px]">
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </div>
      </form>
    </div>
  );
}
