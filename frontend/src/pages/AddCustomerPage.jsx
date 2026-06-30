import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import AddCustomerForm from '../features/customer-management/components/AddCustomerForm';
import { mockCustomers } from '../features/customer-management/data/mockCustomers';
import { toast } from '../utils/toast';

export default function AddCustomerPage() {
  const navigate = useNavigate();

  const handleSubmit = (customerData) => {
    const newCustomer = {
      _id: `c${Date.now()}`,
      name: `${customerData.firstName} ${customerData.lastName}`,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      dateOfBirth: customerData.dateOfBirth,
      gender: customerData.gender,
      customerType: customerData.customerType,
      loyaltyProgram: customerData.loyaltyProgram,
      totalOrders: 0,
      loyaltyPoints: 0,
      status: 'Active',
      avatarUrl: null,
    };

    mockCustomers.unshift(newCustomer);
    toast.success('Customer created successfully.');
    navigate('/customers');
  };

  return (
    <div className="space-y-8 fade-up">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-slate-500">
          Home <span className="mx-2">&gt;</span> Customers <span className="mx-2">&gt;</span> <span className="font-semibold text-slate-900">Add Customer</span>
        </p>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add New Customer</h1>
        </div>
      </div>
      <AddCustomerForm
        onCancel={() => navigate('/customers')}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
