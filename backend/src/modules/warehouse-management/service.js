const Warehouse = require('./model');

class WarehouseManagementService {
  constructor() {
    this.fallbackWarehouses = [
      {
        _id: 'warehouse-downtown',
        name: 'Downtown Flagship Hub',
        code: 'DTH-001',
        address: '45 Lake Street',
        city: 'Colombo 03',
        manager: 'Nimal Perera',
        totalCapacity: 12000,
        usedCapacity: 7840,
        totalLocations: 180,
        activeSkus: 142,
        status: 'Active',
        zoneData: [
          { zone: 'Zone A', total: 60, used: 48, category: 'Dry Goods' },
          { zone: 'Zone B', total: 60, used: 36, category: 'Cold Storage' },
          { zone: 'Zone C', total: 60, used: 41, category: 'Bulk Items' },
          { zone: 'Zone D', total: 60, used: 57, category: 'High-Value' }
        ]
      },
      {
        _id: 'warehouse-north',
        name: 'North Distribution Center',
        code: 'NDC-002',
        address: '12 Industrial Road',
        city: 'Kandy',
        manager: 'Shanika Jayasuriya',
        totalCapacity: 9000,
        usedCapacity: 6120,
        totalLocations: 138,
        activeSkus: 96,
        status: 'Active',
        zoneData: [
          { zone: 'Zone A', total: 50, used: 39, category: 'Dry Goods' },
          { zone: 'Zone B', total: 50, used: 24, category: 'Cold Storage' },
          { zone: 'Zone C', total: 50, used: 31, category: 'Bulk Items' },
          { zone: 'Zone D', total: 50, used: 45, category: 'High-Value' }
        ]
      },
      {
        _id: 'warehouse-south',
        name: 'South Regional Storehouse',
        code: 'SRS-003',
        address: '88 Harbor Avenue',
        city: 'Galle',
        manager: 'Kasun Fernando',
        totalCapacity: 7000,
        usedCapacity: 3430,
        totalLocations: 96,
        activeSkus: 78,
        status: 'Maintenance',
        zoneData: [
          { zone: 'Zone A', total: 40, used: 20, category: 'Dry Goods' },
          { zone: 'Zone B', total: 40, used: 14, category: 'Cold Storage' },
          { zone: 'Zone C', total: 40, used: 13, category: 'Bulk Items' },
          { zone: 'Zone D', total: 40, used: 17, category: 'High-Value' }
        ]
      }
    ];

    this.fallbackLocations = [
      { _id: 'loc-001', warehouseId: 'warehouse-downtown', locationCode: 'A-01-01-L1', zone: 'Zone A', row: 'Row 01', bay: 1, level: 'L1', status: 'Occupied', sku: 'SKU-10001', product: 'Wireless Headphones', qty: 60 },
      { _id: 'loc-002', warehouseId: 'warehouse-downtown', locationCode: 'A-01-02-L1', zone: 'Zone A', row: 'Row 01', bay: 2, level: 'L1', status: 'Empty', sku: null, product: null, qty: null },
      { _id: 'loc-003', warehouseId: 'warehouse-downtown', locationCode: 'B-01-01-L2', zone: 'Zone B', row: 'Row 01', bay: 1, level: 'L2', status: 'Occupied', sku: 'SKU-10012', product: 'Cold Chain Pack', qty: 24 }
    ];
  }

  async getWarehouses() {
    try {
      const warehouses = await Warehouse.find({}).lean();
      if (warehouses && warehouses.length) {
        return warehouses;
      }
    } catch (error) {
      console.warn('Warehouse DB unavailable, returning fallback data:', error.message);
    }

    return this.fallbackWarehouses;
  }

  async getWarehouseById(id) {
    try {
      const warehouse = await Warehouse.findById(id).lean();
      if (warehouse) {
        return warehouse;
      }
    } catch (error) {
      console.warn('Warehouse lookup failed, using fallback data:', error.message);
    }

    return this.fallbackWarehouses.find((item) => item._id === id) || this.fallbackWarehouses[0];
  }

  async createWarehouse(payload) {
    try {
      const warehouse = await Warehouse.create(payload);
      return warehouse;
    } catch (error) {
      console.warn('Warehouse creation fell back to sample data:', error.message);
      const created = {
        ...payload,
        _id: `warehouse-${Date.now()}`,
        totalCapacity: Number(payload.totalCapacity) || 5000,
        usedCapacity: 0,
        totalLocations: 120,
        activeSkus: 0,
        status: 'Active',
        zoneData: [
          { zone: 'Zone A', total: 40, used: 0, category: 'Dry Goods' },
          { zone: 'Zone B', total: 40, used: 0, category: 'Cold Storage' }
        ]
      };
      this.fallbackWarehouses.unshift(created);
      return created;
    }
  }

  async getWarehouseLocations(id) {
    try {
      const locations = await Warehouse.db.models.Location?.find({ warehouseId: id }).lean();
      if (locations && locations.length) {
        return locations;
      }
    } catch (error) {
      console.warn('Warehouse location lookup failed, using fallback data:', error.message);
    }

    return this.fallbackLocations.filter((item) => item.warehouseId === id);
  }
}

module.exports = new WarehouseManagementService();
