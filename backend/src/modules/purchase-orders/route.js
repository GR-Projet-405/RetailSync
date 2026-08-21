const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken } = require('../../middleware/auth.middleware');

// Protect all Purchase Order routes with authentication
router.use(verifyToken);

// List / read — specific routes MUST come before the /:id catch-all
router.get('/', controller.getDetails);
router.get('/suppliers', controller.searchSuppliers);       // Step 1 typeahead
router.get('/suppliers/:id', controller.getSupplierDetail); // Step 1 contact autofill
router.get('/catalog', controller.searchCatalog);           // Step 2 product search
router.get('/init/:supplierId', controller.initFromSupplier);
router.get('/:id', controller.getById);

// Read-only extras — PDF export & email preview
// (must come after '/:id' is defined but that's fine since these are
// distinct, more-specific paths; Express matches by exact segment count)
router.get('/:id/pdf', controller.downloadPdf);
router.get('/:id/email-preview', controller.emailPreview);

// Create / update
router.post('/', controller.create);
router.patch('/:id', controller.update);

// Workflow actions
router.post('/:id/send', controller.send);               // Draft -> Sent (emails supplier)
router.post('/:id/withdraw', controller.withdraw);        // Sent -> Draft
router.post('/:id/receive', controller.receive);          // Sent/Partial -> Partial/Fully Received
router.post('/:id/cancel', controller.cancel);            // Any non-final -> Cancelled
router.post('/:id/resend-email', controller.resendEmail); // Resend supplier email
router.delete('/:id', controller.discard);                // Draft only

module.exports = router;