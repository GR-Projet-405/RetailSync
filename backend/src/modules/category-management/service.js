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

class CategoryService {
  /**
   * Returns categories. Supports both:
   *  - unpaginated "give me everything" mode (used by dropdowns) when no
   *    page/limit passed, or when limit is large (frontend passes limit=200)
   *  - the standard paginated mode for the Category List screen
   */
  async getCategories({ page, limit, status, search, isActive } = {}) {
    const query = {};
    if (status && status !== 'All Status') query.status = status.toUpperCase();
    if (search) query.name = { $regex: search, $options: 'i' };
    // isActive filter (from Category List UI)
    if (isActive !== undefined) {
      query.isActive = isActive === 'false' ? false : Boolean(isActive);
    }

    if (!page && !limit) {
      const items = await Category.find(query)
        .populate('parentCategory', 'name code')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .sort({ sortOrder: 1, name: 1 });
      
      const itemsWithCount = await Promise.all(
        items.map(async (cat) => {
          const productCount = await getProductCount(cat._id, cat.name);
          return { ...cat.toObject(), productCount };
        })
      );
      return { data: itemsWithCount };
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Category.find(query)
        .populate('parentCategory', 'name code')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .sort({ sortOrder: 1, name: 1 })
        .skip(skip)
        .limit(limitNum),
      Category.countDocuments(query)
    ]);

    const itemsWithCount = await Promise.all(
      items.map(async (cat) => {
        const productCount = await getProductCount(cat._id, cat.name);
        return { ...cat.toObject(), productCount };
      })
    );

    return {
      data: itemsWithCount,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  async getCategoryById(id) {
    const category = await Category.findById(id)
      .populate('parentCategory', 'name code')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!category) {
      const err = new Error('Category not found.');
      err.statusCode = 404;
      throw err;
    }

    const [children, siblings, totalProducts] = await Promise.all([
      // Direct sub-categories under this category
      Category.find({ parentCategory: id, isActive: true })
        .select('name code isActive sortOrder icon')
        .sort({ sortOrder: 1 }),
      // Sibling sub-categories sharing the same parent
      category.parentCategory
        ? Category.find({
            parentCategory: category.parentCategory,
            _id: { $ne: id },
            isActive: true
          }).select('name code isActive sortOrder')
        : Promise.resolve([]),
      // Product count — handles both old (string) and new (ObjectId) schemas
      getProductCount(id, category.name)
    ]);

    const stats = {
      totalProducts,
      stockUnits: 0,       // Wire to Inventory module when available
      inventoryValue: 0,   // Wire to Inventory module when available
      lowStockItems: 0,    // Wire to Inventory module when available
    };

    return { category, children, siblings, stats };
  }

  async createCategory(payload, userId) {
    // Normalization of parentId -> parentCategory
    if (payload.parentId !== undefined) {
      payload.parentCategory = payload.parentId === 'null' || payload.parentId === '' ? null : payload.parentId;
    }

    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${payload.name?.trim()}$`, 'i') },
      parentCategory: payload.parentCategory || null,
      isActive: true
    });
    if (existing) {
      const err = new Error('Category with this name already exists under the same parent');
      err.statusCode = 409;
      throw err;
    }

    const category = await Category.create({
      ...payload,
      createdBy: userId,
      updatedBy: userId
    });

    return Category.findById(category._id)
      .populate('parentCategory', 'name code')
      .populate('createdBy', 'firstName lastName email');
  }

  async updateCategory(id, payload, userId) {
    const category = await Category.findById(id);
    if (!category) {
      const err = new Error('Category not found.');
      err.statusCode = 404;
      throw err;
    }

    // Normalization of parentId -> parentCategory
    if (payload.parentId !== undefined) {
      payload.parentCategory = payload.parentId === 'null' || payload.parentId === '' ? null : payload.parentId;
    }

    // Circular parent check
    if (payload.parentCategory && payload.parentCategory.toString() === id.toString()) {
      const err = new Error('Category cannot be its own parent.');
      err.statusCode = 400;
      throw err;
    }

    // Duplicate name check (excluding self)
    const nameToCheck = payload.name ? payload.name.trim() : category.name;
    const parentToCheck = payload.parentCategory !== undefined ? payload.parentCategory : category.parentCategory;

    if (payload.name || payload.parentCategory !== undefined) {
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${nameToCheck}$`, 'i') },
        parentCategory: parentToCheck || null,
        isActive: true,
        _id: { $ne: id }
      });
      if (existing) {
        const err = new Error('Category with this name already exists under the same parent');
        err.statusCode = 409;
        throw err;
      }
    }

    Object.assign(category, payload, { updatedBy: userId });
    await category.save();

    return Category.findById(id)
      .populate('parentCategory', 'name code')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  /**
   * Soft-delete: deactivates the category instead of hard-deleting.
   * Guards: cannot delete if active sub-categories exist.
   */
  async deleteCategory(id, userId) {
    const category = await Category.findById(id);
    if (!category) {
      const err = new Error('Category not found.');
      err.statusCode = 404;
      throw err;
    }

    // Guard: cannot delete if active sub-categories exist
    const activeChildren = await Category.countDocuments({ parentCategory: id, isActive: true });
    if (activeChildren > 0) {
      const err = new Error(
        `Cannot delete category with ${activeChildren} active sub-categories. Please deactivate them first.`
      );
      err.statusCode = 409;
      throw err;
    }

    // Guard: don't delete a category that products still reference.
    const inUse = await Product.exists({
      $or: [
        { categoryId: id },
        { category: category.name },
        { category: id.toString() }
      ]
    });
    if (inUse) {
      const err = new Error('This category is assigned to one or more products and cannot be deleted.');
      err.statusCode = 409;
      throw err;
    }

    // Soft-delete
    category.isActive = false;
    category.status = 'INACTIVE';
    if (userId) {
      category.updatedBy = userId;
    }
    await category.save();

    return { deleted: true, id, message: 'Category deactivated successfully.' };
  }

  /**
   * Cherry-picked: recursive category tree for the hierarchy view.
   */
  async fetchTree() {
    const categories = await Category.find({ isActive: true })
      .populate('createdBy', 'firstName lastName email')
      .sort({ sortOrder: 1, name: 1 });

    const buildTree = (parentId = null) => {
      return categories
        .filter((c) => {
          const cParent = c.parentCategory ? c.parentCategory.toString() : null;
          const target = parentId ? parentId.toString() : null;
          return cParent === target;
        })
        .map((c) => ({
          ...c.toObject(),
          children: buildTree(c._id)
        }));
    };

    return buildTree(null);
  }
}

module.exports = new CategoryService();
