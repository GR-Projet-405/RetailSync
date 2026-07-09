const Coupon = require('./coupon.model');

class CouponService {
  /**
   * Helper to validate that endDate is not before startDate
   * @param {Date|String} startDate 
   * @param {Date|String} endDate 
   * @private
   */
  _validateDates(startDate, endDate) {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        const err = new Error('End date cannot be earlier than start date');
        err.statusCode = 400;
        throw err;
      }
    }
  }

  /**
   * Create a new checkout coupon
   * @param {Object} couponData 
   * @returns {Promise<Object>}
   */
  async createCoupon(couponData) {
    this._validateDates(couponData.startDate, couponData.endDate);

    const coupon = new Coupon(couponData);
    await coupon.save();

    return await Coupon.findById(coupon._id)
      .populate('branchId', 'name code')
      .populate('promotionId', 'name type discount')
      .populate('createdBy', 'firstName lastName username')
      .lean();
  }

  /**
   * Fetch filtered, paginated list of coupons
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async getCoupons({ search, status, branchId, page = 1, limit = 10 } = {}) {
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (branchId && branchId !== 'All Branches') {
      query.branchId = branchId;
    }

    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      Coupon.find(query)
        .populate('branchId', 'name code')
        .populate('promotionId', 'name type discount')
        .populate('createdBy', 'firstName lastName username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Coupon.countDocuments(query),
    ]);

    return {
      coupons,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single coupon details by ID
   * @param {String} id 
   * @returns {Promise<Object>}
   */
  async getCouponById(id) {
    const coupon = await Coupon.findById(id)
      .populate('branchId', 'name code')
      .populate('promotionId', 'name type discount')
      .populate('createdBy', 'firstName lastName username')
      .lean();

    if (!coupon) {
      const err = new Error('Coupon not found');
      err.statusCode = 404;
      throw err;
    }

    return coupon;
  }

  /**
   * Update an existing coupon
   * @param {String} id 
   * @param {Object} updateData 
   * @returns {Promise<Object>}
   */
  async updateCoupon(id, updateData) {
    const existing = await Coupon.findById(id);
    if (!existing) {
      const err = new Error('Coupon not found');
      err.statusCode = 404;
      throw err;
    }

    // Combine updateData values with existing values for date validation
    const start = updateData.startDate ? new Date(updateData.startDate) : existing.startDate;
    const end = updateData.endDate ? new Date(updateData.endDate) : existing.endDate;
    this._validateDates(start, end);

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('branchId', 'name code')
      .populate('promotionId', 'name type discount')
      .populate('createdBy', 'firstName lastName username')
      .lean();

    return coupon;
  }

  /**
   * Delete a coupon
   * @param {String} id 
   * @returns {Promise<Object>}
   */
  async deleteCoupon(id) {
    const result = await Coupon.findByIdAndDelete(id);
    if (!result) {
      const err = new Error('Coupon not found');
      err.statusCode = 404;
      throw err;
    }
    return { success: true, message: 'Coupon deleted successfully' };
  }
}

module.exports = new CouponService();
