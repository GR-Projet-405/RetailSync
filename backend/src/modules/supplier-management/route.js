const express = require('express');
const router = express.Router();
const controller = require('./controller');

// ─── Supplier Stats (must come before /:id to avoid collision) ────────────────
router.get('/stats', controller.getStats);

// ─── Supplier CRUD ────────────────────────────────────────────────────────────
router.get('/',    controller.listSuppliers);   // GET  /api/v1/supplier-management
router.post('/',   controller.createSupplier);  // POST /api/v1/supplier-management

router.get('/:id',    controller.getSupplier);    // GET    /api/v1/supplier-management/:id
router.put('/:id',    controller.updateSupplier); // PUT    /api/v1/supplier-management/:id
router.delete('/:id', controller.deleteSupplier); // DELETE /api/v1/supplier-management/:id

// ─── Contacts ─────────────────────────────────────────────────────────────────
router.get('/:id/contacts',                    controller.getContacts);    // GET    contacts
router.post('/:id/contacts',                   controller.addContact);     // POST   add contact
router.put('/:id/contacts/:contactId',         controller.updateContact);  // PUT    update contact
router.delete('/:id/contacts/:contactId',      controller.deleteContact);  // DELETE remove contact

// ─── Performance ──────────────────────────────────────────────────────────────
router.get('/:id/performance',  controller.getPerformance);   // GET  performance metrics
router.put('/:id/performance',  controller.updatePerformance); // PUT  update metrics

module.exports = router;
