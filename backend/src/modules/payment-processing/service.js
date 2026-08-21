require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const { Transaction } = require('./model');
const Customer = require('../customer-management/model');
const User = require('../user-management/user.model');
const Product = require('../product-management/model');
const Sale = require('../../../models/Sale');

/**
 * Map a POS billing transaction into the shape expected by the centralized
 * `Sale` model, which is what Sales History / Sales Dashboard reads from.
 *
 * The POS flow persists a `Transaction` (used by Payment History + Returns),
 * while Sales History reads the `sales` collection. Writing both keeps the
 * two sides consistent so history requests no longer return empty/404.
 */
const mapPaymentMethodToSale = (method) => {
  const normalized = String(method || 'cash').trim().toLowerCase();
  // Sale schema supports: cash, card, qr_pay, bank_transfer
  if (normalized === 'qr') return 'qr_pay';
  return normalized;
};

const buildSaleRecord = async (transactionData) => {
  const {
    receiptId,
    customerId = null,
    cashierId = null,
    branchId = null,
    items = [],
    subTotal = 0,
    posDiscount = 0,
    memberDiscount = 0,
    taxAmount = 0,
    finalTotal = 0,
    paymentMethod = 'cash',
  } = transactionData;

  // Resolve the cashier's branch (falling back to the explicitly passed branch)
  let branch = branchId;
  if (!branch && cashierId) {
    const cashier = await User.findById(cashierId).select('branchId');
    branch = cashier?.branchId || null;
  }

  // Map POS cart items to the Sale item schema (which references the Product).
  const saleItems = [];
  for (const item of items || []) {
    const sku = String(item.sku || '').trim().toUpperCase();
    let productId = item.productId;

    if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
      productId = null;
    }

    if (!productId && sku) {
      const product = await Product.findOne({ sku }).select('_id name').lean();
      if (product) productId = product._id;
    } else if (productId) {
      const product = await Product.findById(productId).select('_id name').lean();
      if (!product) productId = null;
    }

    saleItems.push({
      product: productId || null,
      productName: item.name || 'Unknown',
      sku,
      quantity: Number(item.qty) || 1,
      unitPrice: Number(item.price) || 0,
      discount: 0,
      lineTotal: Number(item.total ?? (Number(item.price) * Number(item.qty))) || 0,
    });
  }

  return {
    transactionId: receiptId,
    branch: branch || undefined,
    customer: customerId || null,
    cashier: cashierId,
    items: saleItems,
    subtotal: Number(subTotal) || 0,
    discountTotal: Number(posDiscount || 0) + Number(memberDiscount || 0),
    tax: Number(taxAmount) || 0,
    totalAmount: Number(finalTotal) || 0,
    paymentMethod: mapPaymentMethodToSale(paymentMethod),
    status: 'completed',
  };
};

class PaymentProcessingService {

  // 1. Fetch customers
  async fetchCustomers(searchQuery = '') {
    let query = {};
    if (searchQuery) {
      query = { phone: { $regex: searchQuery, $options: 'i' } };
    }
    return await Customer.find(query);
  }

  // 2. Add a new customer
  async createCustomer(customerData) {
    const formattedData = {
      firstName: customerData.firstName || 'Guest',
      lastName: customerData.lastName || '',
      phone: customerData.phone,
      email: customerData.email || '',
      customerType: 'Regular'
    };

    const newCustomer = new Customer(formattedData);
    return await newCustomer.save();
  }

  // 3. Process the Final Payment
  async processTransaction(transactionData) {
    const { customerId, finalTotal, pointsRedeemed } = transactionData;

    //generate a unique receipt ID based on the current date and a random string
    const generatedId = new mongoose.Types.ObjectId();
    transactionData._id = generatedId;

    //date string in the format YYMMDD
    const date = new Date();
    const dateString = date.toISOString().slice(2, 10).replace(/-/g, '');

    // generate a unique part from the ObjectId (last 8 characters)
    const uniquePart = generatedId.toString().slice(-8).toUpperCase();

    // final receipt ID format: TXN-YYMMDD-UNIQUEPART
    transactionData.receiptId = `TXN-${dateString}-${uniquePart}`;

    // Calculate new points earned (Rs. 100 = 1 Point)
    const pointsEarned = Math.floor(finalTotal / 100);
    transactionData.pointsEarned = pointsEarned;

    // Save the transaction to the database
    const transaction = new Transaction(transactionData);
    let savedTransaction = await transaction.save();

    savedTransaction = await savedTransaction.populate([
      { path: 'customerId' },
      {
        path: 'cashierId',
        populate: { path: 'branchId', model: 'Branch' }
      }
    ]);

    // Also persist a Sale record into the `sales` collection.
    // POS Billing writes to `transactions` while Sales History reads `sales`,
    // so keeping both in-sync prevents history requests from returning empty/404.
    try {
      const saleRecord = await buildSaleRecord(transactionData);
      const sale = new Sale(saleRecord);
      await sale.save();
    } catch (saleError) {
      console.error('POS Billing: failed to persist Sale record:', saleError.message);
    }

    // If a registered customer made the payment, update their points
    if (customerId) {
      const customer = await Customer.findById(customerId);
      if (customer) {
        // null or undefined pointsRedeemed should be treated as 0
        customer.loyaltyPoints = (customer.loyaltyPoints || 0) - (pointsRedeemed || 0) + (pointsEarned || 0);
        await customer.save();
      }
    }
    return savedTransaction;
  }

