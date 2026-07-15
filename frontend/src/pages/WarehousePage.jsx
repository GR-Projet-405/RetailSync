import { useEffect, useMemo, useState } from 'react';
import { Boxes, Building2, MapPin, Search, Users } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { useBranches } from '../hooks/useBranches';
import { useWarehouses } from '../hooks/useWarehouses';

const statusStyles = {
  Active: 'success',
  ACTIVE: 'success',
  Maintenance: 'warning',
  MAINTENANCE: 'warning',
  Inactive: 'danger',
  INACTIVE: 'danger'
};

const displayStatus = (status) => {
  if (!status) return 'Active';
  return status.charAt(0) + status.slice(1).toLowerCase();
};

export default function WarehousePage() {
  const { activeBranch } = useAuth();
  const { data: branchRes } = useBranches();
  
  // Resolve selected active branch to branchId
  const activeBranchObject = useMemo(() => {
    return branchRes?.data?.find(b => b.branchName === activeBranch || b.name === activeBranch);
  }, [branchRes, activeBranch]);
  
  const branchId = activeBranchObject?._id;

  // Fetch warehouses scoped to the active branchId using React Query
  const { data: warehousesRes, isLoading: loading } = useWarehouses({ branchId });
  const warehouses = useMemo(() => warehousesRes?.data || [], [warehousesRes]);

  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Synchronize selected warehouse
  useEffect(() => {
    if (warehouses.length) {
      setSelectedWarehouse((current) => {
        if (current) {
          const found = warehouses.find((w) => w._id === current._id);
          if (found) return found;
        }
        return warehouses[0];
      });
    } else {
      setSelectedWarehouse(null);
    }
  }, [warehouses]);

  const filteredWarehouses = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return warehouses.filter((warehouse) => {
      return [warehouse.name, warehouse.code, warehouse.city, warehouse.manager]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [warehouses, searchTerm]);

  const summary = useMemo(() => {
    const totalCapacity = warehouses.reduce((sum, warehouse) => sum + (warehouse.totalCapacity || 0), 0);
    const usedCapacity = warehouses.reduce((sum, warehouse) => sum + (warehouse.usedCapacity || 0), 0);
    const activeWarehouses = warehouses.filter((warehouse) => warehouse.status === 'Active' || warehouse.status === 'ACTIVE').length;
    return {
      totalCapacity,
      usedCapacity,
      activeWarehouses,
      totalLocations: warehouses.reduce((sum, warehouse) => sum + (warehouse.totalLocations || 0), 0)
    };
  }, [warehouses]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouse Management"
        description="Monitor warehouse capacity, zones, and stock movement in one place."
        actions={<Button variant="primary">Add Warehouse</Button>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Active Warehouses</p>
                <p className="text-2xl font-semibold text-slate-900">{summary.activeWarehouses}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Capacity</p>
                <p className="text-2xl font-semibold text-slate-900">{summary.totalCapacity.toLocaleString()}</p>
              </div>
              <Boxes className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Used Capacity</p>
                <p className="text-2xl font-semibold text-slate-900">{summary.usedCapacity.toLocaleString()}</p>
              </div>
              <MapPin className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Storage Locations</p>
                <p className="text-2xl font-semibold text-slate-900">{summary.totalLocations}</p>
              </div>
              <Users className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Warehouse Directory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by warehouse, code, city, or manager"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">Loading warehouse data...</p>
            ) : filteredWarehouses.length === 0 ? (
              <p className="text-sm text-slate-500">No warehouses match the current search.</p>
            ) : (
              <div className="space-y-3">
                {filteredWarehouses.map((warehouse) => (
                  <button
                    key={warehouse._id}
                    className={`w-full rounded-xl border p-4 text-left transition ${selectedWarehouse?._id === warehouse._id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    onClick={() => setSelectedWarehouse(warehouse)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{warehouse.name}</p>
                        <p className="text-sm text-slate-500">{warehouse.code} • {warehouse.city || 'N/A'}</p>
                      </div>
                      <Badge variant={statusStyles[warehouse.status] || 'neutral'}>
                        {displayStatus(warehouse.status)}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                      <span>{warehouse.totalLocations || 0} locations</span>
                      <span>{warehouse.activeSkus || 0} active SKUs</span>
                      <span>{Math.round(((warehouse.usedCapacity || 0) / (warehouse.totalCapacity || 1)) * 100)}% utilized</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{selectedWarehouse?.name || 'Warehouse Overview'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedWarehouse ? (
              <>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Warehouse manager</p>
                  <p className="text-base font-semibold text-slate-900">{selectedWarehouse.manager || 'Unassigned'}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {selectedWarehouse.address ? `${selectedWarehouse.address}, ` : ''}
                    {selectedWarehouse.city || ''}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-sm text-slate-500">Capacity</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedWarehouse.totalCapacity?.toLocaleString()} units</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-sm text-slate-500">Utilization</p>
                    <p className="text-lg font-semibold text-slate-900">{Math.round(((selectedWarehouse.usedCapacity || 0) / (selectedWarehouse.totalCapacity || 1)) * 100)}%</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">Zone Breakdown</p>
                  <div className="space-y-2">
                    {(selectedWarehouse.zoneData || []).map((zone) => (
                      <div key={zone.zone} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-800">{zone.zone}</span>
                          <span className="text-sm text-slate-500">{zone.used}/{zone.total} used</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{zone.category}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Select a warehouse to inspect its operations.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
