import {
  User, Mail, Phone, Shield, Building2, Clock, Calendar,
  CheckCircle2, XCircle, AlertCircle, Hash, Image as ImageIcon,
} from 'lucide-react';
import Badge from '../../components/Badge';
import { ROLE_LABELS, ROLE_COLORS } from '../../config/roles';

const STATUS_CONFIG = {
  ACTIVE:    { variant: 'success', icon: CheckCircle2, label: 'Active' },
  INACTIVE:  { variant: 'neutral', icon: XCircle,      label: 'Inactive' },
  SUSPENDED: { variant: 'danger',  icon: AlertCircle,  label: 'Suspended' },
};

// ─── Info Row ─────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value, children }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={14} className="text-slate-500" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      {children || (
        <p className="text-sm font-medium text-slate-800 mt-0.5 break-words">
          {value || <span className="text-slate-400 italic">Not set</span>}
        </p>
      )}
    </div>
  </div>
);

// ─── UserDetailModal Content ──────────────────────────────
export default function UserDetailView({ user }) {
  if (!user) return null;

  const statusConfig = STATUS_CONFIG[user.status] || STATUS_CONFIG.ACTIVE;
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="space-y-5">
      {/* ─── Avatar & Name Header ─── */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl border border-blue-100">
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.firstName}
            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-md">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-slate-900">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-sm text-slate-500">@{user.username}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant={ROLE_COLORS[user.role] || 'primary'}>
              {ROLE_LABELS[user.role] || user.role}
            </Badge>
            <Badge variant={statusConfig.variant} className="flex items-center gap-1">
              <StatusIcon size={10} />
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* ─── Details Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact & Identity</p>
          <div className="bg-white rounded-xl border border-slate-100 px-4 divide-y divide-slate-100">
            <InfoRow icon={Hash} label="Employee ID" value={user.employeeId} />
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow icon={Phone} label="Phone" value={user.phoneNumber} />
          </div>
        </div>

        <div className="mt-4 md:mt-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assignment</p>
          <div className="bg-white rounded-xl border border-slate-100 px-4 divide-y divide-slate-100">
            <InfoRow icon={Shield} label="Role">
              <Badge variant={ROLE_COLORS[user.role] || 'primary'} className="mt-0.5">
                {ROLE_LABELS[user.role] || user.role}
              </Badge>
            </InfoRow>
            <InfoRow
              icon={Building2}
              label="Branch"
              value={
                user.branch
                  ? `${user.branch.name} (${user.branch.code})`
                  : 'No branch assigned'
              }
            />
          </div>
        </div>
      </div>

      {/* ─── Timestamps ─── */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Activity</p>
        <div className="bg-white rounded-xl border border-slate-100 px-4 divide-y divide-slate-100">
          <InfoRow
            icon={Clock}
            label="Last Login"
            value={user.lastLogin ? formatDate(user.lastLogin) : 'Never logged in'}
          />
          <InfoRow
            icon={Calendar}
            label="Account Created"
            value={formatDate(user.createdAt)}
          />
          <InfoRow
            icon={Calendar}
            label="Last Updated"
            value={formatDate(user.updatedAt)}
          />
        </div>
      </div>
    </div>
  );
}
