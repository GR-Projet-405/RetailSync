const Coupon = require('./coupon.model');

class CouponService {
  /**
   * Helper to validate coupon business rules
   * @private
   */
  async _validateCouponBusinessRules(data, existingId = null) {
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

    // 2. Prevent duplicate coupon codes globally
    if (data.code) {
      const query = {
        code: data.code.toUpperCase()
      };
      if (existingId) {
        query._id = { $ne: existingId };
      }
      const duplicate = await Coupon.findOne(query);
      if (duplicate) {
        const err = new Error('Coupon code is already in use');
        err.statusCode = 400;
        throw err;
      }
    }

    // 3. Ensure discount percentages don't exceed 100%
    if (data.discountType === 'Percentage' && data.discountValue > 100) {
      const err = new Error('Discount percentage cannot exceed 100%');
      err.statusCode = 400;
      throw err;
    }

    // 4. Ensure fixed discounts don't exceed the minimum purchase amount
    if (data.discountType === 'Fixed Amount' && data.discountValue > (data.minPurchaseAmount || 0)) {
      const err = new Error('Fixed discount amount cannot exceed the minimum purchase amount');
      err.statusCode = 400;
      throw err;
    }

    // 5. Validate referenced branchId
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

    // 6. Validate referenced promotionId
    if (data.promotionId) {
      if (!mongoose.Types.ObjectId.isValid(data.promotionId)) {
        const err = new Error('Referenced promotion ID is invalid');
        err.statusCode = 400;
        throw err;
      }
      const Promotion = mongoose.model('Promotion');
      const promo = await Promotion.findById(data.promotionId).lean();
      if (!promo) {
        const err = new Error('Referenced promotion does not exist');
        err.statusCode = 400;
        throw err;
      }

      // Check dates if coupon dates and promotion dates are supplied
      if (data.startDate && promo.startDate) {
        const promoStart = new Date(promo.startDate);
        const couponStart = new Date(data.startDate);

        const pStart = new Date(promoStart.getFullYear(), promoStart.getMonth(), promoStart.getDate());
        const cStart = new Date(couponStart.getFullYear(), couponStart.getMonth(), couponStart.getDate());

        if (cStart < pStart) {
          const err = new Error(`Coupon Start Date (${cStart.toLocaleDateString()}) cannot be earlier than the Promotion Start Date (${pStart.toLocaleDateString()})`);
          err.statusCode = 400;
          throw err;
        }
      }

      if (data.endDate && promo.endDate) {
        const promoEnd = new Date(promo.endDate);
        const couponEnd = new Date(data.endDate);

        const pEnd = new Date(promoEnd.getFullYear(), promoEnd.getMonth(), promoEnd.getDate());
        const cEnd = new Date(couponEnd.getFullYear(), couponEnd.getMonth(), couponEnd.getDate());

        if (cEnd > pEnd) {
          const err = new Error(`Coupon End Date (${cEnd.toLocaleDateString()}) cannot be later than the Promotion End Date (${pEnd.toLocaleDateString()})`);
          err.statusCode = 400;
          throw err;
        }
      }
    }
  }

  /**
   * Synchronize coupon statuses based on date bounds and usage limits
   */
  async updateCouponStatusesByDates() {
    const today = new Date();

    // 1. Expire coupons automatically if currentDate > endDate
    await Coupon.updateMany(
      { status: { $ne: 'Expired' }, endDate: { $lt: today } },
      { $set: { status: 'Expired' } }
    );

    // 2. Expire coupons automatically when usage limit is reached
    await Coupon.updateMany(
      {
        status: { $ne: 'Expired' },
        usageLimit: { $ne: null },
        $expr: { $gte: ['$usageCount', '$usageLimit'] }
      },
      { $set: { status: 'Expired' } }
    );

    // 3. Activate coupons automatically if current date is between startDate and endDate
    // and usage limit has not been exceeded, unless paused
    await Coupon.updateMany(
      {
        status: { $nin: ['Paused', 'Active'] },
        startDate: { $lte: today },
        endDate: { $gte: today },
        $or: [
          { usageLimit: null },
          { $expr: { $lt: ['$usageCount', '$usageLimit'] } }
        ]
      },
      { $set: { status: 'Active' } }
    );
  }

