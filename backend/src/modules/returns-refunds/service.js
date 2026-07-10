const mongoose = require('mongoose');
//const bcrypt = require('bcryptjs');
const ReturnsRefundsPage = require('./model');

const LocalTransaction = mongoose.models.LocalTransaction || mongoose.model('LocalTransaction', new mongoose.Schema({}, { strict: false }), 'transactions');
const LocalCustomer = mongoose.models.LocalCustomer || mongoose.model('LocalCustomer', new mongoose.Schema({}, { strict: false }), 'customers');
const LocalUser = mongoose.models.LocalUser || mongoose.model('LocalUser', new mongoose.Schema({}, { strict: false }), 'users');

class ReturnsRefundsPageService {

  async verifyReceipt(receiptId) {
    const cleanId = receiptId.trim().toUpperCase();
    const transaction = await LocalTransaction.findOne({ receiptId: cleanId });

    if (!transaction) {
      throw { statusCode: 404, message: 'Receipt ID not found in the local system.', isExpired: false };
    }

    const purchaseDate = new Date(transaction.get('createdAt'));
    const currentDate = new Date();
    const daysDifference = (currentDate - purchaseDate) / (1000 * 3600 * 24);

    if (daysDifference > 30) {
      throw { statusCode: 400, message: 'Validation Error: 30-Day Return Limit Exceeded.', isExpired: true };
    }

    const existingReturns = await ReturnsRefundsPage.find({
      receiptId: cleanId,
      status: { $ne: 'Rejected' }
    });

    const returnedQuantities = {};
    existingReturns.forEach(ret => {
      ret.items.forEach(retItem => {
        if (!returnedQuantities[retItem.sku]) returnedQuantities[retItem.sku] = 0;
        returnedQuantities[retItem.sku] += retItem.returnQty;
      });
    });

    const dbItems = transaction.get('items') || [];

    const formattedItems = dbItems.map(item => {
      const sku = item.sku || 'N/A';
      const originalQty = item.qty || 1;
      const alreadyReturned = returnedQuantities[sku] || 0;
      const availableQty = originalQty - alreadyReturned;

      return {
        sku,
        name: item.name || 'Unknown Item',
        unitPrice: item.price || item.originalPrice || 0,
        originalQty,
        alreadyReturned,
        availableQty
      };
    });

    const totalAvailable = formattedItems.reduce((sum, item) => sum + item.availableQty, 0);
    if (totalAvailable === 0) {
      throw { statusCode: 400, message: 'All items in this receipt have already been returned.', isExpired: false };
    }

    return {
      isValid: true,
      receiptId: transaction.get('receiptId'),
      purchaseDate: transaction.get('createdAt'),
      items: formattedItems
    };
  }

  async createReturnRequest(data) {
    const { receiptId, items, estimatedRefundTotal } = data;

    const lastReturn = await ReturnsRefundsPage.findOne().sort({ createdAt: -1 });
    let newReturnIdNumber = 91;

    if (lastReturn && lastReturn.returnId) {
      const lastNumber = parseInt(lastReturn.returnId.split('-')[1], 10);
      if (!isNaN(lastNumber)) {
        newReturnIdNumber = lastNumber + 1;
      }
    }
    const generatedReturnId = `RET-${String(newReturnIdNumber).padStart(4, '0')}`;
    const transaction = await LocalTransaction.findOne({ receiptId: receiptId });

    const newReturnRequest = new ReturnsRefundsPage({
      returnId: generatedReturnId,
      receiptId: receiptId,
      transactionRef: transaction ? transaction._id : null,
      items: items,
      estimatedRefundTotal: estimatedRefundTotal,
      status: 'Pending'
    });

    return await newReturnRequest.save();
  }

