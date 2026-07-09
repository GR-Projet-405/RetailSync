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
   * Create a new promotion record
   * @param {Object} promotionData 
   * @returns {Promise<Object>}
   */
  async createPromotion(promotionData) {
    const promotion = new Promotion(promotionData);
    await promotion.save();
    return await Promotion.findById(promotion._id)
      .populate('branchId', 'name code')
      // .populate('categories', 'name')
      .populate('createdBy', 'firstName lastName username')
      .lean();
  }

  /**
   * Get filtered, paginated promotions
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async getPromotions({ search, status, branchId, page = 1, limit = 10 } = {}) {
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
        // .populate('categories', 'name')
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
    const promotion = await Promotion.findById(id)
      .populate('branchId', 'name code')
      // .populate('categories', 'name')
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
    const promotion = await Promotion.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('branchId', 'name code')
      // .populate('categories', 'name')
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
