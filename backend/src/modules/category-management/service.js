const Category = require('./model');
const Product = require('../product-management/model');

// ── Helper: product count (handles both old string category and new categoryId) ──
const getProductCount = async (categoryId, categoryName) => {
  return Product.countDocuments({
    $or: [
      { categoryId: categoryId, status: 'ACTIVE' },
      { category: categoryName, status: 'ACTIVE' },
      { category: categoryId.toString(), status: 'ACTIVE' },
    ],
  });
};

// ── Fetch All (list + filters + pagination) ───────────────────────────────────
const fetchAll = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    parentId,
    isActive = true,
  } = query;

  const filter = { isActive: isActive === 'false' ? false : Boolean(isActive) };

  if (parentId !== undefined) {
    filter.parentId = parentId === 'null' ? null : parentId;
  }

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [categories, total] = await Promise.all([
    Category.find(filter)
      .populate('parentId', 'name code')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ sortOrder: 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Category.countDocuments(filter),
  ]);

  // Add product count per category — handles both old (string) and new (ObjectId) schemas
  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const productCount = await getProductCount(cat._id, cat.name);
      return { ...cat.toObject(), productCount };
    })
  );

  return {
    data: categoriesWithCount,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

// ── Fetch Single Category Detail ──────────────────────────────────────────────
const fetchDetails = async (id) => {
  const category = await Category.findById(id)
    .populate('parentId', 'name code')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!category) return null;

  const [children, siblings, totalProducts] = await Promise.all([
    // Direct sub-categories under this category
    Category.find({ parentId: id, isActive: true })
      .select('name code isActive sortOrder icon')
      .sort({ sortOrder: 1 }),

    // Sibling sub-categories sharing the same parent
    category.parentId
      ? Category.find({
          parentId: category.parentId,
          _id: { $ne: id },
          isActive: true,
        }).select('name code isActive sortOrder')
      : Promise.resolve([]),

    // Product count — handles both old (string) and new (ObjectId) schemas
    getProductCount(id, category.name),
  ]);

  const stats = {
    totalProducts,
    stockUnits: 0,       // Wire to Inventory module when available
    inventoryValue: 0,   // Wire to Inventory module when available
    lowStockItems: 0,    // Wire to Inventory module when available
  };

  return { category, children, siblings, stats };
};

// ── Create ────────────────────────────────────────────────────────────────────
const create = async (data) => {
  // Duplicate name check under same parent
  const existing = await Category.findOne({
    name: { $regex: new RegExp(`^${data.name}$`, 'i') },
    parentId: data.parentId || null,
    isActive: true,
  });

  if (existing) {
    throw new Error('Category with this name already exists under the same parent');
  }

  const category = await Category.create(data);

  return Category.findById(category._id)
    .populate('parentId', 'name code')
    .populate('createdBy', 'firstName lastName email');
};

// ── Update ────────────────────────────────────────────────────────────────────
const update = async (id, data, userId) => {
  const category = await Category.findById(id);
  if (!category) throw new Error('Category not found');

  // Circular parent check
  if (data.parentId && data.parentId.toString() === id.toString()) {
    throw new Error('Category cannot be its own parent');
  }

  // Duplicate name check (excluding self)
  if (data.name && data.name !== category.name) {
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${data.name}$`, 'i') },
      parentId: data.parentId !== undefined ? data.parentId : category.parentId,
      isActive: true,
      _id: { $ne: id },
    });
    if (existing) {
      throw new Error('Category with this name already exists under the same parent');
    }
  }

  const updated = await Category.findByIdAndUpdate(
    id,
    { ...data, updatedBy: userId },
    { new: true, runValidators: true }
  )
    .populate('parentId', 'name code')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  return updated;
};

// ── Soft Delete ───────────────────────────────────────────────────────────────
const softDelete = async (id, userId) => {
  const category = await Category.findById(id);
  if (!category) throw new Error('Category not found');

  // Block if active children exist (BR-INV-005)
  const children = await Category.find({ parentId: id, isActive: true });
  if (children.length > 0) {
    throw new Error(
      `Cannot delete category with ${children.length} active sub-categories. Please deactivate them first.`
    );
  }

  category.isActive = false;
  category.updatedBy = userId;
  await category.save();

  return { message: 'Category deleted successfully', id: category._id };
};

// ── Category Tree ─────────────────────────────────────────────────────────────
const fetchTree = async () => {
  const categories = await Category.find({ isActive: true })
    .populate('createdBy', 'firstName lastName email')
    .sort({ sortOrder: 1, name: 1 });

  const buildTree = (parentId = null) => {
    return categories
      .filter((c) => {
        const cParent = c.parentId ? c.parentId.toString() : null;
        const target = parentId ? parentId.toString() : null;
        return cParent === target;
      })
      .map((c) => ({
        ...c.toObject(),
        children: buildTree(c._id),
      }));
  };

  return buildTree(null);
};

module.exports = {
  fetchAll,
  fetchDetails,
  create,
  update,
  softDelete,
  fetchTree,
};