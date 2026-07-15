const User = require('../modules/user-management/user.model');
require('../modules/role-management/role.model');
const Category = require('../modules/category-management/model');
require('../modules/supplier-management/model');
const Branch = require('../modules/branch-management/branch.model');
const Warehouse = require('../modules/warehouse-management/model');
const Product = require('../modules/product-management/model');
const Inventory = require('../modules/inventory-management/model');
const InventoryItem = require('../modules/inventory-management/inventoryItem.model');
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

    // Clear existing warehouses and inventory items
    console.log('Clearing old warehouses and inventory items...');
    await Warehouse.deleteMany({});
    await InventoryItem.deleteMany({});

    const branchMap = {};
    const warehouseMap = {};
    for (const bData of branchesToSeed) {
      let branch = await Branch.findOne({ branchName: bData.name });
      if (!branch) {
        branch = await Branch.create({
          branchName: bData.name,
          branchCode: bData.code,
          address: {
            line1: 'No. 1, Main Street',
            city: bData.location?.city || 'Metropolis',
            district: 'Western'
          },
          phone: '+94 77 123 4567',
          openingDate: new Date('2020-01-01'),
          status: bData.status || 'ACTIVE'
        });
        console.log(`Created branch: ${bData.name}`);
      }
      branchMap[bData.name] = branch._id;

      // Seed corresponding Warehouse for each branch
      const warehouse = await Warehouse.create({
        name: bData.name,
        code: bData.code,
        branchId: branch._id,
        status: 'ACTIVE',
        location: {
          address: 'No. 1, Main Street',
          city: bData.location?.city || 'Metropolis',
          country: 'Sri Lanka'
        }
      });
      console.log(`Created warehouse mapping: ${bData.name} (${bData.code})`);
      warehouseMap[bData.name] = warehouse._id;
    }

    // Get categories to map string name to ObjectId
    const categoriesList = await Category.find({});
    const categoryMap = {};
    for (const cat of categoriesList) {
      categoryMap[cat.name] = cat._id;
    }

    // Clear existing products and inventory to make seed clean
    console.log('Clearing old products and legacy inventory records...');
    await Product.deleteMany({});
    await Inventory.deleteMany({});

    const productsToSeed = [
      { sku: 'SKU-0001', name: 'Wireless Mouse', price: 2990, costPrice: 1500, category: 'Accessories', status: 'ACTIVE', barcode: 'BAR-0001' },
      { sku: 'SKU-0002', name: 'Mechanical Keyboard', price: 7990, costPrice: 4000, category: 'Accessories', status: 'ACTIVE', barcode: 'BAR-0002' },
      { sku: 'SKU-0003', name: 'Gaming Monitor', price: 24990, costPrice: 15000, category: 'Electronics', status: 'ACTIVE', barcode: 'BAR-0003' },
      { sku: 'SKU-0004', name: 'USB-C Adapter', price: 1990, costPrice: 800, category: 'Accessories', status: 'ACTIVE', barcode: 'BAR-0004' },
      { sku: 'SKU-0005', name: 'Bluetooth Speaker', price: 4990, costPrice: 2500, category: 'Electronics', status: 'ACTIVE', barcode: 'BAR-0005' },
      
      { sku: 'AP-MDS-001', name: 'Slim Fit Denim Shirt', price: 2450, costPrice: 1200, category: "Men's Wear", status: 'ACTIVE', barcode: 'BAR-0006' },
      { sku: 'AP-WFD-002', name: 'Floral Summer Dress', price: 3800, costPrice: 1800, category: "Women's Wear", status: 'ACTIVE', barcode: 'BAR-0007' },
      { sku: 'AP-KCP-003', name: 'Kids Cotton Pajama Set', price: 1500, costPrice: 700, category: "Kids Wear", status: 'ACTIVE', barcode: 'BAR-0008' },
      
      { sku: 'EL-ASX-001', name: 'AeroPhone X10', price: 95000, costPrice: 75000, category: 'Smartphones', status: 'ACTIVE', barcode: 'BAR-0009' },
      { sku: 'EL-LZP-002', name: 'ZenBook Pro 14', price: 185000, costPrice: 150000, category: 'Laptops', status: 'ACTIVE', barcode: 'BAR-0010' },
      { sku: 'EL-ABP-003', name: 'AeroBuds Pro', price: 8500, costPrice: 4000, category: 'Electronic Accessories', status: 'ACTIVE', barcode: 'BAR-0011' },
      
      { sku: 'FW-CCS-001', name: 'Classic Canvas Sneakers', price: 4200, costPrice: 2000, category: 'Casual Shoes', status: 'ACTIVE', barcode: 'BAR-0012' },
      { sku: 'FW-OLS-002', name: 'Oxford Leather Shoes', price: 8900, costPrice: 4500, category: 'Formal Shoes', status: 'ACTIVE', barcode: 'BAR-0013' },
      { sku: 'FW-ARV-003', name: 'AeroRunner V2', price: 12500, costPrice: 6000, category: 'Sports Shoes', status: 'ACTIVE', barcode: 'BAR-0014' },
      
      { sku: 'SC-HAC-001', name: 'Hydrating Aloe Cream', price: 1800, costPrice: 900, category: 'Moisturizers', status: 'ACTIVE', barcode: 'BAR-0015' },
      { sku: 'SC-UVS-002', name: 'UV Shield SPF 50', price: 2200, costPrice: 1100, category: 'Sunscreen', status: 'ACTIVE', barcode: 'BAR-0016' },
      
      { sku: 'EW-CAS-001', name: 'Classic Aviator Sunglasses', price: 3500, costPrice: 1500, category: 'Sunglasses', status: 'ACTIVE', barcode: 'BAR-0017' },
      { sku: 'EW-ABF-002', name: 'Anti-Blue Light Frames', price: 4800, costPrice: 2000, category: 'Prescription Glasses', status: 'ACTIVE', barcode: 'BAR-0018' },
    ];

    const productMap = {};
    for (const pData of productsToSeed) {
      const product = await Product.create({
        sku: pData.sku,
        name: pData.name,
        description: pData.name,
        category: categoryMap[pData.category] || categoriesList[0]?._id,
        pricing: {
          sellingPrice: pData.price,
          costPrice: pData.costPrice || 0
        },
        branch: branchMap['Central WH'],
        status: pData.status || 'ACTIVE',
        barcode: pData.barcode || null,
        createdBy: admin._id
      });
      console.log(`Created product: ${pData.sku} - ${pData.name}`);
      productMap[pData.sku] = product._id;
    }

    // Format: { [branchName]: { [sku]: quantity } }
    const inventoryToSeed = {
      'Central WH': {
        'SKU-0001': 15, 'SKU-0002': 10, 'SKU-0003': 8, 'SKU-0004': 30, 'SKU-0005': 45,
        'AP-MDS-001': 20, 'AP-WFD-002': 15, 'AP-KCP-003': 25, 'EL-ASX-001': 10, 'EL-LZP-002': 5,
        'EL-ABP-003': 30, 'FW-CCS-001': 12, 'FW-OLS-002': 8, 'FW-ARV-003': 14, 'SC-HAC-001': 40,
        'SC-UVS-002': 35, 'EW-CAS-001': 20, 'EW-ABF-002': 18
      },
      'West WH': {
        'SKU-0001': 25, 'SKU-0002': 18, 'SKU-0003': 12, 'SKU-0004': 10, 'SKU-0005': 15,
        'AP-MDS-001': 12, 'AP-WFD-002': 10, 'AP-KCP-003': 18, 'EL-ASX-001': 6, 'EL-LZP-002': 3,
        'EL-ABP-003': 15, 'FW-CCS-001': 10, 'FW-OLS-002': 6, 'FW-ARV-003': 8, 'SC-HAC-001': 20,
        'SC-UVS-002': 15, 'EW-CAS-001': 10, 'EW-ABF-002': 8
      },
      'South WH': {
        'SKU-0001': 30, 'SKU-0002': 12, 'SKU-0003': 5, 'SKU-0004': 25, 'SKU-0005': 20,
        'AP-MDS-001': 15, 'AP-WFD-002': 8, 'AP-KCP-003': 12, 'EL-ASX-001': 4, 'EL-LZP-002': 2,
        'EL-ABP-003': 20, 'FW-CCS-001': 8, 'FW-OLS-002': 4, 'FW-ARV-003': 6, 'SC-HAC-001': 18,
        'SC-UVS-002': 12, 'EW-CAS-001': 8, 'EW-ABF-002': 6
      },
      'East WH': {
        'SKU-0001': 50, 'SKU-0002': 50, 'SKU-0003': 50, 'SKU-0004': 50, 'SKU-0005': 50,
        'AP-MDS-001': 30, 'AP-WFD-002': 30, 'AP-KCP-003': 30, 'EL-ASX-001': 20, 'EL-LZP-002': 15,
        'EL-ABP-003': 40, 'FW-CCS-001': 25, 'FW-OLS-002': 20, 'FW-ARV-003': 25, 'SC-HAC-001': 45,
        'SC-UVS-002': 40, 'EW-CAS-001': 30, 'EW-ABF-002': 25
      },
    };

    for (const [branchName, items] of Object.entries(inventoryToSeed)) {
      const branchId = branchMap[branchName];
      const warehouseId = warehouseMap[branchName];
      if (!branchId || !warehouseId) continue;

      for (const [sku, quantity] of Object.entries(items)) {
        const productId = productMap[sku];
        if (!productId) continue;

        // Seed legacy Inventory model
        await Inventory.findOneAndUpdate(
          { productId, branchId },
          { quantity, reorderLevel: 5 },
          { upsert: true, new: true }
        );

        // Seed modern InventoryItem model (used by low-stock-alerts and stock-levels endpoints)
        // Ensure some items have very low stock to trigger low-stock alerts
        // Set reorderLevel dynamically based on quantity to trigger low stock alerts for some items
        let reorderLevel = 10;
        if (quantity < 10) {
          reorderLevel = 15; // quantity < reorderLevel => alert triggered!
        } else if (quantity > 30) {
          reorderLevel = 5; // healthy stock
        }

        await InventoryItem.findOneAndUpdate(
          { productId, warehouseId },
          {
            currentStock: quantity,
            reservedStock: Math.floor(quantity * 0.1), // 10% reserved
            reorderLevel,
            lastMovementAt: new Date()
          },
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
        statusHistory: [
          { status: 'PENDING', updatedBy: admin._id, updatedAt: new Date('2026-06-10T10:00:00Z'), notes: 'Stock transfer request created.' }
        ]
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
        statusHistory: [
          { status: 'PENDING', updatedBy: admin._id, updatedAt: new Date('2026-06-09T14:30:00Z'), notes: 'Stock transfer request created.' }
        ]
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
        statusHistory: [
          { status: 'PENDING', updatedBy: admin._id, updatedAt: new Date('2026-06-08T09:15:00Z'), notes: 'Stock transfer request created.' }
        ]
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
        statusHistory: [
          { status: 'PENDING', updatedBy: admin._id, updatedAt: new Date('2026-06-23T08:00:00Z'), notes: 'Stock transfer request created.' },
          { status: 'APPROVED', updatedBy: admin._id, updatedAt: new Date('2026-06-23T08:30:00Z'), notes: 'Request approved by manager.' },
          { status: 'PICKED_UP', updatedBy: admin._id, updatedAt: new Date('2026-06-23T09:00:00Z'), notes: 'Stock picked up by driver.' }
        ]
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
        statusHistory: [
          { status: 'PENDING', updatedBy: admin._id, updatedAt: new Date('2026-06-23T09:30:00Z'), notes: 'Stock transfer request created.' },
          { status: 'APPROVED', updatedBy: admin._id, updatedAt: new Date('2026-06-23T10:00:00Z'), notes: 'Request approved by manager.' },
          { status: 'PICKED_UP', updatedBy: admin._id, updatedAt: new Date('2026-06-23T10:30:00Z'), notes: 'Stock picked up by driver.' },
          { status: 'IN_TRANSIT', updatedBy: admin._id, updatedAt: new Date('2026-06-23T10:45:00Z'), notes: 'Shipment is in transit.' }
        ]
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
        statusHistory: [
          { status: 'PENDING', updatedBy: admin._id, updatedAt: new Date('2026-06-23T10:15:00Z'), notes: 'Stock transfer request created.' },
          { status: 'APPROVED', updatedBy: admin._id, updatedAt: new Date('2026-06-23T10:30:00Z'), notes: 'Request approved by manager.' },
          { status: 'PICKED_UP', updatedBy: admin._id, updatedAt: new Date('2026-06-23T11:00:00Z'), notes: 'Stock picked up by driver.' },
          { status: 'IN_TRANSIT', updatedBy: admin._id, updatedAt: new Date('2026-06-23T11:15:00Z'), notes: 'Shipment is in transit.' }
        ]
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
        statusHistory: [
          { status: 'PENDING', updatedBy: admin._id, updatedAt: new Date('2026-06-23T11:00:00Z'), notes: 'Stock transfer request created.' },
          { status: 'APPROVED', updatedBy: admin._id, updatedAt: new Date('2026-06-23T11:15:00Z'), notes: 'Request approved by manager.' },
          { status: 'PICKED_UP', updatedBy: admin._id, updatedAt: new Date('2026-06-23T11:30:00Z'), notes: 'Stock picked up by driver.' },
          { status: 'IN_TRANSIT', updatedBy: admin._id, updatedAt: new Date('2026-06-23T11:45:00Z'), notes: 'Shipment is in transit.' }
        ]
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
        statusHistory: [
          { status: 'PENDING', updatedBy: admin._id, updatedAt: new Date('2026-06-23T11:45:00Z'), notes: 'Stock transfer request created.' },
          { status: 'APPROVED', updatedBy: admin._id, updatedAt: new Date('2026-06-23T12:00:00Z'), notes: 'Request approved by manager.' },
          { status: 'PICKED_UP', updatedBy: admin._id, updatedAt: new Date('2026-06-23T12:30:00Z'), notes: 'Stock picked up by driver.' }
        ]
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
        statusHistory: [
          { status: 'PENDING', updatedBy: admin._id, updatedAt: new Date('2026-05-10T12:00:00Z'), notes: 'Stock transfer request created.' },
          { status: 'APPROVED', updatedBy: admin._id, updatedAt: new Date('2026-05-10T12:30:00Z'), notes: 'Request approved by manager.' },
          { status: 'PICKED_UP', updatedBy: admin._id, updatedAt: new Date('2026-05-10T13:00:00Z'), notes: 'Stock picked up by driver.' },
          { status: 'IN_TRANSIT', updatedBy: admin._id, updatedAt: new Date('2026-05-10T13:15:00Z'), notes: 'Shipment is in transit.' },
          { status: 'DELIVERED', updatedBy: admin._id, updatedAt: new Date('2026-05-10T14:00:00Z'), notes: 'Stock delivered successfully.' }
        ]
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
        statusHistory: [
          { status: 'PENDING', updatedBy: admin._id, updatedAt: new Date('2026-05-18T15:30:00Z'), notes: 'Stock transfer request created.' },
          { status: 'APPROVED', updatedBy: admin._id, updatedAt: new Date('2026-05-18T16:00:00Z'), notes: 'Request approved by manager.' },
          { status: 'PICKED_UP', updatedBy: admin._id, updatedAt: new Date('2026-05-18T16:30:00Z'), notes: 'Stock picked up by driver.' },
          { status: 'IN_TRANSIT', updatedBy: admin._id, updatedAt: new Date('2026-05-18T16:45:00Z'), notes: 'Shipment is in transit.' },
          { status: 'DELIVERED', updatedBy: admin._id, updatedAt: new Date('2026-05-18T17:30:00Z'), notes: 'Stock delivered successfully.' }
        ]
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
        statusHistory: [
          { status: 'PENDING', updatedBy: admin._id, updatedAt: new Date('2026-04-18T09:00:00Z'), notes: 'Stock transfer request created.' },
          { status: 'CANCELLED', updatedBy: admin._id, updatedAt: new Date('2026-04-18T10:00:00Z'), notes: 'Transfer cancelled.' }
        ]
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
        statusHistory: [
          { status: 'PENDING', updatedBy: admin._id, updatedAt: new Date('2026-05-11T10:45:00Z'), notes: 'Stock transfer request created.' },
          { status: 'APPROVED', updatedBy: admin._id, updatedAt: new Date('2026-05-11T11:15:00Z'), notes: 'Request approved by manager.' },
          { status: 'PICKED_UP', updatedBy: admin._id, updatedAt: new Date('2026-05-11T11:45:00Z'), notes: 'Stock picked up by driver.' },
          { status: 'IN_TRANSIT', updatedBy: admin._id, updatedAt: new Date('2026-05-11T12:00:00Z'), notes: 'Shipment is in transit.' },
          { status: 'DELIVERED', updatedBy: admin._id, updatedAt: new Date('2026-05-11T12:45:00Z'), notes: 'Stock delivered successfully.' }
        ]
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
        statusHistory: [
          { status: 'PENDING', updatedBy: admin._id, updatedAt: new Date('2026-04-17T11:00:00Z'), notes: 'Stock transfer request created.' },
          { status: 'APPROVED', updatedBy: admin._id, updatedAt: new Date('2026-04-17T11:30:00Z'), notes: 'Request approved by manager.' },
          { status: 'PICKED_UP', updatedBy: admin._id, updatedAt: new Date('2026-04-17T12:00:00Z'), notes: 'Stock picked up by driver.' },
          { status: 'IN_TRANSIT', updatedBy: admin._id, updatedAt: new Date('2026-04-17T12:15:00Z'), notes: 'Shipment is in transit.' },
          { status: 'DELIVERED', updatedBy: admin._id, updatedAt: new Date('2026-04-17T13:00:00Z'), notes: 'Stock delivered successfully.' }
        ]
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
        statusHistory: [
          { status: 'PENDING', updatedBy: admin._id, updatedAt: new Date('2026-05-13T14:00:00Z'), notes: 'Stock transfer request created.' },
          { status: 'APPROVED', updatedBy: admin._id, updatedAt: new Date('2026-05-13T14:30:00Z'), notes: 'Request approved by manager.' },
          { status: 'PICKED_UP', updatedBy: admin._id, updatedAt: new Date('2026-05-13T15:00:00Z'), notes: 'Stock picked up by driver.' },
          { status: 'IN_TRANSIT', updatedBy: admin._id, updatedAt: new Date('2026-05-13T15:15:00Z'), notes: 'Shipment is in transit.' },
          { status: 'DELIVERED', updatedBy: admin._id, updatedAt: new Date('2026-05-13T16:00:00Z'), notes: 'Stock delivered successfully.' }
        ]
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
        statusHistory: [
          { status: 'PENDING', updatedBy: admin._id, updatedAt: new Date('2026-06-07T16:00:00Z'), notes: 'Stock transfer request created.' },
          { status: 'APPROVED', updatedBy: admin._id, updatedAt: new Date('2026-06-07T16:30:00Z'), notes: 'Request approved by manager.' },
          { status: 'PICKED_UP', updatedBy: admin._id, updatedAt: new Date('2026-06-07T17:00:00Z'), notes: 'Stock picked up by driver.' },
          { status: 'IN_TRANSIT', updatedBy: admin._id, updatedAt: new Date('2026-06-07T17:15:00Z'), notes: 'Shipment is in transit.' },
          { status: 'DELIVERED', updatedBy: admin._id, updatedAt: new Date('2026-06-07T18:00:00Z'), notes: 'Stock delivered successfully.' }
        ]
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
        statusHistory: [
          { status: 'PENDING', updatedBy: admin._id, updatedAt: new Date('2026-06-04T13:20:00Z'), notes: 'Stock transfer request created.' },
          { status: 'APPROVED', updatedBy: admin._id, updatedAt: new Date('2026-06-04T13:50:00Z'), notes: 'Request approved by manager.' },
          { status: 'PICKED_UP', updatedBy: admin._id, updatedAt: new Date('2026-06-04T14:20:00Z'), notes: 'Stock picked up by driver.' },
          { status: 'IN_TRANSIT', updatedBy: admin._id, updatedAt: new Date('2026-06-04T14:40:00Z'), notes: 'Shipment is in transit.' },
          { status: 'DELIVERED', updatedBy: admin._id, updatedAt: new Date('2026-05-10T14:00:00Z'), notes: 'Stock delivered successfully.' }
        ]
      },
    ];

    for (const tData of transfersToSeed) {
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
