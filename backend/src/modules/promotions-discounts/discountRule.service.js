const DiscountRule = require('./discountRule.model');

class DiscountRuleService {
  /**
   * Create a new discount rule
   * @param {Object} ruleData 
   * @returns {Promise<Object>}
   */
  async createDiscountRule(ruleData) {
    // If priority is not supplied, assign next sequential value
    if (ruleData.priority === undefined || ruleData.priority === null) {
      const maxRule = await DiscountRule.findOne().sort({ priority: -1 }).select('priority').lean();
      ruleData.priority = maxRule ? maxRule.priority + 1 : 1;
    }

    const rule = new DiscountRule(ruleData);
    await rule.save();

    return await DiscountRule.findById(rule._id)
      .populate('createdBy', 'firstName lastName username')
      .lean();
  }

  /**
   * Get filtered, paginated list of discount rules, sorted by priority weight
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async getDiscountRules({ search, type, status, page = 1, limit = 10 } = {}) {
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (type && type !== 'All') {
      // Map custom frontend category tabs if needed, otherwise query directly
      if (type === 'Promotion Rules') {
        query.$or = [{ type: 'Day Based' }, { type: 'Quantity Based' }];
      } else if (type === 'Coupon Rules') {
        query.type = 'Customer Type';
      } else if (type === 'Cart Rules') {
        query.$or = [{ type: 'Cart Total' }, { type: 'Product Category' }];
      } else {
        query.type = type;
      }
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [rules, total] = await Promise.all([
      DiscountRule.find(query)
        .populate('createdBy', 'firstName lastName username')
        .sort({ priority: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      DiscountRule.countDocuments(query),
    ]);

    return {
      rules,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single discount rule by ID
   * @param {String} id 
   * @returns {Promise<Object>}
   */
  async getDiscountRuleById(id) {
    const rule = await DiscountRule.findById(id)
      .populate('createdBy', 'firstName lastName username')
      .lean();

    if (!rule) {
      const err = new Error('Discount rule not found');
      err.statusCode = 404;
      throw err;
    }

    return rule;
  }

  /**
   * Update fields on an existing rule
   * @param {String} id 
   * @param {Object} updateData 
   * @returns {Promise<Object>}
   */
  async updateDiscountRule(id, updateData) {
    const rule = await DiscountRule.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName username')
      .lean();

    if (!rule) {
      const err = new Error('Discount rule not found');
      err.statusCode = 404;
      throw err;
    }

    return rule;
  }

  /**
   * Delete a discount rule and auto-re-index remaining priorities
   * @param {String} id 
   * @returns {Promise<Object>}
   */
  async deleteDiscountRule(id) {
    const result = await DiscountRule.findByIdAndDelete(id);
    if (!result) {
      const err = new Error('Discount rule not found');
      err.statusCode = 404;
      throw err;
    }

    // Sequentially normalize priority fields to remain gapless
    const remainingRules = await DiscountRule.find().sort({ priority: 1 });
    for (let i = 0; i < remainingRules.length; i++) {
      remainingRules[i].priority = i + 1;
      await remainingRules[i].save();
    }

    return { success: true, message: 'Discount rule deleted and priorities re-indexed' };
  }

  /**
   * Reorder execution priorities in bulk
   * @param {Array<String>} ruleIds 
   * @returns {Promise<Object>}
   */
  async reorderRules(ruleIds) {
    if (!Array.isArray(ruleIds)) {
      const err = new Error('Invalid input, ruleIds must be an array');
      err.statusCode = 400;
      throw err;
    }

    const bulkOps = ruleIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { priority: index + 1 } }
      }
    }));

    if (bulkOps.length > 0) {
      await DiscountRule.bulkWrite(bulkOps);
    }

    return { success: true, message: 'Priorities reordered successfully' };
  }
}

module.exports = new DiscountRuleService();
