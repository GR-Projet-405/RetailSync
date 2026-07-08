// Import the models we created
const { Customer, Transaction } = require('./model');

class PaymentProcessingService {

  // 1. Fetch customers (Used for the Search modal in Frontend)
  async fetchCustomers(searchQuery = '') {
    let query = {};
    if (searchQuery) {
      // Search by phone number
      query = { phone: { $regex: searchQuery, $options: 'i' } };
    }
    return await Customer.find(query);
  }

  // 2. Add a new customer (From the 'Add New Customer' modal)
  async createCustomer(customerData) {
    const newCustomer = new Customer(customerData);
    return await newCustomer.save();
  }

  // 3. Process the Final Payment
  async processTransaction(transactionData) {
    const { customerId, finalTotal, pointsRedeemed } = transactionData;

    // Calculate new points earned (Rs. 100 = 1 Point)
    const pointsEarned = Math.floor(finalTotal / 100);
    transactionData.pointsEarned = pointsEarned;

    // Save the transaction to the database
    const transaction = new Transaction(transactionData);
    const savedTransaction = await transaction.save();

    // If a registered customer made the payment, update their points
    if (customerId) {
      const customer = await Customer.findById(customerId);
      if (customer) {
        // Subtract redeemed points and add newly earned points
        customer.loyaltyPoints = (customer.loyaltyPoints - pointsRedeemed) + pointsEarned;
        await customer.save();
      }
    }

    return savedTransaction;
  }

  // 4. Fetch all transactions (For the Sales History page)
  async getAllTransactions() {
    return await Transaction.find()
      .populate('customerId', 'name phone email loyaltyPoints')
      .populate('cashierId', 'name')
      .sort({ createdAt: -1 }); // Sort by most recent transactions first
  }

}

module.exports = new PaymentProcessingService();