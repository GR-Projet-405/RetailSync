const mongoose = require('mongoose');
const ReturnsRefundsPage = require('./model');

const LocalTransaction = mongoose.model('LocalTransaction', new mongoose.Schema({}, { strict: false }), 'transactions');

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
      status: 'Ready for Refund Processing'
    });

    return await newReturnRequest.save();
  }

  async getReturnByReturnId(returnId) {
    const returnData = await ReturnsRefundsPage.findOne({ returnId: returnId });
    if (!returnData) {
      throw { statusCode: 404, message: 'Return request not found.' };
    }
    return returnData;
  }
}

module.exports = new ReturnsRefundsPageService();