  /**
   * Create a new checkout coupon
   * @param {Object} couponData 
   * @returns {Promise<Object>}
   */
  async createCoupon(couponData) {
    await this._validateCouponBusinessRules(couponData);

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
    await this.updateCouponStatusesByDates();
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
    await this.updateCouponStatusesByDates();
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

    // Combine updateData values with existing values for validation
    const merged = {
      code: updateData.code !== undefined ? updateData.code : existing.code,
      status: updateData.status !== undefined ? updateData.status : existing.status,
      startDate: updateData.startDate !== undefined ? updateData.startDate : existing.startDate,
      endDate: updateData.endDate !== undefined ? updateData.endDate : existing.endDate,
      discountType: updateData.discountType !== undefined ? updateData.discountType : existing.discountType,
      discountValue: updateData.discountValue !== undefined ? updateData.discountValue : existing.discountValue,
      minPurchaseAmount: updateData.minPurchaseAmount !== undefined ? updateData.minPurchaseAmount : existing.minPurchaseAmount,
      branchId: updateData.branchId !== undefined ? updateData.branchId : existing.branchId,
      promotionId: updateData.promotionId !== undefined ? updateData.promotionId : existing.promotionId,
    };
    await this._validateCouponBusinessRules(merged, id);

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

  /**
   * Validate a coupon code based on rules
   * @param {String} code 
   * @param {String} branchId 
   * @param {Number} orderAmount 
   * @returns {Promise<Object>}
   */
  async validateCouponCode({ code, branchId, orderAmount }) {
    await this.updateCouponStatusesByDates();

    if (!code) {
      const err = new Error('Coupon code is required');
      err.statusCode = 400;
      throw err;
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      const err = new Error('Coupon code is invalid');
      err.statusCode = 400;
      throw err;
    }

    const now = new Date();

    // 1. Check if the usage limit has been reached
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      const err = new Error('Coupon usage limit reached.');
      err.statusCode = 400;
      throw err;
    }

    // 2. Check if the coupon is expired (by status or by endDate)
    if (coupon.status === 'Expired' || now > new Date(coupon.endDate)) {
      const err = new Error('Coupon has expired.');
      err.statusCode = 400;
      throw err;
    }

    // 3. Check if the coupon is not yet active (currentDate < startDate)
    if (now < new Date(coupon.startDate)) {
      const err = new Error('Coupon is not yet active.');
      err.statusCode = 400;
      throw err;
    }

    // 4. Check if coupon is paused or not active
    if (coupon.status !== 'Active') {
      const err = new Error('Coupon is not active');
      err.statusCode = 400;
      throw err;
    }

    // 5. Check branch restriction
    if (coupon.branchId && branchId && String(coupon.branchId) !== String(branchId)) {
      const err = new Error('Coupon is not valid for this branch');
      err.statusCode = 400;
      throw err;
    }

    // 6. Check minimum purchase amount requirement
    if (orderAmount < coupon.minPurchaseAmount) {
      const err = new Error(`Order amount does not satisfy the minimum purchase requirement of Rs. ${coupon.minPurchaseAmount}`);
      err.statusCode = 400;
      throw err;
    }

    let discountAmount = 0;
    if (coupon.discountType === 'Percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
    } else if (coupon.discountType === 'Fixed Amount') {
      discountAmount = coupon.discountValue;
    } else if (coupon.discountType === 'Free Shipping') {
      discountAmount = 0;
    }

    // Do not allow discount to exceed the order total
    if (discountAmount > orderAmount) {
      discountAmount = orderAmount;
    }

    const finalOrderAmount = orderAmount - discountAmount;

    return {
      couponId: coupon._id,
      promotionId: coupon.promotionId || null,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalOrderAmount,
      message: 'Coupon applied successfully.'
    };
  }

  /**
   * Record usage of a coupon code and update stats
   * @param {String} couponId 
   * @param {String} promotionId 
   * @param {String} branchId 
   * @param {Number} orderAmount 
   * @param {Number} discountAmount 
   * @returns {Promise<Object>}
   */
  async recordCouponUsage({ couponId, promotionId, branchId, orderAmount, discountAmount }) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      const err = new Error('Coupon not found');
      err.statusCode = 400;
      throw err;
    }

    coupon.usageCount = (coupon.usageCount || 0) + 1;
    await coupon.save();

    if (promotionId) {
      const Promotion = require('./promotion.model');
      const promotion = await Promotion.findById(promotionId);
      if (promotion) {
        promotion.usagesCount = (promotion.usagesCount || 0) + 1;
        promotion.ordersCount = (promotion.ordersCount || 0) + 1;
        promotion.revenue = (promotion.revenue || 0) + orderAmount;

        const usages = Math.max(promotion.usagesCount, 1);
        const roiVal = promotion.revenue / usages;
        promotion.roi = `${roiVal.toFixed(1)}x`;

        await promotion.save();
      }
    }

    return { success: true, message: 'Coupon usage recorded successfully.' };
  }
}

module.exports = new CouponService();
