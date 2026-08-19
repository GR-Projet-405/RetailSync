const mongoose = require('mongoose');
const GoodsReceivingPage = require('../goods-receiving/model');

// Adjust this path to wherever your Purchase Order model actually lives.
// It's only used to pull the supplier + PO number when a receipt is created.
let PurchaseOrder;
try {
  PurchaseOrder = require('../purchase-order-management/purchaseOrder.model');
} catch (e) {
  PurchaseOrder = null; // module not wired up yet - createReceipt will fall back to req.body values
}

class GoodsReceivingPageService {
  /* ------------------------------------------------------------------ */
  /*  1) GOODS RECEIPT FORM                                              */
  /* ------------------------------------------------------------------ */
  async createReceipt(payload, user) {
    const { purchaseOrder, poNumber, supplier, deliveryDate, destinationWarehouse, notes, items, saveAsDraft } =
      payload;

    if (!items || items.length === 0) {
      const error = new Error('At least one received item is required.');
      error.statusCode = 400;
      throw error;
    }

    let resolvedPoNumber = poNumber;
    let resolvedSupplier = supplier;

    if (PurchaseOrder && purchaseOrder) {
      const po = await PurchaseOrder.findById(purchaseOrder).populate('supplier');
      if (!po) {
        const error = new Error('Purchase order not found.');
        error.statusCode = 404;
        throw error;
      }
      resolvedPoNumber = po.poNumber || po.orderNumber;
      resolvedSupplier = po.supplier?._id || po.supplier;
    }

    if (!resolvedSupplier || !resolvedPoNumber) {
      const error = new Error('Supplier and Purchase Order # are required.');
      error.statusCode = 400;
      throw error;
    }

    return GoodsReceivingPage.create({
      purchaseOrder,
      poNumber: resolvedPoNumber,
      supplier: resolvedSupplier,
      branchId: user.branchId,
      destinationWarehouse,
      deliveryDate,
      receivedBy: user._id,
      notes,
      items,
      status: saveAsDraft ? 'DRAFT' : 'PENDING_VERIFICATION',
    });
  }

  async getReceiptById(id) {
    const receipt = await GoodsReceivingPage.findById(id)
      .populate('supplier', 'name')
      .populate('receivedBy', 'firstName lastName');

    if (!receipt) {
      const error = new Error('Goods receipt not found.');
      error.statusCode = 404;
      throw error;
    }
    return receipt;
  }

  /* ------------------------------------------------------------------ */
  /*  2) RECEIVING DASHBOARD                                             */
  /* ------------------------------------------------------------------ */
  async getDashboardStats(query) {
    const branchFilter = query.branchId ? { branchId: query.branchId } : {};

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const startOfPrevWeek = new Date(startOfWeek);
    startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);

    const [todayCount, yesterdayCount, weekItemsAgg, prevWeekItemsAgg, pendingCount, avgTimeAgg, recentReceipts] =
      await Promise.all([
        GoodsReceivingPage.countDocuments({ ...branchFilter, createdAt: { $gte: startOfToday } }),
        GoodsReceivingPage.countDocuments({
          ...branchFilter,
          createdAt: { $gte: startOfYesterday, $lt: startOfToday },
        }),
        GoodsReceivingPage.aggregate([
          { $match: { ...branchFilter, createdAt: { $gte: startOfWeek } } },
          { $unwind: '$items' },
          { $group: { _id: null, total: { $sum: '$items.receivedQty' } } },
        ]),
        GoodsReceivingPage.aggregate([
          { $match: { ...branchFilter, createdAt: { $gte: startOfPrevWeek, $lt: startOfWeek } } },
          { $unwind: '$items' },
          { $group: { _id: null, total: { $sum: '$items.receivedQty' } } },
        ]),
        GoodsReceivingPage.countDocuments({
          ...branchFilter,
          status: { $in: ['PENDING_VERIFICATION', 'DISCREPANCY'] },
        }),
        GoodsReceivingPage.aggregate([
          { $match: { ...branchFilter, status: 'VERIFIED', processingTimeMinutes: { $exists: true } } },
          { $group: { _id: null, avgTime: { $avg: '$processingTimeMinutes' } } },
        ]),
        GoodsReceivingPage.find(branchFilter)
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('supplier', 'name')
          .select('receiptNumber supplier items status createdAt'),
      ]);

