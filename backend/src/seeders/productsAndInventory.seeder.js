const User = require('../modules/user-management/user.model');
require('../modules/role-management/role.model');
require('../modules/category-management/model');
require('../modules/supplier-management/model');
const Branch = require('../modules/branch-management/branch.model');
const Product = require('../modules/product-management/model');
const Inventory = require('../modules/inventory-management/model');
const StockTransfer = require('../modules/stock-transfers/model');

const seedProductsAndInventory = async () => {
  try {
    console.log('Starting Products, Inventory, and Stock Transfers Seeding...');

    let admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      admin = await User.findOne({});
    }
    if (!admin) {
      throw new Error('Please seed users before seeding products and inventory.');
    }

    const branchesToSeed = [
      { name: 'Central WH', code: 'CWH-001', location: { city: 'Metropolis', country: 'USA' }, status: 'ACTIVE' },
      { name: 'West WH', code: 'WWH-002', location: { city: 'Metropolis', country: 'USA' }, status: 'ACTIVE' },
      { name: 'South WH', code: 'SWH-003', location: { city: 'Metropolis', country: 'USA' }, status: 'ACTIVE' },
      { name: 'East WH', code: 'EWH-004', location: { city: 'Metropolis', country: 'USA' }, status: 'ACTIVE' },
      { name: 'Retail 1', code: 'R-001', location: { city: 'Metropolis', country: 'USA' }, status: 'ACTIVE' },
      { name: 'Retail 2', code: 'R-002', location: { city: 'Metropolis', country: 'USA' }, status: 'ACTIVE' },
      { name: 'Retail 3', code: 'R-003', location: { city: 'Metropolis', country: 'USA' }, status: 'ACTIVE' },
      { name: 'Retail 5', code: 'R-005', location: { city: 'Metropolis', country: 'USA' }, status: 'ACTIVE' },
      { name: 'Retail 6', code: 'R-006', location: { city: 'Metropolis', country: 'USA' }, status: 'ACTIVE' },
      { name: 'Retail 7', code: 'R-007', location: { city: 'Metropolis', country: 'USA' }, status: 'ACTIVE' },
      { name: 'Retail 10', code: 'R-010', location: { city: 'Metropolis', country: 'USA' }, status: 'ACTIVE' },
      { name: 'Retail 12', code: 'R-012', location: { city: 'Metropolis', country: 'USA' }, status: 'ACTIVE' },
      { name: 'Retail 13', code: 'R-013', location: { city: 'Metropolis', country: 'USA' }, status: 'ACTIVE' },
      { name: 'Retail 14', code: 'R-014', location: { city: 'Metropolis', country: 'USA' }, status: 'ACTIVE' },
    ];

    const branchMap = {};
    for (const bData of branchesToSeed) {
      let branch = await Branch.findOne({ name: bData.name });
      if (!branch) {
        branch = await Branch.create(bData);
        console.log(`Created branch: ${bData.name}`);
      }
      branchMap[bData.name] = branch._id;
    }

    const productsToSeed = [
      { sku: 'SKU-0001', name: 'Wireless Mouse', price: 29.99, costPrice: 15.00, category: 'Accessories', status: 'ACTIVE', barcode: 'BAR-0001' },
      { sku: 'SKU-0002', name: 'Mechanical Keyboard', price: 79.99, costPrice: 40.00, category: 'Accessories', status: 'ACTIVE', barcode: 'BAR-0002' },
      { sku: 'SKU-0003', name: 'Gaming Monitor', price: 249.99, costPrice: 150.00, category: 'Electronics', status: 'ACTIVE', barcode: 'BAR-0003' },
      { sku: 'SKU-0004', name: 'USB-C Adapter', price: 19.99, costPrice: 8.00, category: 'Accessories', status: 'ACTIVE', barcode: 'BAR-0004' },
      { sku: 'SKU-0005', name: 'Bluetooth Speaker', price: 49.99, costPrice: 25.00, category: 'Electronics', status: 'ACTIVE', barcode: 'BAR-0005' },
    ];

    const productMap = {};
    for (const pData of productsToSeed) {
      let product = await Product.findOne({ sku: pData.sku });
      if (!product) {
        product = await Product.create(pData);
        console.log(`Created product: ${pData.sku} - ${pData.name}`);
      }
      productMap[pData.sku] = product._id;
    }

    // Format: { [branchName]: { [sku]: quantity } }
    const inventoryToSeed = {
      'Central WH': { 'SKU-0001': 15, 'SKU-0002': 10, 'SKU-0003': 8, 'SKU-0004': 30, 'SKU-0005': 45 },
      'West WH': { 'SKU-0001': 25, 'SKU-0002': 18, 'SKU-0003': 12, 'SKU-0004': 10, 'SKU-0005': 15 },
      'South WH': { 'SKU-0001': 30, 'SKU-0002': 12, 'SKU-0003': 5, 'SKU-0004': 25, 'SKU-0005': 20 },
      'East WH': { 'SKU-0001': 50, 'SKU-0002': 50, 'SKU-0003': 50, 'SKU-0004': 50, 'SKU-0005': 50 },
    };

    for (const [branchName, items] of Object.entries(inventoryToSeed)) {
      const branchId = branchMap[branchName];
      if (!branchId) continue;

      for (const [sku, quantity] of Object.entries(items)) {
        const productId = productMap[sku];
        if (!productId) continue;

        // Upsert inventory record
        await Inventory.findOneAndUpdate(
          { productId, branchId },
          { quantity, reorderLevel: 5 },
          { upsert: true, new: true }
        );
      }
    }
    console.log('Inventory levels seeded.');

    
    await StockTransfer.deleteMany({});
    console.log('Cleared existing stock transfers.');

    const transfersToSeed = [
      {
        transferNumber: '#1',
        sourceBranch: branchMap['Central WH'],
        destinationBranch: branchMap['Retail 13'],
        status: 'PENDING',
        createdBy: admin._id,
        updatedBy: admin._id,
        items: [
          { productId: productMap['SKU-0001'], quantityTransferred: 10 },
          { productId: productMap['SKU-0002'], quantityTransferred: 8 },
          { productId: productMap['SKU-0003'], quantityTransferred: 2 },
        ],
        notes: 'Replenishment for promotional event',
        createdAt: new Date('2026-06-10T10:00:00Z'),
      },
      {
        transferNumber: '#2',
        sourceBranch: branchMap['West WH'],
        destinationBranch: branchMap['Retail 3'],
        status: 'PENDING',
        createdBy: admin._id,
        updatedBy: admin._id,
        items: [
          { productId: productMap['SKU-0001'], quantityTransferred: 5 },
          { productId: productMap['SKU-0002'], quantityTransferred: 3 },
        ],
        notes: 'Regular restock',
        createdAt: new Date('2026-06-09T14:30:00Z'),
      },
      {
        transferNumber: '#3',
        sourceBranch: branchMap['Central WH'],
        destinationBranch: branchMap['Retail 10'],
        status: 'PENDING',
        createdBy: admin._id,
        updatedBy: admin._id,
        items: [
          { productId: productMap['SKU-0002'], quantityTransferred: 10 },
        ],
        notes: 'Urgent keyboard requests',
        createdAt: new Date('2026-06-08T09:15:00Z'),
      },

      {
        transferNumber: '#TR-001',
        sourceBranch: branchMap['Central WH'],
        destinationBranch: branchMap['Retail 1'],
        status: 'PICKED_UP',
        createdBy: admin._id,
        updatedBy: admin._id,
        driverName: 'Kamal Perera',
        vehicleNumber: 'WP-CAM-1025',
        trackingNumber: '#TR-001',
        estimatedTime: '30 Minutes',
        notes: 'Weekly dispatch',
        items: [
          { productId: productMap['SKU-0001'], quantityTransferred: 10 },
          { productId: productMap['SKU-0002'], quantityTransferred: 8 },
          { productId: productMap['SKU-0003'], quantityTransferred: 2 },
        ],
        createdAt: new Date('2026-06-23T08:00:00Z'),
      },
      {
        transferNumber: '#TR-002',
        sourceBranch: branchMap['West WH'],
        destinationBranch: branchMap['Retail 14'],
        status: 'IN_TRANSIT',
        createdBy: admin._id,
        updatedBy: admin._id,
        driverName: 'Nimal Silva',
        vehicleNumber: 'WP-CAT-8892',
        trackingNumber: '#TR-002',
        estimatedTime: '45 Minutes',
        notes: 'Branch transfer',
        items: [
          { productId: productMap['SKU-0001'], quantityTransferred: 20 },
        ],
        createdAt: new Date('2026-06-23T09:30:00Z'),
      },
      {
        transferNumber: '#TR-003',
        sourceBranch: branchMap['South WH'],
        destinationBranch: branchMap['Retail 12'],
        status: 'IN_TRANSIT',
        createdBy: admin._id,
        updatedBy: admin._id,
        driverName: 'Sunil Perera',
        vehicleNumber: 'WP-CAA-4781',
        trackingNumber: '#TR-003',
        estimatedTime: '1 Hour',
        notes: 'Monthly distribution',
        items: [
          { productId: productMap['SKU-0003'], quantityTransferred: 5 },
        ],
        createdAt: new Date('2026-06-23T10:15:00Z'),
      },
      {
        transferNumber: '#TR-004',
        sourceBranch: branchMap['Central WH'],
        destinationBranch: branchMap['Retail 10'],
        status: 'IN_TRANSIT',
        createdBy: admin._id,
        updatedBy: admin._id,
        driverName: 'Kamal Perera',
        vehicleNumber: 'WP-CAM-1025',
        trackingNumber: '#TR-004',
        estimatedTime: '15 Minutes',
        notes: 'Restocking retail 10',
        items: [
          { productId: productMap['SKU-0004'], quantityTransferred: 15 },
        ],
        createdAt: new Date('2026-06-23T11:00:00Z'),
      },
      {
        transferNumber: '#TR-005',
        sourceBranch: branchMap['Central WH'],
        destinationBranch: branchMap['Retail 2'],
        status: 'PICKED_UP',
        createdBy: admin._id,
        updatedBy: admin._id,
        driverName: 'Rohan Alwis',
        vehicleNumber: 'WP-CBA-9011',
        trackingNumber: '#TR-005',
        estimatedTime: '40 Minutes',
        notes: 'Stock fill',
        items: [
          { productId: productMap['SKU-0005'], quantityTransferred: 10 },
        ],
        createdAt: new Date('2026-06-23T11:45:00Z'),
      },

      {
        transferNumber: '#TR-HIST-001',
        sourceBranch: branchMap['Central WH'],
        destinationBranch: branchMap['Retail 1'],
        status: 'DELIVERED',
        createdBy: admin._id,
        updatedBy: admin._id,
        items: [
          { productId: productMap['SKU-0001'], quantityTransferred: 10, quantityReceived: 10 },
        ],
        createdAt: new Date('2026-05-10T12:00:00Z'),
      },
      {
        transferNumber: '#TR-HIST-002',
        sourceBranch: branchMap['West WH'],
        destinationBranch: branchMap['Retail 14'],
        status: 'DELIVERED',
        createdBy: admin._id,
        updatedBy: admin._id,
        items: [
          { productId: productMap['SKU-0001'], quantityTransferred: 20, quantityReceived: 20 },
        ],
        createdAt: new Date('2026-05-18T15:30:00Z'),
      },
      {
        transferNumber: '#TR-HIST-003',
        sourceBranch: branchMap['South WH'],
        destinationBranch: branchMap['Retail 12'],
        status: 'CANCELLED',
        createdBy: admin._id,
        updatedBy: admin._id,
        items: [
          { productId: productMap['SKU-0002'], quantityTransferred: 5, quantityReceived: 0 },
        ],
        createdAt: new Date('2026-04-18T09:00:00Z'),
      },
      {
        transferNumber: '#TR-HIST-004',
        sourceBranch: branchMap['Central WH'],
        destinationBranch: branchMap['Retail 10'],
        status: 'DELIVERED',
        createdBy: admin._id,
        updatedBy: admin._id,
        items: [
          { productId: productMap['SKU-0003'], quantityTransferred: 8, quantityReceived: 8 },
        ],
        createdAt: new Date('2026-05-11T10:45:00Z'),
      },
      {
        transferNumber: '#TR-HIST-005',
        sourceBranch: branchMap['East WH'],
        destinationBranch: branchMap['Retail 7'],
        status: 'DELIVERED',
        createdBy: admin._id,
        updatedBy: admin._id,
        items: [
          { productId: productMap['SKU-0004'], quantityTransferred: 40, quantityReceived: 40 },
        ],
        createdAt: new Date('2026-04-17T11:00:00Z'),
      },
      {
        transferNumber: '#TR-HIST-006',
        sourceBranch: branchMap['Central WH'],
        destinationBranch: branchMap['Retail 5'],
        status: 'DELIVERED',
        createdBy: admin._id,
        updatedBy: admin._id,
        items: [
          { productId: productMap['SKU-0005'], quantityTransferred: 3, quantityReceived: 3 },
        ],
        createdAt: new Date('2026-05-13T14:00:00Z'),
      },
      {
        transferNumber: '#TR-HIST-007',
        sourceBranch: branchMap['Central WH'],
        destinationBranch: branchMap['Retail 2'],
        status: 'DELIVERED',
        createdBy: admin._id,
        updatedBy: admin._id,
        items: [
          { productId: productMap['SKU-0002'], quantityTransferred: 16, quantityReceived: 16 },
        ],
        createdAt: new Date('2026-06-07T16:00:00Z'),
      },
      {
        transferNumber: '#TR-HIST-008',
        sourceBranch: branchMap['South WH'],
        destinationBranch: branchMap['Retail 6'],
        status: 'DELIVERED',
        createdBy: admin._id,
        updatedBy: admin._id,
        items: [
          { productId: productMap['SKU-0001'], quantityTransferred: 25, quantityReceived: 25 },
        ],
        createdAt: new Date('2026-06-04T13:20:00Z'),
      },
    ];

    for (const tData of transfersToSeed) {
      // Create transfer
      await StockTransfer.create(tData);
    }

    console.log('Stock transfers seeded.');
    console.log('Products, Inventory, and Stock Transfers Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding products and inventory:', error);
    throw error;
  }
};

module.exports = seedProductsAndInventory;
