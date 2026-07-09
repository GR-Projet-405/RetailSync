import { CalendarDays, Cake, Award, MapPin, Mail, Phone } from 'lucide-react';

export const CustomerProfileCard = ({ customer }) => {
  if (!customer) return null;

  const customerLabel = `${customer.customerType || 'Regular'} Customer`;
  const formattedDob = customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
  const customerSince = customer.customerSince || 'N/A';

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center text-center gap-4 pb-6 border-b border-slate-200">
        <div className="relative">
          <div className="h-28 w-28 overflow-hidden rounded-full bg-slate-100 flex items-center justify-center text-3xl font-semibold text-slate-700">
            {customer.avatarUrl ? (
              <img src={customer.avatarUrl} alt={customer.name} className="h-full w-full object-cover" />
            ) : (
              customer.name
                .split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')
            )}
          </div>
          <span className="absolute right-2 bottom-2 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">{customer.name}</h2>
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {customerLabel}
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-slate-700">
            <Mail size={18} className="text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Email</p>
              <p className="text-sm text-slate-500">{customer.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-slate-700">
            <Phone size={18} className="text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Phone Number</p>
              <p className="text-sm text-slate-500">{customer.phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-slate-700">
            <MapPin size={18} className="text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Address</p>
              <p className="text-sm text-slate-500 whitespace-pre-line">{customer.address}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 text-slate-700">
              <CalendarDays size={18} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Customer Since</p>
                <p className="text-sm text-slate-500">{customerSince}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-slate-700">
              <Cake size={18} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Date of Birth</p>
                <p className="text-sm text-slate-500">{formattedDob}</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 text-slate-700">
              <Award size={18} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Customer Type</p>
                <p className="text-sm text-slate-500">{customer.customerType}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-slate-700">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">₱</span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Loyalty Points</p>
                <p className="text-lg font-bold text-slate-900">{customer.loyaltyPoints} Points</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileCard;
