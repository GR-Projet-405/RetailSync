const StockTransfer = require('./model');
const Inventory = require('../inventory-management/model');
const Product = require('../product-management/model');
const Branch = require('../branch-management/branch.model');

class StockTransferService {
  // Get all transfers
  async getAllTransfers(query = {}) {
    const filter = {};
    if (query.status) {
      filter.status = query.status;
    }
    if (query.sourceBranch) {
      filter.sourceBranch = query.sourceBranch;
    }
    if (query.destinationBranch) {
      filter.destinationBranch = query.destinationBranch;
    }

    return await StockTransfer.find(filter)
      .populate('sourceBranch')
      .populate('destinationBranch')
      .populate('createdBy', 'firstName lastName username email')
      .populate('updatedBy', 'firstName lastName username email')
      .populate('items.productId')
      .sort({ createdAt: -1 })
      .lean();
  }

  // Get a single transfer
  async getTransferById(id) {
    const transfer = await StockTransfer.findById(id)
      .populate('sourceBranch')
      .populate('destinationBranch')
      .populate('createdBy', 'firstName lastName username email')
      .populate('updatedBy', 'firstName lastName username email')
      .populate('items.productId')
      .lean();

    if (!transfer) {
      const error = new Error('Stock transfer not found');
      error.statusCode = 404;
      throw error;
    }

    return transfer;
  }

  // Create a new transfer
  async createTransfer(payload, userId) {
    const { sourceBranch, destinationBranch, items, notes, driverName, vehicleNumber, estimatedTime, priority, requestedDate } = payload;

    if (sourceBranch.toString() === destinationBranch.toString()) {
      const error = new Error('Source and destination branches cannot be the same');
      error.statusCode = 400;
      throw error;
    }

    if (!items || items.length === 0) {
      const error = new Error('Transfer items are required');
      error.statusCode = 400;
      throw error;
    }

    // Auto-generate transfer number
    const count = await StockTransfer.countDocuments({});
    const transferNumber = `#TR-${String(count + 1).padStart(3, '0')}`;

    // Validate stock exists at source for all items
    for (const item of items) {
      const inventory = await Inventory.findOne({
        productId: item.productId,
        branchId: sourceBranch,
      });

      if (!inventory || inventory.quantity < item.quantityTransferred) {
        const product = await Product.findById(item.productId);
        const error = new Error(`Insufficient stock for product ${product ? product.name : item.productId} at source branch. Available: ${inventory ? inventory.quantity : 0}`);
        error.statusCode = 400;
        throw error;
      }
    }

    // Create the transfer record
    const transfer = await StockTransfer.create({
      transferNumber,
      sourceBranch,
      destinationBranch,
      items,
      notes,
      driverName: driverName || 'Pending Assignment',
      vehicleNumber: vehicleNumber || 'Pending Assignment',
      trackingNumber: transferNumber,
      estimatedTime: estimatedTime || 'Pending',
      status: 'PENDING', // Default to pending approvals
      priority: priority || 'MEDIUM',
      requestedDate: requestedDate || new Date(),
      createdBy: userId,
      updatedBy: userId,
      statusHistory: [
        {
          status: 'PENDING',
          updatedBy: userId,
          notes: notes || 'Stock transfer request created.',
        }
      ]
    });

    return await this.getTransferById(transfer._id);
  }

  // Update status (Approve, Reject, Ship, Deliver, Cancel)
  async updateTransferStatus(id, newStatus, userId, notes = '', driverDetails = {}) {
    const transfer = await StockTransfer.findById(id);
    if (!transfer) {
      const error = new Error('Stock transfer not found');
      error.statusCode = 404;
      throw error;
    }

    const oldStatus = transfer.status;
    if (oldStatus === newStatus) {
      return await this.getTransferById(transfer._id);
    }

    const isMovingToShipped = ['APPROVED', 'PICKED_UP', 'IN_TRANSIT'].includes(newStatus) && !['APPROVED', 'PICKED_UP', 'IN_TRANSIT'].includes(oldStatus);
    const isMovingToDelivered = newStatus === 'DELIVERED';
    const isRevertingStock = ['CANCELLED', 'REJECTED'].includes(newStatus) && ['APPROVED', 'PICKED_UP', 'IN_TRANSIT'].includes(oldStatus);

    // 1. Deduct stock from source branch when approved/shipped
    if (isMovingToShipped) {
      for (const item of transfer.items) {
        const inventory = await Inventory.findOne({
          productId: item.productId,
          branchId: transfer.sourceBranch,
        });

        if (!inventory || inventory.quantity < item.quantityTransferred) {
          const product = await Product.findById(item.productId);
          const error = new Error(`Cannot approve transfer. Insufficient stock for product ${product ? product.name : item.productId} at source branch. Available: ${inventory ? inventory.quantity : 0}`);
          error.statusCode = 400;
          throw error;
        }

        // Deduct
        inventory.quantity -= item.quantityTransferred;
        await inventory.save();
      }
    }

    // 2. Add stock to destination branch when delivered
    if (isMovingToDelivered) {
      for (const item of transfer.items) {
        // Default quantity received is quantity transferred if not specified
        const recQty = item.quantityReceived || item.quantityTransferred;
        
        // Find or create inventory at destination
        let destInventory = await Inventory.findOne({
          productId: item.productId,
          branchId: transfer.destinationBranch,
        });

        if (!destInventory) {
          destInventory = new Inventory({
            productId: item.productId,
            branchId: transfer.destinationBranch,
            quantity: 0,
            reorderLevel: 5,
          });
        }

        destInventory.quantity += recQty;
        await destInventory.save();
        
        // update the received qty on transfer items
        item.quantityReceived = recQty;
      }
      transfer.deliveryDate = new Date();
    }

    // 3. Revert stock to source if cancelled/rejected after deduction
    if (isRevertingStock) {
      for (const item of transfer.items) {
        let srcInventory = await Inventory.findOne({
          productId: item.productId,
          branchId: transfer.sourceBranch,
        });

        if (!srcInventory) {
          srcInventory = new Inventory({
            productId: item.productId,
            branchId: transfer.sourceBranch,
            quantity: 0,
            reorderLevel: 5,
          });
        }

        srcInventory.quantity += item.quantityTransferred;
        await srcInventory.save();
      }
    }

    // Update status and audit logs
    transfer.status = newStatus;
    transfer.updatedBy = userId;
    
    if (newStatus === 'IN_TRANSIT' && !transfer.shipmentDate) {
      transfer.shipmentDate = new Date();
    }

    if (driverDetails.driverName) transfer.driverName = driverDetails.driverName;
    if (driverDetails.vehicleNumber) transfer.vehicleNumber = driverDetails.vehicleNumber;
    if (driverDetails.estimatedTime) transfer.estimatedTime = driverDetails.estimatedTime;

    // Mock details if transition happens to progress steps and none were supplied
    if (newStatus === 'APPROVED' && !transfer.driverName) {
      transfer.driverName = 'Kamal Perera';
      transfer.vehicleNumber = 'WP-CAM-1025';
      transfer.estimatedTime = '30 Minutes';
    }

    transfer.statusHistory.push({
      status: newStatus,
      updatedBy: userId,
      notes: notes || `Transfer status changed from ${oldStatus} to ${newStatus}.`,
      updatedAt: new Date(),
    });

    await transfer.save();
    return await this.getTransferById(transfer._id);
  }
}

module.exports = new StockTransferService();
