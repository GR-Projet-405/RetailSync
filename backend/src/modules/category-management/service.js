const Category = require('./model');

class CategoryService {
  /**
   * Returns categories. Supports both:
   *  - unpaginated "give me everything" mode (used by dropdowns) when no
   *    page/limit passed, or when limit is large (frontend passes limit=200)
   *  - the standard paginated mode for a future Category List screen
   */
  async getCategories({ page, limit, status, search } = {}) {
    const query = {};
    if (status && status !== 'All Status') query.status = status.toUpperCase();
    if (search) query.name = { $regex: search, $options: 'i' };

    if (!page && !limit) {
      const items = await Category.find(query).sort({ name: 1 });
      return { data: items };
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Category.find(query).populate('parentCategory', 'name').sort({ name: 1 }).skip(skip).limit(limitNum),
      Category.countDocuments(query)
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

  async getCategoryById(id) {
    const category = await Category.findById(id).populate('parentCategory', 'name');
    if (!category) {
      const err = new Error('Category not found.');
      err.statusCode = 404;
      throw err;
    }
    return category;
  }

  async createCategory(payload, userId) {
    const existing = await Category.findOne({ name: payload.name.trim() });
    if (existing) {
      const err = new Error(`Category '${payload.name}' already exists.`);
      err.statusCode = 409;
      throw err;
    }

    return Category.create({
      ...payload,
      createdBy: userId,
      updatedBy: userId
    });
  }

  async updateCategory(id, payload, userId) {
    const category = await Category.findById(id);
    if (!category) {
      const err = new Error('Category not found.');
      err.statusCode = 404;
      throw err;
    }

    Object.assign(category, payload, { updatedBy: userId });
    await category.save();
    return category;
  }

  async deleteCategory(id) {
    const category = await Category.findById(id);
    if (!category) {
      const err = new Error('Category not found.');
      err.statusCode = 404;
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

    await category.deleteOne();
    return { deleted: true, id };
  }
}

module.exports = new CategoryService();
