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
    // Strip database internal / frontend helper properties to prevent immutable update error
    delete updateData._id;
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.__v;

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

  /**
   * Evaluate active discount rules against a cart payload
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async evaluateRules(payload) {
    if (!payload) {
      const err = new Error('Request body is required');
      err.statusCode = 400;
      throw err;
    }

    const { cartTotal, customerType, branchId, purchaseDate, items } = payload;

    if (cartTotal === undefined || cartTotal === null || typeof cartTotal !== 'number' || cartTotal <= 0) {
      const err = new Error('Cart total must be a positive number');
      err.statusCode = 400;
      throw err;
    }

    const mongoose = require('mongoose');

    if (purchaseDate) {
      const date = new Date(purchaseDate);
      if (isNaN(date.getTime())) {
        const err = new Error('Purchase date is invalid');
        err.statusCode = 400;
        throw err;
      }
    }

    if (branchId) {
      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        const err = new Error('Referenced branch ID is invalid');
        err.statusCode = 400;
        throw err;
      }
      const Branch = mongoose.model('Branch');
      const branchExists = await Branch.exists({ _id: branchId });
      if (!branchExists) {
        const err = new Error('Referenced branch does not exist');
        err.statusCode = 400;
        throw err;
      }
    }

    if (items) {
      if (!Array.isArray(items)) {
        const err = new Error('Items must be an array');
        err.statusCode = 400;
        throw err;
      }

      const Category = mongoose.model('Category');
      for (const item of items) {
        if (item.quantity === undefined || item.quantity === null || typeof item.quantity !== 'number' || item.quantity <= 0) {
          const err = new Error('Item quantity must be a positive number');
          err.statusCode = 400;
          throw err;
        }

        if (item.categoryId) {
          if (!mongoose.Types.ObjectId.isValid(item.categoryId)) {
            const err = new Error('Referenced category ID is invalid');
            err.statusCode = 400;
            throw err;
          }
          const catExists = await Category.exists({ _id: item.categoryId });
          if (!catExists) {
            const err = new Error(`Referenced category with ID ${item.categoryId} does not exist`);
            err.statusCode = 400;
            throw err;
          }
        }
      }
    }

    // Fetch all Active discount rules, sorted by priority ASC
    const activeRules = await DiscountRule.find({ status: 'Active' })
      .sort({ priority: 1 })
      .lean();

    const matchedRules = [];
    let totalDiscount = 0;
    const evalDate = purchaseDate ? new Date(purchaseDate) : new Date();

    const Category = mongoose.model('Category');
    const categoryCache = {};

    for (const rule of activeRules) {
      // If we already reached the max discount (cart total), skip remaining rules
      if (totalDiscount >= cartTotal) {
        break;
      }

      const condition = rule.condition || '';
      let isMatch = false;
      let reason = '';

      if (rule.type === 'Cart Total') {
        const cleanCond = condition.replace(/,/g, '');
        const matchNum = cleanCond.match(/(\d+(?:\.\d+)?)/);
        const minVal = matchNum ? parseFloat(matchNum[1]) : 0;
        if (cartTotal >= minVal) {
          isMatch = true;
          reason = `Cart total exceeded Rs. ${minVal.toLocaleString()}`;
        }
      } else if (rule.type === 'Product Category') {
        if (items && items.length > 0) {
          const match = condition.match(/Category:\s*(.+)/i);
          if (match) {
            const targetCategory = match[1].trim();
            // Cache category names
            for (const item of items) {
              if (item.categoryId && !categoryCache[item.categoryId]) {
                const cat = await Category.findById(item.categoryId).lean();
                categoryCache[item.categoryId] = cat ? cat.name : '';
              }
            }
            const matchesCategory = items.some(item => {
              const catName = categoryCache[item.categoryId] || '';
              return String(item.categoryId) === targetCategory || catName.toLowerCase() === targetCategory.toLowerCase();
            });
            if (matchesCategory) {
              isMatch = true;
              reason = `Cart contains items from matching category: ${targetCategory}`;
            }
          }
        }
      } else if (rule.type === 'Customer Type') {
        const match = condition.match(/(?:Customer\s*Type|Customer):\s*(.+)/i);
        const targetType = match ? match[1].trim() : '';
        if (customerType && targetType && customerType.toLowerCase() === targetType.toLowerCase()) {
          isMatch = true;
          reason = `Customer type matches requirement: ${targetType}`;
        } else if (customerType && condition.toLowerCase().includes(customerType.toLowerCase())) {
          isMatch = true;
          reason = `Customer type matches rule condition`;
        }
      } else if (rule.type === 'Quantity Based') {
        if (items && items.length > 0) {
          const minQty = parseInt(condition.replace(/[^0-9]/g, ''), 10) || 0;
          const hasMinQty = items.some(item => item.quantity >= minQty);
          if (hasMinQty) {
            isMatch = true;
            reason = `Cart contains item meeting minimum quantity of ${minQty}`;
          }
        }
      } else if (rule.type === 'Day Based') {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = daysOfWeek[evalDate.getDay()];
        const currentDayShort = currentDay.substring(0, 3);
        const isMatchDay = condition.toLowerCase().includes(currentDay.toLowerCase()) || 
                           condition.toLowerCase().includes(currentDayShort.toLowerCase());
        if (isMatchDay) {
          isMatch = true;
          reason = `Purchase made on ${currentDay}`;
        }
      }

      if (isMatch) {
        // Parse discount value
        const dl = String(rule.discountLimit || '').trim();
        const isPercentage = dl.endsWith('%') || dl.includes('%');
        const cleanDl = dl.replace(/,/g, '');
        const matchDl = cleanDl.match(/(\d+(?:\.\d+)?)/);
        const numericValue = matchDl ? parseFloat(matchDl[1]) : 0;

        let discountApplied = 0;
        if (isPercentage) {
          discountApplied = (cartTotal * numericValue) / 100;
        } else {
          discountApplied = numericValue;
        }

        // Do not allow this discount to exceed remaining cart total
        const remaining = cartTotal - totalDiscount;
        if (discountApplied > remaining) {
          discountApplied = remaining;
        }

        if (discountApplied > 0) {
          totalDiscount += discountApplied;
          matchedRules.push({
            ruleId: rule._id,
            ruleName: rule.name,
            ruleType: rule.type,
            type: rule.type,
            priority: rule.priority,
            discountApplied,
            reason
          });
        }
      }
    }

    const finalAmount = cartTotal - totalDiscount;

    return {
      success: true,
      matchedRules,
      summary: {
        cartTotal,
        totalDiscount,
        finalAmount
      }
    };
  }
}

module.exports = new DiscountRuleService();