  async getReturnHistory() {
    const returns = await ReturnsRefundsPage.find().sort({ createdAt: -1 }).lean();
    const history = [];

    for (const ret of returns) {
      let customerName = 'Walk-in Customer';
      let cashierName = 'System / Unknown';

      if (ret.transactionRef) {
        const trans = await LocalTransaction.findById(ret.transactionRef);
        if (trans) {
          if (trans.get('customerId')) {
            try {
              const cust = await LocalCustomer.findById(trans.get('customerId'));
              if (cust) customerName = cust.name || cust.get('name');
            } catch (e) { }
          }
          if (trans.get('cashierId')) {
            try {
              const user = await LocalUser.findById(trans.get('cashierId'));
              if (user) cashierName = user.firstName || user.name || user.get('name') || 'System User';
            } catch (e) { }
          }
        }
      }

      history.push({
        id: ret.returnId,
        date: new Date(ret.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        receipt: ret.receiptId,
        customer: customerName,
        cashier: cashierName,
        amount: ret.estimatedRefundTotal,
        status: ret.status
      });
    }
    return history;
  }

  async getReturnByReturnId(returnId) {
    const returnData = await ReturnsRefundsPage.findOne({ returnId: returnId }).lean();
    if (!returnData) throw { statusCode: 404, message: 'Return request not found.' };

    let customerName = 'Walk-in Customer';
    let cashierName = 'System / Unknown';
    let purchaseDate = returnData.createdAt;
    let originalPaymentMethod = 'cash';
    let cardLastFourDigits = '';

    if (returnData.transactionRef) {
      const trans = await LocalTransaction.findById(returnData.transactionRef);
      if (trans) {
        purchaseDate = trans.get('createdAt');
        originalPaymentMethod = trans.get('paymentMethod') || 'cash';
        cardLastFourDigits = trans.get('cardLastFourDigits') || '';

        if (trans.get('customerId')) {
          try {
            const cust = await LocalCustomer.findById(trans.get('customerId'));
            if (cust) customerName = cust.name || cust.get('name');
          } catch (e) { }
        }
        if (trans.get('cashierId')) {
          try {
            const user = await LocalUser.findById(trans.get('cashierId'));
            if (user) cashierName = user.firstName || user.name || user.get('name') || 'System User';
          } catch (e) { }
        }
      }
    }

    return {
      ...returnData,
      customerName,
      cashierName,
      purchaseDate,
      originalPaymentMethod,
      cardLastFourDigits
    };
  }

  async reviewReturnRequest(returnId, status, internalNotes, managerId) {
    const returnRequest = await ReturnsRefundsPage.findOne({ returnId: returnId });
    if (!returnRequest) throw { statusCode: 404, message: 'Return request not found.' };

    returnRequest.status = status;
    returnRequest.internalNotes = internalNotes;
    returnRequest.approvedBy = managerId || null;

    return await returnRequest.save();
  }

  /*async processRefund(returnId, refundMethod, managerEmail, managerPassword, pointsDeducted = 0) {
    if (!managerEmail || !managerPassword) {
      throw { statusCode: 400, message: 'Manager authorization credentials are required.' };
    }

    const manager = await LocalUser.findOne({ email: managerEmail }).populate('roleId');
    if (!manager) {
      throw { statusCode: 401, message: 'Invalid Manager Email.' };
    }

    const validRoles = ['BRANCH_MANAGER', 'ADMIN', 'SUPER_ADMIN'];
    
    const managerRole = manager.roleId && manager.roleId.name ? manager.roleId.name : manager.role;
    if (!managerRole || !validRoles.includes(managerRole)) {
      throw { statusCode: 403, message: 'Access Denied. Only a Manager can authorize refunds.' };
    }

    const isPasswordMatch = await bcrypt.compare(managerPassword, manager.password);
    if (!isPasswordMatch) {
      throw { statusCode: 401, message: 'Invalid Manager Password.' };
    }

    const returnRequest = await ReturnsRefundsPage.findOne({ returnId: returnId });
    if (!returnRequest) throw { statusCode: 404, message: 'Return request not found.' };

    if (pointsDeducted > 0 && returnRequest.transactionRef) {
      const trans = await LocalTransaction.findById(returnRequest.transactionRef);
      
      if (trans && trans.get('customerId')) {
        const customerId = trans.get('customerId');
        
        await LocalCustomer.findByIdAndUpdate(customerId, {
          $inc: { loyaltyPoints: -pointsDeducted }
        });
        console.log(`[SUCCESS] Deducted ${pointsDeducted} points from Customer ID: ${customerId}`);
      }
    }

    returnRequest.status = 'Refund Issued';
    returnRequest.refundMethod = refundMethod;
    returnRequest.pointsDeducted = pointsDeducted;

    return await returnRequest.save();
  }*/

  async processRefund(returnId, refundMethod, managerEmail, managerPassword, pointsDeducted = 0) {
    // 1. Mock Manager Verification
    if (!managerEmail || !managerPassword) {
      throw { statusCode: 400, message: 'Manager authorization credentials are required.' };
    }
    if (managerEmail !== 'admin@retailsync.com' || managerPassword !== 'Admin@123') {
      throw { statusCode: 401, message: 'Invalid Manager Credentials!' };
    }

    // 2. Return Request
    const returnRequest = await ReturnsRefundsPage.findOne({ returnId: returnId });
    if (!returnRequest) throw { statusCode: 404, message: 'Return request not found.' };

    
    if (pointsDeducted > 0 && returnRequest.transactionRef) {
      const trans = await LocalTransaction.findById(returnRequest.transactionRef);
      
      if (trans && trans.get('customerId')) {
        const customerId = trans.get('customerId');
        
       
        await LocalCustomer.findByIdAndUpdate(customerId, {
          $inc: { loyaltyPoints: -pointsDeducted }
        });
        console.log(`[SUCCESS] Deducted ${pointsDeducted} points from Customer ID: ${customerId}`);
      }
    }

    // Update Return Request
    returnRequest.status = 'Refund Issued';
    returnRequest.refundMethod = refundMethod;
    returnRequest.pointsDeducted = pointsDeducted;

    return await returnRequest.save();
  }
  
}

module.exports = new ReturnsRefundsPageService();