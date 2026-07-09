import { useState, useEffect } from 'react';
import { User, Mail, Lock, Phone, Shield, Building2, ImageIcon, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../../components/Button';
<<<<<<< HEAD
import { useBranches } from '../../hooks/useBranches';
import { useRoles } from '../../hooks/useRoles';


=======
import api from '../../services/api'; // Safe centralized Axios instance wrapper
>>>>>>> origin/dev

const STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

// ─── Field Component ──────────────────────────────────────
const Field = ({ label, required, error, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
      {label} {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-600 font-medium">
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

// ─── Input Component ──────────────────────────────────────
const Input = ({ icon: Icon, error, className, ...props }) => (
  <div className="relative">
    {Icon && (
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Icon size={14} className="text-slate-400" />
      </div>
    )}
    <input
      className={cn(
        'w-full text-sm rounded-lg border bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150',
        Icon && 'pl-9',
        error
          ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
          : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
        className
      )}
      {...props}
    />
  </div>
);

// ─── Select Component ─────────────────────────────────────
const Select = ({ icon: Icon, error, children, className, ...props }) => (
  <div className="relative">
    {Icon && (
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
        <Icon size={14} className="text-slate-400" />
      </div>
    )}
    <select
      className={cn(
        'w-full text-sm rounded-lg border bg-white px-3 py-2.5 text-slate-900 outline-none transition-all duration-150 appearance-none cursor-pointer',
        Icon && 'pl-9',
        error
          ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
          : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
        className
      )}
      {...props}
    >
      {children}
    </select>
    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
);

// ─── Validation ───────────────────────────────────────────
const validate = (form, isEdit = false) => {
  const errors = {};

  if (!form.firstName?.trim()) errors.firstName = 'First name is required';
  if (!form.lastName?.trim()) errors.lastName = 'Last name is required';

  if (!form.username?.trim()) {
    errors.username = 'Username is required';
  } else if (!/^[a-z0-9_]+$/.test(form.username)) {
    errors.username = 'Only lowercase letters, numbers, and underscores allowed';
  } else if (form.username.length < 3) {
    errors.username = 'Must be at least 3 characters';
  }

  if (!form.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = 'Invalid email address';
  }

  if (!isEdit) {
    if (!form.password) {
      errors.password = 'Password is required';
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
  }

  if (!form.roleId) errors.roleId = 'Role is required';

  return errors;
};

// ─── UserForm ─────────────────────────────────────────────
<<<<<<< HEAD
export default function UserForm({ initialData = null, onSubmit, onCancel, isLoading = false, currentUserRole }) {
=======
export default function UserForm({ initialData = null, onSubmit, onCancel, isLoading = false, branches = [] }) {
>>>>>>> origin/dev
  const isEdit = Boolean(initialData);
  const { data: branchesData } = useBranches();
  const branches = branchesData || [];

<<<<<<< HEAD
  const { data: rolesData } = useRoles();
  const allRoles = rolesData?.data || [];

const BRANCH_MANAGER_ALLOWED_ROLES = ['CASHIER', 'INVENTORY_MANAGER'];
const roles = currentUserRole === 'BRANCH_MANAGER'
  ? allRoles.filter(r => BRANCH_MANAGER_ALLOWED_ROLES.includes(r.name))
  : allRoles;
// temporary debug - remove after fixing
console.log('currentUserRole:', currentUserRole);
console.log('allRoles:', allRoles);
console.log('roles:', roles);
=======
  // Dynamic storage state array container for database roles
  const [dbRoles, setDbRoles] = useState([]);

>>>>>>> origin/dev
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    profileImage: '',
<<<<<<< HEAD
    profileImageFile: null,
    roleId: '',    
    branchId: '',
=======
    role: '', 
    branch: '',
>>>>>>> origin/dev
    status: 'ACTIVE',
    ...initialData,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});

  // Dynamic fetch implementation looking at the live database route
  useEffect(() => {
    const fetchLiveRoles = async () => {
      try {
        const res = await api.get('/role-management/list');
        if (res.data?.success && Array.isArray(res.data.data)) {
          setDbRoles(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load live database roles:', err.message);
      }
    };
    fetchLiveRoles();
  }, []);

  // Sync initialData cleanly
  useEffect(() => {
<<<<<<< HEAD
  if (initialData) {
    setForm({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      phoneNumber: '',
      profileImage: '',
      profileImageFile: null,
      roleId: '',
      branchId: '',
      status: 'ACTIVE',
      ...initialData,
      roleId: initialData.roleId?._id || initialData.roleId || '',
      branchId: initialData.branchId?._id || initialData.branchId || '',
    });
  }
}, [initialData]);
=======
    if (initialData) {
      setForm({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        phoneNumber: '',
        profileImage: '',
        role: '',
        branch: '',
        status: 'ACTIVE',
        ...initialData,
        branch: initialData.branchId?._id || initialData.branchId || initialData.branch?._id || initialData.branch || '',
        role: initialData.roleId?._id || initialData.roleId || initialData.role || '',
      });
    }
  }, [initialData]);
>>>>>>> origin/dev

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form, isEdit);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {});
      setTouched(allTouched);
      return;
    }

<<<<<<< HEAD
    // Build payload — strip password if empty in edit mode
    const payload = new FormData();
    const formCopy = { ...form };
    if (isEdit && !formCopy.password) delete formCopy.password;
    if (!formCopy.branchId) formCopy.branchId = '';
    if (!formCopy.phoneNumber) formCopy.phoneNumber = '';

    Object.keys(formCopy).forEach(key => {
      if (key === 'profileImageFile' || key === 'profileImage') return;
      if (formCopy[key] !== null && formCopy[key] !== undefined) {
        payload.append(key, formCopy[key]);
      }
    });

    if (form.profileImageFile) {
      payload.append('profileImage', form.profileImageFile);
    } else if (form.profileImage) {
      payload.append('profileImage', form.profileImage);
    }

=======
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      username: form.username,
      email: form.email,
      status: form.status,
      roleId: form.role,               // Transmits the 24-character hex ID string cleanly
      branchId: form.branch || null,   // Transmits the 24-character hex ID string cleanly
      phoneNumber: form.phoneNumber || null,
      profileImage: form.profileImage || null,
    };

    if (isEdit && !form.password) {
      delete payload.password;
    } else if (form.password) {
      payload.password = form.password;
    }
>>>>>>> origin/dev

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ─── Section: Personal Info ─── */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <User size={11} /> Personal Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name" required error={touched.firstName && errors.firstName}>
            <Input
              icon={User}
              type="text"
              placeholder="John"
              value={form.firstName}
              onChange={set('firstName')}
              onBlur={() => setTouched((p) => ({ ...p, firstName: true }))}
              error={touched.firstName && errors.firstName}
              autoComplete="given-name"
            />
          </Field>
          <Field label="Last Name" required error={touched.lastName && errors.lastName}>
            <Input
              icon={User}
              type="text"
              placeholder="Doe"
              value={form.lastName}
              onChange={set('lastName')}
              onBlur={() => setTouched((p) => ({ ...p, lastName: true }))}
              error={touched.lastName && errors.lastName}
              autoComplete="family-name"
            />
          </Field>
        </div>
      </div>

      {/* ─── Section: Account ─── */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Mail size={11} /> Account Credentials
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Username" required error={touched.username && errors.username}>
            <Input
              icon={User}
              type="text"
              placeholder="john_doe"
              value={form.username}
              onChange={(e) => {
                setForm((p) => ({ ...p, username: e.target.value.toLowerCase() }));
                setTouched((p) => ({ ...p, username: true }));
                if (errors.username) setErrors((p) => ({ ...p, username: undefined }));
              }}
              onBlur={() => setTouched((p) => ({ ...p, username: true }))}
              error={touched.username && errors.username}
              autoComplete="username"
            />
          </Field>
          <Field label="Email Address" required error={touched.email && errors.email}>
            <Input
              icon={Mail}
              type="email"
              placeholder="john@retailsync.com"
              value={form.email}
              onChange={set('email')}
              onBlur={() => setTouched((p) => ({ ...p, email: true }))}
              error={touched.email && errors.email}
              autoComplete="email"
            />
          </Field>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label={isEdit ? 'New Password (leave blank to keep)' : 'Password'}
            required={!isEdit}
            error={touched.password && errors.password}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Lock size={14} className="text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={isEdit ? '••••••••' : 'Min. 8 characters'}
                value={form.password}
                onChange={set('password')}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                autoComplete="new-password"
                className={cn(
                  'w-full text-sm rounded-lg border bg-white pl-9 pr-10 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150',
                  touched.password && errors.password
                    ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </Field>
          <Field label="Phone Number" error={errors.phoneNumber}>
            <Input
              icon={Phone}
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phoneNumber || ''}
              onChange={set('phoneNumber')}
              autoComplete="tel"
            />
          </Field>
        </div>
      </div>

      {/* ─── Section: Role & Branch ─── */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Shield size={11} /> Role & Branch Assignment
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<<<<<<< HEAD
          {currentUserRole !== 'BRANCH_MANAGER' && (
            <Field label="Role" required error={touched.roleId && errors.roleId}>
              <Select
                icon={Shield}
                value={form.roleId}
                onChange={set('roleId')}
                error={touched.roleId && errors.roleId}
              >
                <option value="">Select role...</option>
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          {currentUserRole !== 'BRANCH_MANAGER' && (
            <Field label="Assigned Branch">
              <Select
                icon={Building2}
                value={form.branchId || ''}
                onChange={set('branchId')}
              >
                <option value="">No branch assigned</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </Select>
            </Field>
          )}
=======
          <Field label="Role" required error={touched.role && errors.role}>
            <Select
              icon={Shield}
              value={form.role}
              onChange={set('role')}
              error={touched.role && errors.role}
            >
              <option value="">Select role...</option>
              {dbRoles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name.replace('_', ' ')}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Assigned Branch">
            <Select
              icon={Building2}
              value={form.branch || ''}
              onChange={set('branch')}
            >
              <option value="">No branch assigned</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} {b.code ? `(${b.code})` : ''}
                </option>
              ))}
            </Select>
          </Field>
>>>>>>> origin/dev
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Status">
            <Select value={form.status} onChange={set('status')}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Profile Image">
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setForm((prev) => ({
                    ...prev,
                    profileImageFile: file,
                    profileImage: URL.createObjectURL(file)
                  }));
                }
              }}
              className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-150 cursor-pointer"
            />
          </Field>
        </div>
      </div>

      {/* ─── Profile Image Preview ─── */}
      {form.profileImage && (
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <img
            src={form.profileImage}
            alt="Profile preview"
            className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="text-xs text-slate-500 truncate">
            {form.profileImageFile ? form.profileImageFile.name : form.profileImage}
          </span>
        </div>
      )}

      {/* ─── Actions ─── */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading} className="min-w-[100px]">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {isEdit ? 'Saving...' : 'Creating...'}
            </span>
          ) : (
            isEdit ? 'Save Changes' : 'Create User'
          )}
        </Button>
      </div>
    </form>
  );
}