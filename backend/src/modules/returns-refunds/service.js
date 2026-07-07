const mongoose = require('mongoose');
const ReturnsRefundsPage = require('./model');

const LocalTransaction = mongoose.model('LocalTransaction', new mongoose.Schema({}, { strict: false }), 'transactions');

class ReturnsRefundsPageService {

  async verifyReceipt(receiptId) {
    const cleanId = receiptId.trim().toUpperCase();

    const transaction = await LocalTransaction.findOne({ receiptId: cleanId });

    if (!transaction) {
      const error = new Error('Receipt ID not found in the local system.');
      error.statusCode = 404;
      throw error;
    }

    const purchaseDate = new Date(transaction.get('createdAt'));
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - purchaseDate.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24);

    if (daysDifference > 30) {
      const error = new Error('Validation Error: 30-Day Return Limit Exceeded.');
      error.statusCode = 400;
      error.isExpired = true;
      throw error;
    }

    const dbItems = transaction.get('items') || [];
    const formattedItems = dbItems.map(item => ({
      sku: item.sku || 'N/A',
      name: item.name || 'Unknown Item',
      unitPrice: item.price || item.originalPrice || 0,
      originalQty: item.qty || 1
    }));

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
      const error = new Error('Return request not found.');
      error.statusCode = 404;
      throw error;
    }
    return returnData;
  }
}

module.exports = new ReturnsRefundsPageService();