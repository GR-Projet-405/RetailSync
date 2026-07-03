import { useNavigate } from 'react-router-dom';
import AddCustomerForm from '../features/customer-management/components/AddCustomerForm';
import customerService from '../features/customer-management/services/customerService';
import { toast } from '../utils/toast';

export default function AddCustomerPage() {
  const navigate = useNavigate();

  const handleSubmit = async (customerData) => {
    try {
      await customerService.createCustomer(customerData);
      toast.success('Customer created successfully.');
      navigate('/customers');
    } catch (error) {
      toast.error(error.message || 'Failed to create customer.');
    }
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
