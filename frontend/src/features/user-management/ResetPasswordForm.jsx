import { useState } from 'react';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../../components/Button';

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

  const PasswordField = ({ field, label, showKey }) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Lock size={14} className="text-slate-400" />
        </div>
        <input
          type={show[showKey] ? 'text' : 'password'}
          placeholder="••••••••"
          value={form[field]}
          onChange={set(field)}
          className={cn(
            'w-full text-sm rounded-lg border bg-white pl-9 pr-10 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150',
            errors[field]
              ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
              : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
          )}
        />
        <button
          type="button"
          onClick={() => setShow((p) => ({ ...p, [showKey]: !p[showKey] }))}
          className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
        >
          {show[showKey] ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {errors[field] && (
        <p className="flex items-center gap-1 text-xs text-red-600 font-medium">
          <AlertCircle size={11} /> {errors[field]}
        </p>
      )}
    </div>
  );

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
        <PasswordField field="newPassword" label="New Password" showKey="new" />
        <PasswordField field="confirmPassword" label="Confirm New Password" showKey="confirm" />

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" disabled={isLoading} className="min-w-[120px]">
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </div>
      </form>
    </div>
  );
}
