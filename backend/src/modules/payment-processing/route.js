const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken, hasRole } = require('../../middleware/auth.middleware');

// 1. Route to get/search customers (e.g., GET /api/payment-processing/payment-customers?search=077)
router.get('/customers', controller.getCustomers);

// 2. Route to add a new customer (e.g., POST /api/payment-processing/customers)
router.post('/customers', controller.addCustomer);

// 3. Route to process the final payment (e.g., POST /api/payment-processing/process)
router.post('/process', verifyToken, controller.processPayment);

// 4. Route to fetch transaction history (e.g., GET /api/payment-processing/transactions)
router.get('/transactions', controller.getTransactions);

// 5. Route to send email receipt 
router.post('/email-receipt', controller.sendEmailReceipt);

module.exports = router;