    const weekItems = weekItemsAgg[0]?.total || 0;
    const prevWeekItems = prevWeekItemsAgg[0]?.total || 0;
    const itemsChangePct = prevWeekItems
      ? Number((((weekItems - prevWeekItems) / prevWeekItems) * 100).toFixed(1))
      : 0;

    return {
      todaysReceipts: todayCount,
      receiptsDeltaFromYesterday: todayCount - yesterdayCount,
      itemsReceivedThisWeek: weekItems,
      itemsChangePct,
      pendingVerification: pendingCount,
      avgProcessingTimeMinutes: Math.round(avgTimeAgg[0]?.avgTime || 0),
      recentReceipts: recentReceipts.map((r) => ({
        id: r._id,
        receiptNumber: r.receiptNumber,
        supplier: r.supplier?.name,
        items: r.items.reduce((sum, i) => sum + i.receivedQty, 0),
        date: r.createdAt,
        status: r.status,
      })),
    };
  }

  /* ------------------------------------------------------------------ */
  /*  3) RECEIVED ITEMS HISTORY                                          */
  /* ------------------------------------------------------------------ */
  async getReceivedItemsHistory(query) {
    const { search, supplier, status, startDate, endDate, page = 1, limit = 20 } = query;

    const match = {};
    if (query.branchId) match.branchId = new mongoose.Types.ObjectId(query.branchId);
    if (supplier) match.supplier = new mongoose.Types.ObjectId(supplier);
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const pipeline = [{ $match: match }, { $unwind: '$items' }];

    if (status) {
      pipeline.push({ $match: { 'items.itemStatus': status.toUpperCase() } });
    }

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'items.productName': { $regex: search, $options: 'i' } },
            { 'items.sku': { $regex: search, $options: 'i' } },
            { receiptNumber: { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'suppliers', // adjust if your Supplier collection is named differently
          localField: 'supplier',
          foreignField: '_id',
          as: 'supplierInfo',
        },
      },
      { $unwind: { path: '$supplierInfo', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 0,
          item: '$items.productName',
          sku: '$items.sku',
          supplier: '$supplierInfo.name',
          qty: '$items.receivedQty',
          date: '$createdAt',
          receiptNumber: '$receiptNumber',
          status: '$items.itemStatus',
        },
      },
      {
        $facet: {
          data: [{ $skip: (Number(page) - 1) * Number(limit) }, { $limit: Number(limit) }],
          totals: [
            {
              $group: {
                _id: null,
                totalItems: { $sum: 1 },
                verified: { $sum: { $cond: [{ $eq: ['$status', 'MATCHED'] }, 1, 0] } },
                discrepancy: { $sum: { $cond: [{ $ne: ['$status', 'MATCHED'] }, 1, 0] } },
              },
            },
          ],
        },
      }
    );

    const [result] = await GoodsReceivingPage.aggregate(pipeline);

    return {
      data: result?.data || [],
      summary: result?.totals?.[0] || { totalItems: 0, verified: 0, discrepancy: 0 },
      page: Number(page),
      limit: Number(limit),
    };
  }

  /* ------------------------------------------------------------------ */
  /*  4) RECEIVING REPORTS                                               */
  /* ------------------------------------------------------------------ */
  async getReceivingReports(query) {
    const { month, year, supplier, branchId } = query;

    const now = new Date();
    const targetYear = Number(year) || now.getFullYear();
    const targetMonth = month !== undefined ? Number(month) : now.getMonth();

    const rangeStart = new Date(targetYear, targetMonth, 1);
    const rangeEnd = new Date(targetYear, targetMonth + 1, 1);
    const prevRangeStart = new Date(targetYear, targetMonth - 1, 1);
    const prevRangeEnd = rangeStart;

    const match = { createdAt: { $gte: rangeStart, $lt: rangeEnd } };
    if (branchId) match.branchId = new mongoose.Types.ObjectId(branchId);
    if (supplier) match.supplier = new mongoose.Types.ObjectId(supplier);

    const prevMatch = { ...match, createdAt: { $gte: prevRangeStart, $lt: prevRangeEnd } };

    const [current, previous, dailyReceipts, topSuppliers, discrepancyBySupplier, avgProcessingAgg] =
      await Promise.all([
        GoodsReceivingPage.aggregate([
          { $match: match },
          { $unwind: '$items' },
          {
            $group: {
              _id: null,
              totalReceipts: { $addToSet: '$_id' },
              totalItems: { $sum: '$items.receivedQty' },
              discrepancyItems: { $sum: { $cond: [{ $ne: ['$items.itemStatus', 'MATCHED'] }, 1, 0] } },
              totalLineItems: { $sum: 1 },
            },
          },
        ]),
        GoodsReceivingPage.aggregate([
          { $match: prevMatch },
          { $unwind: '$items' },
          {
            $group: {
              _id: null,
              totalReceipts: { $addToSet: '$_id' },
              totalItems: { $sum: '$items.receivedQty' },
            },
          },
        ]),
        GoodsReceivingPage.aggregate([
          { $match: match },
          { $group: { _id: { $dayOfMonth: '$createdAt' }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        GoodsReceivingPage.aggregate([
          { $match: match },
          { $unwind: '$items' },
          { $group: { _id: '$supplier', volume: { $sum: '$items.receivedQty' } } },
          { $sort: { volume: -1 } },
          { $limit: 5 },
          { $lookup: { from: 'suppliers', localField: '_id', foreignField: '_id', as: 'supplierInfo' } },
          { $unwind: '$supplierInfo' },
          { $project: { _id: 0, supplier: '$supplierInfo.name', volume: 1 } },
        ]),
        GoodsReceivingPage.aggregate([
          { $match: match },
          {
            $group: {
              _id: '$supplier',
              receipts: { $sum: 1 },
              discrepancies: { $sum: { $cond: [{ $gt: ['$discrepancyCount', 0] }, 1, 0] } },
            },
          },
          { $lookup: { from: 'suppliers', localField: '_id', foreignField: '_id', as: 'supplierInfo' } },
          { $unwind: '$supplierInfo' },
          {
            $project: {
              _id: 0,
              supplier: '$supplierInfo.name',
              receipts: 1,
              discrepancies: 1,
              rate: { $round: [{ $multiply: [{ $divide: ['$discrepancies', '$receipts'] }, 100] }, 1] },
            },
          },
          { $sort: { rate: -1 } },
        ]),
        GoodsReceivingPage.aggregate([
          { $match: { ...match, processingTimeMinutes: { $exists: true } } },
          { $group: { _id: null, avg: { $avg: '$processingTimeMinutes' } } },
        ]),
      ]);

    const currentData = current[0] || { totalReceipts: [], totalItems: 0, discrepancyItems: 0, totalLineItems: 0 };
    const previousData = previous[0] || { totalReceipts: [], totalItems: 0 };

    const totalReceipts = currentData.totalReceipts.length;
    const prevTotalReceipts = previousData.totalReceipts.length;
    const discrepancyRate = currentData.totalLineItems
      ? Number(((currentData.discrepancyItems / currentData.totalLineItems) * 100).toFixed(1))
      : 0;

    return {
      totalReceipts,
      receiptsChangePct: prevTotalReceipts
        ? Number((((totalReceipts - prevTotalReceipts) / prevTotalReceipts) * 100).toFixed(1))
        : 0,
      totalItemsReceived: currentData.totalItems,
      itemsChangePct: previousData.totalItems
        ? Number((((currentData.totalItems - previousData.totalItems) / previousData.totalItems) * 100).toFixed(1))
        : 0,
      discrepancyRate,
      avgProcessingTimeMinutes: Math.round(avgProcessingAgg[0]?.avg || 0),
      dailyReceipts: dailyReceipts.map((d) => ({ day: d._id, count: d.count })),
      topSuppliers,
      discrepancySummary: discrepancyBySupplier,
    };
  }

  /* ------------------------------------------------------------------ */
  /*  5) VERIFICATION SCREEN                                             */
  /* ------------------------------------------------------------------ */
  async getReceiptForVerification(id) {
    const receipt = await GoodsReceivingPage.findById(id)
      .populate('supplier', 'name')
      .populate('receivedBy', 'firstName lastName');

    if (!receipt) {
      const error = new Error('Goods receipt not found.');
      error.statusCode = 404;
      throw error;
    }
    return receipt;
  }

  async verifyItem(id, itemId, action, note) {
    const receipt = await GoodsReceivingPage.findById(id);
    if (!receipt) {
      const error = new Error('Goods receipt not found.');
      error.statusCode = 404;
      throw error;
    }

    const item = receipt.items.id(itemId);
    if (!item) {
      const error = new Error('Item not found on this receipt.');
      error.statusCode = 404;
      throw error;
    }

    item.verifyStatus = action; // 'APPROVED' | 'REJECTED'
    if (note) item.verifyNote = note;

    await receipt.save();
    return receipt;
  }

  async approveAll(id, user, notes) {
    const receipt = await GoodsReceivingPage.findById(id);
    if (!receipt) {
      const error = new Error('Goods receipt not found.');
      error.statusCode = 404;
      throw error;
    }

    receipt.items.forEach((item) => (item.verifyStatus = 'APPROVED'));
    receipt.status = 'VERIFIED';
    receipt.verifiedBy = user._id;
    receipt.verifiedAt = new Date();
    receipt.processingTimeMinutes = Math.round((receipt.verifiedAt - receipt.createdAt) / 60000);
    if (notes) receipt.verificationNotes = notes;

    await receipt.save();

    // NOTE (REQ-INV-002 / REQ-PO-005 / BR-INV-004): once fully approved, inventory
    // levels for each item.product should be incremented here via your
    // Inventory / Product module/service, e.g.:
    // await Promise.all(receipt.items.map(i => inventoryService.incrementStock(i.product, receipt.branchId, i.receivedQty)));
    // Resolved the error
    if (inventoryService) {
      await Promise.all(
        receipt.items.map((item) =>
          inventoryService.incrementStock(item.product, receipt.branchId, item.receivedQty)
        )
      );
    }
    return receipt;
  }

  async partialApprove(id, approvedItemIds = [], user, notes) {
    const receipt = await GoodsReceivingPage.findById(id);
    if (!receipt) {
      const error = new Error('Goods receipt not found.');
      error.statusCode = 404;
      throw error;
    }

    receipt.items.forEach((item) => {
      item.verifyStatus = approvedItemIds.includes(String(item._id)) ? 'APPROVED' : 'REJECTED';
    });

    receipt.status = 'VERIFIED'; // partial approve still closes out the receipt (rejected lines are logged, not blocking)
    receipt.verifiedBy = user._id;
    receipt.verifiedAt = new Date();
    receipt.processingTimeMinutes = Math.round((receipt.verifiedAt - receipt.createdAt) / 60000);
    if (notes) receipt.verificationNotes = notes;

    await receipt.save();
    return receipt;
  }

  async rejectReceipt(id, reason) {
    const receipt = await GoodsReceivingPage.findById(id);
    if (!receipt) {
      const error = new Error('Goods receipt not found.');
      error.statusCode = 404;
      throw error;
    }

    receipt.status = 'REJECTED';
    receipt.rejectionReason = reason || 'Rejected during verification.';
    receipt.items.forEach((item) => (item.verifyStatus = 'REJECTED'));

    await receipt.save();
    return receipt;
  }

  async flagForManager(id, notes) {
    const receipt = await GoodsReceivingPage.findById(id);
    if (!receipt) {
      const error = new Error('Goods receipt not found.');
      error.statusCode = 404;
      throw error;
    }

    receipt.flaggedForManager = true;
    if (notes) receipt.verificationNotes = notes;

    await receipt.save();
    return receipt;
  }
}

module.exports = new GoodsReceivingPageService();


// class GoodsReceivingPageService {
//   async fetchDetails() {
//     // Skeletons to be populated by development teams
//     return {
//       module: 'Goods Receiving',
//       status: 'Under Development'
//     };
//   }
// }

// module.exports = new GoodsReceivingPageService();
