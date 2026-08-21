const mongoose = require('mongoose');
const Product = require('./model');
const SaleTransaction = require('../sales-history/model')
const PurchaseOrder = require('../purchase-orders/model')

class ProductService {
  /**
   * Auto-generate a SKU when the user leaves the field blank on Add Product.
   * Format: BRD-XXXX-YYYY (matches placeholder "e.g. RSX-200-BLK" style)
   */
  generateSKU(brand = 'PRD') {
    const prefix = (brand || 'PRD').replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase() || 'PRD';
    const random = Math.floor(100 + Math.random() * 900);
    const suffix = Date.now().toString().slice(-4);
    return `${prefix}-${random}-${suffix}`;
  }

  /**
   * REQ-PROD-001: Create product record
   */
  async createProduct(payload, userId) {
    const data = { ...payload };

    if (!data.sku || !data.sku.trim()) {
      data.sku = this.generateSKU(data.brand);
    } else {
      data.sku = data.sku.trim().toUpperCase();
    }

    const existing = await Product.findOne({ sku: data.sku });
    if (existing) {
      const err = new Error(`SKU '${data.sku}' already exists. Please use a different SKU.`);
      err.statusCode = 409;
      throw err;
    }

    // Map "Initial Quantity / Reorder Point / Warehouse" from Add Product form
    // into the inventory + variants structure if provided flat.
    if (data.initialQuantity !== undefined || data.reorderPoint !== undefined || data.warehouse) {
      data.inventory = {
        trackInventory: data.trackInventory ?? true,
        reorderPoint: data.reorderPoint || 0,
        warehouse: data.warehouse || undefined
      };
      if (data.initialQuantity && !data.variants) {
        data.variants = [
          {
            size: 'Default',
            sku: data.sku,
            quantity: data.initialQuantity,
            warehouse: data.warehouse || undefined
          }
        ];
      }
      delete data.initialQuantity;
      delete data.reorderPoint;
      delete data.warehouse;
      delete data.trackInventory;
    }

    const product = await Product.create({
      ...data,
      createdBy: userId,
      updatedBy: userId
    });

    return product;
  }

  /**
   * Product List screen: paginated table with Category / Status filters
   */
  async getProducts({ page = 1, limit = 10, category, status, search, branch }) {
    const query = {};

    if (branch) query.branch = branch;
    if (category && category !== 'All Categories') query.category = category;
    if (status && status !== 'All Status') query.status = status.toUpperCase();
    if (search) query.$text = { $search: search };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name')
        .populate('supplier', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query)
    ]);

    return {
      data: items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Product Search screen: text search + filter chips (category, price range, in stock) + sort
   */
  async searchProducts({ q, category, minPrice, maxPrice, inStock, page = 1, limit = 6, sortBy = 'relevance', branch }) {
    const query = {};
    if (branch) query.branch = branch;
    if (q) query.$text = { $search: q };
    if (category) query.category = category;

    if (minPrice || maxPrice) {
      query['pricing.sellingPrice'] = {};
      if (minPrice) query['pricing.sellingPrice'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.sellingPrice'].$lte = Number(maxPrice);
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'price_asc') sort = { 'pricing.sellingPrice': 1 };
    else if (sortBy === 'price_desc') sort = { 'pricing.sellingPrice': -1 };
    else if (sortBy === 'relevance' && q) sort = { score: { $meta: 'textScore' } };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const projection = q ? { score: { $meta: 'textScore' } } : {};

    let items = await Product.find(query, projection)
      .populate('category', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    if (inStock) {
      items = items.filter((p) => p.totalStock > 0);
    }

    const total = await Product.countDocuments(query);

    // "Related Searches" style suggestions: nearby brands/categories sharing text score
    const relatedTags = q
      ? await Product.aggregate([
          { $match: { $text: { $search: q } } },
          { $unwind: '$tags' },
          { $group: { _id: '$tags', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 4 }
        ])
      : [];

    return {
      data: items,
      relatedSearches: relatedTags.map((t) => t._id),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Product Details screen
   */
  async getProductById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('Invalid product ID.');
      err.statusCode = 400;
      throw err;
    }

    const product = await Product.findById(id)
      .populate('category', 'name')
      .populate('supplier', 'name email phone')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('inventory.warehouse', 'name')
      .populate('variants.warehouse', 'name');

    if (!product) {
      const err = new Error('Product not found.');
      err.statusCode = 404;
      throw err;
    }

    return product;
  }

  /**
   * REQ-PROD-004 / Edit Product screen
   * BR: SKU cannot be changed after creation.
   */
  async updateProduct(id, payload, userId) {
    const product = await Product.findById(id);
    if (!product) {
      const err = new Error('Product not found.');
      err.statusCode = 404;
      throw err;
    }

    const data = { ...payload };
    delete data.sku; // immutable

    Object.assign(product, data, { updatedBy: userId });
    await product.save();

    return product;
  }

  /**
   * BR-INV-005: Products cannot be deleted if they have associated sales
   * transactions or pending purchase orders. This is a placeholder guard —
   * wire it up to the Sales/PurchaseOrder models once those modules expose them.
   */
  async deleteProduct(id) {
  const product = await Product.findById(id);
  if (!product) {
    const err = new Error('Product not found.');
    err.statusCode = 404;
    throw err;
  }

  // BR-INV-005: block delete if the product is referenced by any sale
  // or any purchase order that hasn't been fully received.
  const [hasSales, hasOpenPO] = await Promise.all([
    SaleTransaction.exists({ 'items.product': id }),
    PurchaseOrder.exists({ 'items.product': id, status: { $ne: 'FULLY_RECEIVED' } })
  ]);

  if (hasSales || hasOpenPO) {
    const err = new Error(
      'Cannot delete product: it is referenced by existing sales transactions or open purchase orders.'
    );
    err.statusCode = 409; // Conflict
    throw err;
  }

  await product.deleteOne();
  return { deleted: true, id };
}
}

module.exports = new ProductService();
