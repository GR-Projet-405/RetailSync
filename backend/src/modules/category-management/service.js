const Category = require('./model');

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
      const items = await Category.find(query).sort({ sortOrder: 1, name: 1 });
      return { data: items };
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Category.find(query)
        .populate('parentCategory', 'name code')
        .sort({ sortOrder: 1, name: 1 })
        .skip(skip)
        .limit(limitNum),
      Category.countDocuments(query)
    ]);

    return {
      data: items,
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
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!category) {
      const err = new Error('Category not found.');
      err.statusCode = 404;
      throw err;
    }

    // Cherry-picked: also return children and siblings for the detail view
    const [children, siblings] = await Promise.all([
      Category.find({ parentCategory: id, isActive: true })
        .select('name code isActive sortOrder')
        .sort({ sortOrder: 1 }),
      category.parentCategory
        ? Category.find({
            parentCategory: category.parentCategory,
            _id: { $ne: id },
            isActive: true
          }).select('name code isActive sortOrder')
        : Promise.resolve([])
    ]);

    return { category, children, siblings };
  }

  async createCategory(payload, userId) {
    const existing = await Category.findOne({ name: payload.name.trim() });
    if (existing) {
      const err = new Error(`Category '${payload.name}' already exists.`);
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
      .populate('createdBy', 'firstName lastName');
  }

  async updateCategory(id, payload, userId) {
    const category = await Category.findById(id);
    if (!category) {
      const err = new Error('Category not found.');
      err.statusCode = 404;
      throw err;
    }

    // Circular parent check
    if (payload.parentCategory && payload.parentCategory.toString() === id.toString()) {
      const err = new Error('Category cannot be its own parent.');
      err.statusCode = 400;
      throw err;
    }

    // Duplicate name check (excluding self)
    if (payload.name && payload.name !== category.name) {
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${payload.name}$`, 'i') },
        _id: { $ne: id }
      });
      if (existing) {
        const err = new Error(`Category '${payload.name}' already exists.`);
        err.statusCode = 409;
        throw err;
      }
    }

    Object.assign(category, payload, { updatedBy: userId });
    await category.save();
    return category;
  }

  /**
   * Soft-delete: deactivates the category instead of hard-deleting.
   * Guards: cannot delete if active sub-categories exist.
   * (Cherry-picked from Product Management branch — safer than hard delete)
   */
  async deleteCategory(id) {
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
    const Product = require('../product-management/model');
    const inUse = await Product.exists({ category: id });
    if (inUse) {
      const err = new Error('This category is assigned to one or more products and cannot be deleted.');
      err.statusCode = 409;
      throw err;
    }

    // Soft-delete
    category.isActive = false;
    category.status = 'INACTIVE';
    category.updatedBy = id; // will be overridden by caller context if userId passed
    await category.save();

    return { deleted: true, id, message: 'Category deactivated successfully.' };
  }

  /**
   * Cherry-picked: recursive category tree for the hierarchy view.
   */
  async fetchTree() {
    const categories = await Category.find({ isActive: true })
      .populate('createdBy', 'firstName lastName')
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
