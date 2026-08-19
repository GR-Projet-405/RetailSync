const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken, hasPermission } = require('../../middleware/auth.middleware');
const { PERMISSIONS } = require('../../config/permissions');

router.use(verifyToken);

// ─── Supplier Stats (must come before /:id to avoid collision) ────────────────
router.get('/stats', hasPermission(PERMISSIONS.SUPPLIERS_VIEW), controller.getStats);

// ─── Supplier CRUD ────────────────────────────────────────────────────────────
router.get('/',    hasPermission(PERMISSIONS.SUPPLIERS_VIEW),   controller.listSuppliers);   // GET  /api/v1/supplier-management
router.post('/',   hasPermission(PERMISSIONS.SUPPLIERS_MANAGE), controller.createSupplier);  // POST /api/v1/supplier-management

router.get('/:id',          hasPermission(PERMISSIONS.SUPPLIERS_VIEW),   controller.getSupplier);       // GET    /api/v1/supplier-management/:id
router.put('/:id',          hasPermission(PERMISSIONS.SUPPLIERS_MANAGE), controller.updateSupplier);    // PUT    /api/v1/supplier-management/:id
router.patch('/:id/status', hasPermission(PERMISSIONS.SUPPLIERS_MANAGE), controller.updateStatus);      // PATCH  /api/v1/supplier-management/:id/status
router.patch('/:id/deactivate', hasPermission(PERMISSIONS.SUPPLIERS_MANAGE), controller.deactivateSupplier); // PATCH /api/v1/supplier-management/:id/deactivate
router.delete('/:id',       hasPermission(PERMISSIONS.SUPPLIERS_MANAGE), controller.deleteSupplier);    // DELETE /api/v1/supplier-management/:id

// ─── Contacts ─────────────────────────────────────────────────────────────────
router.get('/:id/contacts',                         hasPermission(PERMISSIONS.SUPPLIERS_VIEW),   controller.getContacts);    // GET    contacts
router.post('/:id/contacts',                        hasPermission(PERMISSIONS.SUPPLIERS_MANAGE), controller.addContact);     // POST   add contact
router.put('/:id/contacts/:contactId',              hasPermission(PERMISSIONS.SUPPLIERS_MANAGE), controller.updateContact);  // PUT    update contact
router.delete('/:id/contacts/:contactId',           hasPermission(PERMISSIONS.SUPPLIERS_MANAGE), controller.deleteContact);  // DELETE remove contact
router.post('/:id/contacts/:contactId/notes',       hasPermission(PERMISSIONS.SUPPLIERS_MANAGE), controller.addContactNote); // POST   add note to contact

// ─── Performance ──────────────────────────────────────────────────────────────
router.get('/:id/performance',  hasPermission(PERMISSIONS.SUPPLIERS_VIEW),   controller.getPerformance);   // GET  performance metrics
router.put('/:id/performance',  hasPermission(PERMISSIONS.SUPPLIERS_MANAGE), controller.updatePerformance); // PUT  update metrics

module.exports = router;