  // 4. Fetch all transactions
  async getAllTransactions() {
    return await Transaction.find()
      .populate('customerId', 'firstName lastName phone email loyaltyPoints')
      .populate({
        path: 'cashierId',
        populate: { path: 'branchId', model: 'Branch' }
      })
      .sort({ createdAt: -1 });
  }

  // 5. Send Email Receipt
  async sendReceiptEmail(transactionId, email) {
    const transaction = await Transaction.findById(transactionId).populate('customerId');
    if (!transaction) throw new Error("Transaction not found");

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true', //secure:true for port 465, secure:false for port 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    let itemsHtml = '';
    if (transaction.items && transaction.items.length > 0) {
      itemsHtml = `
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 14px;">
                <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left;">
                    <th style="padding: 8px 0;">Item</th>
                    <th style="padding: 8px 0; text-align: center;">Qty</th>
                    <th style="padding: 8px 0; text-align: right;">Total</th>
                </tr>
                ${transaction.items.map(item => `
                    <tr>
                        <td style="padding: 8px 0; color: #334155;">${item.name}</td>
                        <td style="padding: 8px 0; text-align: center; color: #334155;">${item.qty}</td>
                        <td style="padding: 8px 0; text-align: right; color: #334155;">Rs. ${item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                `).join('')}
            </table>
        `;
    }

    let cashDetailsHtml = '';
    if (transaction.paymentMethod === 'cash') {
      cashDetailsHtml = `
            <div style="display: flex; justify-content: space-between; margin: 5px 0; font-size: 14px; color: #475569;">
                <span>Tendered Amount:</span>
                <span>Rs. ${transaction.tenderedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 5px 0; font-size: 14px; color: #16a34a; font-weight: bold;">
                <span>Change Returned:</span>
                <span>Rs. ${transaction.changeDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
        `;
    }

    let loyaltyHtml = '';
    if (transaction.customerId) {
      const customer = transaction.customerId;
      loyaltyHtml = `
          <hr style="border: 0; border-top: 1px dashed #cbd5e1; margin: 15px 0;" />
          <div style="text-align: center; background-color: #fffbeb; border: 1px solid #fde68a; padding: 12px; border-radius: 8px;">
              <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: bold;">Customer: ${customer.firstName} ${customer.lastName}</p>
              ${transaction.pointsEarned > 0 ? `<p style="margin: 5px 0 0 0; color: #d97706; font-size: 12px;">Points Earned: +${transaction.pointsEarned}</p>` : ''}
              ${transaction.pointsRedeemed > 0 ? `<p style="margin: 5px 0 0 0; color: #d97706; font-size: 12px;">Points Redeemed: -${transaction.pointsRedeemed}</p>` : ''}
              <p style="margin: 8px 0 0 0; color: #b45309; font-size: 13px; font-weight: bold;">New Points Balance: ${customer.loyaltyPoints} Pts</p>
          </div>
        `;
    }

    //use the short transaction ID for the email subject
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 450px; margin: auto; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; background-color: #f8fafc;">
          
          <div style="text-align: center; margin-bottom: 25px;">
              <h2 style="color: #2563eb; margin: 0; font-size: 26px;">RetailOS Pro</h2>
              <p style="color: #64748b; margin: 5px 0; font-size: 14px;">Downtown Flagship Store</p>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
              
              <div style="margin-bottom: 15px; font-size: 14px;">
                  <p style="margin: 4px 0; color: #475569;"><strong>Receipt No:</strong> #${transaction.receiptId}</p>
                  <p style="margin: 4px 0; color: #475569;"><strong>Date:</strong> ${new Date(transaction.createdAt).toLocaleString('en-GB')}</p>
                  <p style="margin: 4px 0; color: #475569;"><strong>Payment Method:</strong> <span style="text-transform: capitalize;">${transaction.paymentMethod}</span></p>
              </div>
              
              <hr style="border: 0; border-top: 1px dashed #cbd5e1; margin: 15px 0;" />
              
              ${itemsHtml}

              <hr style="border: 0; border-top: 1px dashed #cbd5e1; margin: 15px 0;" />
              
              <div style="font-size: 14px; color: #475569; margin-bottom: 15px;">
                  <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                      <span>Subtotal:</span>
                      <span>Rs. ${transaction.subTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  ${transaction.memberDiscount > 0 ? `
                  <div style="display: flex; justify-content: space-between; margin: 5px 0; color: #16a34a;">
                      <span>Member Discount:</span>
                      <span>- Rs. ${transaction.memberDiscount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>` : ''}
                  ${transaction.pointsRedeemed > 0 ? `
                  <div style="display: flex; justify-content: space-between; margin: 5px 0; color: #d97706;">
                      <span>Points Claimed:</span>
                      <span>- Rs. ${(transaction.pointsRedeemed / 10).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>` : ''}
                  <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                      <span>TAX :</span>
                      <span>Rs. ${transaction.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
              </div>

              <hr style="border: 0; border-top: 1px dashed #cbd5e1; margin: 15px 0;" />
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <h3 style="color: #0f172a; margin: 0; font-size: 18px;">TOTAL PAID</h3>
                  <h3 style="color: #2563eb; margin: 0; font-size: 20px;">
                    Rs. ${transaction.finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </h3>
              </div>

              ${cashDetailsHtml}
          </div>
          
          ${loyaltyHtml}

          <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 20px;">
            Thank you for shopping with us!<br/>System Generated Document.
          </p>
      </div>
    `;

    const mailOptions = {
      from: `"RetailOS Pro POS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your Receipt from RetailOS Pro (#${transaction.receiptId})`,
      html: htmlContent
    };

    return await transporter.sendMail(mailOptions);
  }
}

module.exports = new PaymentProcessingService();