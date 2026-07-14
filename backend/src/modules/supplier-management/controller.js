const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

// ─── Suppliers ────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/supplier-management
 * List suppliers with optional query filters: status, category, search, page, limit
 */
const listSuppliers = asyncHandler(async (req, res) => {
  const { status, category, search, page, limit } = req.query;
  const result = await service.listSuppliers({
    status,
    category,
    search,
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 20,
  });
  res.status(200).json({ success: true, ...result });
});

/**
 * POST /api/v1/supplier-management
 * Create a new supplier
 */
const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await service.createSupplier(req.body);
  res.status(201).json({ success: true, message: 'Supplier created successfully', data: supplier });
});

/**
 * GET /api/v1/supplier-management/stats
 * Get summary statistics (total, active, pending counts + spend)
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await service.getStats();
  res.status(200).json({ success: true, data: stats });
});

/**
 * GET /api/v1/supplier-management/:id
 * Get a single supplier by MongoDB _id
 */
const getSupplier = asyncHandler(async (req, res) => {
  const supplier = await service.getSupplierById(req.params.id);
  res.status(200).json({ success: true, data: supplier });
});

/**
 * PUT /api/v1/supplier-management/:id
 * Update a supplier's fields
 */
const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await service.updateSupplier(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Supplier updated successfully', data: supplier });
});

/**
 * PATCH /api/v1/supplier-management/:id/status
 * Update a supplier's status
 */
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }
  const supplier = await service.updateStatus(req.params.id, status);
  res.status(200).json({ success: true, message: 'Status updated successfully', data: supplier });
});

/**
 * DELETE /api/v1/supplier-management/:id
 * Delete a supplier
 */
const deleteSupplier = asyncHandler(async (req, res) => {
  const result = await service.deleteSupplier(req.params.id);
  res.status(200).json({ success: true, message: 'Supplier deleted successfully', data: result });
});

// ─── Contacts ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/supplier-management/:id/contacts
 * Get all contacts for a supplier
 */
const getContacts = asyncHandler(async (req, res) => {
  const result = await service.getContacts(req.params.id);
  res.status(200).json({ success: true, data: result });
});

/**
 * POST /api/v1/supplier-management/:id/contacts
 * Add a new contact to a supplier
 */
const addContact = asyncHandler(async (req, res) => {
  const contact = await service.addContact(req.params.id, req.body);
  res.status(201).json({ success: true, message: 'Contact added successfully', data: contact });
});

/**
 * PUT /api/v1/supplier-management/:id/contacts/:contactId
 * Update a contact
 */
const updateContact = asyncHandler(async (req, res) => {
  const contact = await service.updateContact(req.params.id, req.params.contactId, req.body);
  res.status(200).json({ success: true, message: 'Contact updated successfully', data: contact });
});

/**
 * DELETE /api/v1/supplier-management/:id/contacts/:contactId
 * Remove a contact from a supplier
 */
const deleteContact = asyncHandler(async (req, res) => {
  const result = await service.deleteContact(req.params.id, req.params.contactId);
  res.status(200).json({ success: true, message: 'Contact removed successfully', data: result });
});

// ─── Performance ──────────────────────────────────────────────────────────────

/**
 * GET /api/v1/supplier-management/:id/performance
 * Get performance metrics for a supplier
 */
const getPerformance = asyncHandler(async (req, res) => {
  const result = await service.getPerformance(req.params.id);
  res.status(200).json({ success: true, data: result });
});

/**
 * PUT /api/v1/supplier-management/:id/performance
 * Update performance metrics for a supplier
 */
const updatePerformance = asyncHandler(async (req, res) => {
  const result = await service.updatePerformance(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Performance updated successfully', data: result });
});

module.exports = {
  listSuppliers,
  createSupplier,
  getStats,
  getSupplier,
  updateSupplier,
  updateStatus,
  deleteSupplier,
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  getPerformance,
  updatePerformance,
};
