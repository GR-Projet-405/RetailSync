const Promotion = require('./promotion.model');

class PromotionsDiscountsPageService {
  /**
   * Fetch boilerplate details (keeping original skeleton method)
   */
  async fetchDetails() {
    return {
      module: 'Promotions & Discounts',
      status: 'Active'
    };
  }

  /**
   * Helper method to calculate status based on date bounds
   */
  calculateStatus(status, startDate, endDate) {
    if (status === 'Draft') return 'Draft';
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (today < start) return 'Scheduled';
    if (start <= today && today <= end) return 'Active';
    return 'Expired';
  }

  /**
   * Validate business rules for promotions
   * @private
   */
  async _validatePromotionBusinessRules(data, existingId = null) {
    const mongoose = require('mongoose');

    // 1. Ensure startDate < endDate
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end <= start) {
        const err = new Error('End date must be after the start date');
        err.statusCode = 400;
        throw err;
      }
    }

    // 2. Ensure discount percentages don't exceed 100%
    const rawVal = parseFloat(String(data.discount || '').replace(/^[A-Za-z.\s]+/, '').replace(/[^\d.]/g, '')) || 0;
    if (data.type === 'Percentage' && rawVal > 100) {
      const err = new Error('Discount percentage cannot exceed 100%');
      err.statusCode = 400;
      throw err;
    }

    // 3. Ensure fixed discounts don't exceed the minimum purchase amount (minOrderValue)
    if (data.type === 'Fixed Amount' && rawVal > (data.minOrderValue || 0)) {
      const err = new Error('Fixed discount amount cannot exceed the minimum order value');
      err.statusCode = 400;
      throw err;
    }

    // 4. Validate referenced branchId
    if (data.branchId) {
      if (!mongoose.Types.ObjectId.isValid(data.branchId)) {
        const err = new Error('Referenced branch ID is invalid');
        err.statusCode = 400;
        throw err;
      }
      const Branch = mongoose.model('Branch');
      const branchExists = await Branch.exists({ _id: data.branchId });
      if (!branchExists) {
        const err = new Error('Referenced branch does not exist');
        err.statusCode = 400;
        throw err;
      }
    }

    // 5. Validate referenced categoryIds exist
    if (data.categories && data.categories.length > 0) {
      const Category = mongoose.model('Category');
      for (const catId of data.categories) {
        // Resolve object/id references safely
        const actualCatId = catId._id || catId;
        if (!mongoose.Types.ObjectId.isValid(actualCatId)) {
          const err = new Error('Referenced category ID is invalid');
          err.statusCode = 400;
          throw err;
        }
        const catExists = await Category.exists({ _id: actualCatId });
        if (!catExists) {
          const err = new Error(`Referenced category does not exist`);
          err.statusCode = 400;
          throw err;
        }
      }
    }
  }

  /**
   * Synchronize statuses in MongoDB for all non-Draft promotions based on current time
   */
  async updateStatusByDates() {
    const today = new Date();
    
    // 1. Scheduled: Start date is in the future
    await Promotion.updateMany(
      { status: { $ne: 'Draft' }, startDate: { $gt: today } },
      { $set: { status: 'Scheduled' } }
    );
    
    // 2. Active: Current time is between start and end date
    await Promotion.updateMany(
      { status: { $ne: 'Draft' }, startDate: { $lte: today }, endDate: { $gte: today } },
      { $set: { status: 'Active' } }
    );
    
    // 3. Expired: End date has passed
    await Promotion.updateMany(
      { status: { $ne: 'Draft' }, endDate: { $lt: today } },
      { $set: { status: 'Expired' } }
    );
  }

  /**
   * Create a new promotion record
   * @param {Object} promotionData 
   * @returns {Promise<Object>}
   */
  async createPromotion(promotionData) {
    await this._validatePromotionBusinessRules(promotionData);
    if (promotionData.status !== 'Draft') {
      promotionData.status = this.calculateStatus('Published', promotionData.startDate, promotionData.endDate);
    }
    const promotion = new Promotion(promotionData);
    await promotion.save();
    return await Promotion.findById(promotion._id)
      .populate('branchId', 'name code')
      .populate('categories', 'name')
      .populate('createdBy', 'firstName lastName username')
      .lean();
  }

  /**
   * Get filtered, paginated promotions
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async getPromotions({ search, status, branchId, page = 1, limit = 10 } = {}) {
    await this.updateStatusByDates();
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (branchId && branchId !== 'All Branches') {
      query.branchId = branchId;
    }

    const skip = (page - 1) * limit;

    const [promotions, total] = await Promise.all([
      Promotion.find(query)
        .populate('branchId', 'name code')
        .populate('categories', 'name')
        .populate('createdBy', 'firstName lastName username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Promotion.countDocuments(query),
    ]);

    return {
      promotions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single promotion by ID
   * @param {String} id 
   * @returns {Promise<Object>}
   */
  async getPromotionById(id) {
    await this.updateStatusByDates();
    const promotion = await Promotion.findById(id)
      .populate('branchId', 'name code')
      .populate('categories', 'name')
      .populate('createdBy', 'firstName lastName username')
      .lean();

    if (!promotion) {
      const err = new Error('Promotion not found');
      err.statusCode = 404;
      throw err;
    }

    return promotion;
  }

  /**
   * Update an existing promotion
   * @param {String} id 
   * @param {Object} updateData 
   * @returns {Promise<Object>}
   */
  async updatePromotion(id, updateData) {
    const current = await Promotion.findById(id);
    if (!current) {
      const err = new Error('Promotion not found');
      err.statusCode = 404;
      throw err;
    }

    // Merge current and updateData for full validation
    const merged = {
      startDate: updateData.startDate !== undefined ? updateData.startDate : current.startDate,
      endDate: updateData.endDate !== undefined ? updateData.endDate : current.endDate,
      discount: updateData.discount !== undefined ? updateData.discount : current.discount,
      type: updateData.type !== undefined ? updateData.type : current.type,
      minOrderValue: updateData.minOrderValue !== undefined ? updateData.minOrderValue : current.minOrderValue,
      branchId: updateData.branchId !== undefined ? updateData.branchId : current.branchId,
      categories: updateData.categories !== undefined ? updateData.categories : current.categories,
    };
    await this._validatePromotionBusinessRules(merged, id);

    const targetStatus = updateData.status !== undefined ? updateData.status : current.status;
    const targetStart = updateData.startDate !== undefined ? updateData.startDate : current.startDate;
    const targetEnd = updateData.endDate !== undefined ? updateData.endDate : current.endDate;

    if (targetStatus !== 'Draft') {
      updateData.status = this.calculateStatus('Published', targetStart, targetEnd);
    } else {
      updateData.status = 'Draft';
    }

    const promotion = await Promotion.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('branchId', 'name code')
      .populate('categories', 'name')
      .populate('createdBy', 'firstName lastName username')
      .lean();

    if (!promotion) {
      const err = new Error('Promotion not found');
      err.statusCode = 404;
      throw err;
    }

    return promotion;
  }

  /**
   * Delete a promotion record
   * @param {String} id 
   * @returns {Promise<Object>}
   */
  async deletePromotion(id) {
    const result = await Promotion.findByIdAndDelete(id);
    if (!result) {
      const err = new Error('Promotion not found');
      err.statusCode = 404;
      throw err;
    }
    return { success: true, message: 'Promotion deleted successfully' };
  }

  /**
   * Retrieve aggregated promotions statistics for dashboards
   * @param {String} branchId 
   * @returns {Promise<Object>}
   */
  async getPromotionStats(branchId) {
    await this.updateStatusByDates();
    const query = {};
    if (branchId && branchId !== 'All Branches') {
      query.branchId = branchId;
    }

    const activeQuery = { ...query, status: 'Active' };

    const [activeCount, statsResult] = await Promise.all([
      Promotion.countDocuments(activeQuery),
      Promotion.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$revenue' },
            totalOrders: { $sum: '$ordersCount' },
            totalUsages: { $sum: '$usagesCount' }
          }
        }
      ])
    ]);

    const stats = statsResult[0] || { totalRevenue: 0, totalOrders: 0, totalUsages: 0 };

    return {
      activePromotions: activeCount,
      totalCouponUsed: stats.totalUsages,
      revenueGenerated: stats.totalRevenue,
      ordersInfluenced: stats.totalOrders
    };
  }

  /**
   * Retrieve monthly promotions analytics aggregated from database
   * @returns {Promise<Object>}
   */
  async getPromotionAnalytics() {
    await this.updateStatusByDates();
    const result = await Promotion.aggregate([
      {
        $match: {
          startDate: { $ne: null }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$startDate' },
            month: { $month: '$startDate' }
          },
          totalRevenue: { $sum: '$revenue' },
          totalOrders: { $sum: '$ordersCount' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const labels = [];
    const revenue = [];
    const orders = [];

    result.forEach(item => {
      if (item._id && item._id.month) {
        const monthIndex = item._id.month - 1;
        const label = monthNames[monthIndex] || `Month ${item._id.month}`;
        labels.push(label);
        revenue.push(item.totalRevenue || 0);
        orders.push(item.totalOrders || 0);
      }
    });

    if (labels.length === 0) {
      return {
        labels: ["Jan", "Feb", "Mar", "Apr"],
        revenue: [0, 0, 0, 0],
        orders: [0, 0, 0, 0]
      };
    }

    return { labels, revenue, orders };
  }
}

module.exports = new PromotionsDiscountsPageService();
