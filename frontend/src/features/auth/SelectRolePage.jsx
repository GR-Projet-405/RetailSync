import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, Loader2, Shield, Building2, PackageSearch, 
  Receipt, User, CheckCircle2, AlertCircle 
} from 'lucide-react';
import api from '../../services/api';
import toast from '../../utils/toast';

// Role icons mapping
const ROLE_ICONS = {
  BRANCH_MANAGER: Building2,
  INVENTORY_MANAGER: PackageSearch,
  CASHIER: Receipt,
  EMPLOYEE: User,
};

// Role colors
const ROLE_COLORS = {
  BRANCH_MANAGER: 'from-blue-500 to-blue-600',
  INVENTORY_MANAGER: 'from-amber-500 to-orange-500',
  CASHIER: 'from-green-500 to-emerald-500',
  EMPLOYEE: 'from-slate-500 to-slate-600',
};

const SelectRolePage = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get userId and email from location state
  const { userId, email } = location.state || {};

  // Redirect if no userId
  useEffect(() => {
    if (!userId || !email) {
      toast.error('Please complete registration first');
      navigate('/register', { replace: true });
    }
  }, [userId, email, navigate]);

  // Fetch available roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/auth/available-roles');
        setRoles(response.data.data);
      } catch (error) {
        toast.error('Failed to load roles');
        console.error('Error fetching roles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Handle role selection
  const handleSelectRole = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/select-role', {
        userId,
        role: selectedRole,
      });

      setIsSuccess(true);
      toast.success('Role assigned successfully!');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { email, message: 'Registration complete! Please login.' },
          replace: true 
        });
      }, 2000);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to assign role';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get permission count for display
  const getPermissionCount = (permissions) => {
    return permissions?.length || 0;
  };

  // Get key permissions for preview
  const getKeyPermissions = (permissions) => {
    if (!permissions || permissions.length === 0) return [];
    
    // Map permission codes to readable names
    const permissionMap = {
      'users.view': 'View Users',
      'products.view': 'View Products',
      'inventory.view': 'View Inventory',
      'inventory.manage': 'Manage Inventory',
      'sales.view': 'View Sales',
      'sales.manage': 'Manage Sales',
      'reports.view': 'View Reports',
    };

    return permissions
      .slice(0, 3)
      .map(p => permissionMap[p] || p.replace(/_/g, ' ').replace(/\./g, ' '));
  };

  if (!userId || !email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-500/30">
          <ShoppingCart className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          Choose Your Role
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Select the role that best describes your position
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          {/* Success State */}
          {isSuccess ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Role Assigned Successfully!
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Your account is now ready. Redirecting to login...
              </p>
              <div className="inline-flex items-center text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </div>
            </div>
          ) : (
            <>
              {/* Loading State */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                  <p className="text-sm text-slate-600">Loading available roles...</p>
                </div>
              ) : (
                <>
                  {/* Role Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {roles.map((role) => {
                      const Icon = ROLE_ICONS[role.name] || Shield;
                      const colorClass = ROLE_COLORS[role.name] || 'from-slate-500 to-slate-600';
                      const isSelected = selectedRole === role.name;
                      const keyPermissions = getKeyPermissions(role.permissions);

                      return (
                        <button
                          key={role.name}
                          type="button"
                          onClick={() => setSelectedRole(role.name)}
                          disabled={isSubmitting}
                          className={`relative p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/20'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {/* Selection Indicator */}
                          {isSelected && (
                            <div className="absolute top-3 right-3">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}

                          {/* Icon */}
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${colorClass} mb-3`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>

                          {/* Role Name */}
                          <h3 className="text-base font-semibold text-slate-900 mb-1">
                            {role.name.replace(/_/g, ' ')}
                          </h3>

                          {/* Description */}
                          <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                            {role.description || 'No description available'}
                          </p>

                          {/* Permission Preview */}
                          <div className="space-y-1">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              Key Permissions
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {keyPermissions.map((perm, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded font-medium"
                                >
                                  {perm}
                                </span>
                              ))}
                              {getPermissionCount(role.permissions) > 3 && (
                                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded font-bold">
                                  +{getPermissionCount(role.permissions) - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Info Box */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Can't decide?
                        </p>
                        <p className="text-xs text-blue-700">
                          Don't worry! You can start with the <strong>Employee</strong> role. 
                          Administrators can upgrade your role later based on your responsibilities.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleSelectRole}
                    disabled={isSubmitting || !selectedRole}
                    className="flex w-full justify-center items-center rounded-lg bg-blue-600 py-3 px-4 text-sm font-medium text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Assigning Role...
                      </>
                    ) : (
                      'Continue with Selected Role'
                    )}
                  </button>
                </>
              )}
            </>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-slate-500">
            &copy; 2026 RetailSync Inc. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectRolePage;