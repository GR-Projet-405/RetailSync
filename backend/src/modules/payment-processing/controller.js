const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

// GET: Search/Fetch Customers
const getCustomers = asyncHandler(async (req, res) => {
  const { search } = req.query; // Get search text from URL
  const data = await service.fetchCustomers(search);
  res.status(200).json({
    success: true,
    data: data
  });
});

// POST: Add a new Customer
const addCustomer = asyncHandler(async (req, res) => {
  const newCustomer = await service.createCustomer(req.body);
  res.status(201).json({
    success: true,
    message: 'Customer added successfully',
    data: newCustomer
  });
});

// POST: Process the Payment
const processPayment = asyncHandler(async (req, res) => {
  const transaction = await service.processTransaction(req.body);
  res.status(201).json({
    success: true,
    message: 'Payment processed successfully!',
    data: transaction
  });
});

// GET: Fetch all transactions for History 
const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await service.getAllTransactions();
  res.status(200).json({
    success: true,
    data: transactions
  });
});

module.exports = {
  getCustomers,
  addCustomer,
  processPayment,
  getTransactions
};