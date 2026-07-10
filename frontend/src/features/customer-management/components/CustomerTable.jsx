import { Eye, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../components/DataTable';
import { StatusBadge } from '../../../components/StatusBadge';

export const CustomerTable = ({ customers }) => {
  const navigate = useNavigate();

  const columns = [
    {
      key: 'customer',
      header: 'CUSTOMER',
      render: (customer) => (
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
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
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{customer.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'PHONE NUMBER',
      render: (customer) => <span className="text-slate-600">{customer.phone}</span>,
    },
    {
      key: 'email',
      header: 'EMAIL',
      render: (customer) => <span className="text-slate-600">{customer.email}</span>,
    },
    {
      key: 'totalOrders',
      header: 'TOTAL ORDERS',
      render: (customer) => <span className="text-slate-600 font-semibold">{customer.totalOrders}</span>,
    },
    {
      key: 'loyaltyPoints',
      header: 'LOYALTY POINTS',
      render: (customer) => <span className="text-slate-600 font-semibold">{customer.loyaltyPoints}</span>,
    },
    {
      key: 'status',
      header: 'STATUS',
      render: (customer) => <StatusBadge status={customer.status} />,
    },
    {
      key: 'actions',
      header: 'ACTION',
      render: (customer) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/customers/${customer._id}`)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition"
            title="View Customer"
          >
            <Eye size={18} />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/customers/${customer._id}/edit`)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition"
            title="Edit Customer"
          >
            <Pencil size={18} />
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition"
            title="More Options"
          >
            <span className="text-lg leading-none">...</span>
          </button>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={customers} className="min-w-[900px]" emptyMessage="No customers found." />;
};

export default CustomerTable;
