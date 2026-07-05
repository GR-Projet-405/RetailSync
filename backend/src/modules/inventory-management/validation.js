const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

// ─── Reorder Level ────────────────────────────────────────────────────────────

const reorderLevelSchema = Joi.object({
  reorderLevel: Joi.number().integer().min(0).required().messages({
    'number.min':    'Reorder level cannot be negative',
    'any.required':  'Reorder level is required',
  }),
});

// ─── Record Movement ──────────────────────────────────────────────────────────

const MOVEMENT_TYPES = [
  'SALE', 'PURCHASE',
  'TRANSFER_IN', 'TRANSFER_OUT',
  'ADJUSTMENT_ADD', 'ADJUSTMENT_REMOVE',
  'RETURN_IN', 'RETURN_OUT', 'DAMAGE_WRITE_OFF',
];

const recordMovementSchema = Joi.object({
  type:          Joi.string().valid(...MOVEMENT_TYPES).required().messages({
    'any.only':   `Type must be one of: ${MOVEMENT_TYPES.join(', ')}`,
    'any.required': 'Movement type is required',
  }),
  productId:     objectId.required().messages({ 'any.required': 'Product ID is required' }),
  warehouseId:   objectId.required().messages({ 'any.required': 'Warehouse ID is required' }),
  toWarehouseId: objectId.allow(null, '').optional(),
  quantity:      Joi.number().integer().min(1).required().messages({
    'number.min':   'Quantity must be at least 1',
    'any.required': 'Quantity is required',
  }),
  unitCost:      Joi.number().min(0).allow(null).optional(),
  referenceId:   Joi.string().trim().allow(null, '').optional(),
  notes:         Joi.string().trim().max(500).allow(null, '').optional(),
});

// ─── Create Adjustment ────────────────────────────────────────────────────────

const ADJUSTMENT_REASONS = [
  'DAMAGED', 'EXPIRED', 'SUPPLIER_DELIVERY', 'FOUND_SURPLUS',
  'THEFT_LOSS', 'SYSTEM_CORRECTION', 'RETURN_TO_SUPPLIER', 'OTHER',
];

const createAdjustmentSchema = Joi.object({
  productId:   objectId.required().messages({ 'any.required': 'Product ID is required' }),
  warehouseId: objectId.required().messages({ 'any.required': 'Warehouse ID is required' }),
  type:        Joi.string().valid('ADD', 'REMOVE').required().messages({
    'any.only':   'Type must be ADD or REMOVE',
    'any.required': 'Adjustment type is required',
  }),
  quantity:    Joi.number().integer().min(1).required().messages({
    'number.min':   'Quantity must be at least 1',
    'any.required': 'Quantity is required',
  }),
  reason:      Joi.string().valid(...ADJUSTMENT_REASONS).required().messages({
    'any.only':     `Reason must be one of: ${ADJUSTMENT_REASONS.join(', ')}`,
    'any.required': 'Reason is required',
  }),
  notes:       Joi.string().trim().max(500).allow(null, '').optional(),
  evidenceUrl: Joi.string().uri().allow(null, '').optional(),
});

// ─── Reject Adjustment ────────────────────────────────────────────────────────

const rejectAdjustmentSchema = Joi.object({
  rejectionReason: Joi.string().trim().max(500).allow(null, '').optional(),
});

// ─── Validation Middleware ────────────────────────────────────────────────────

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map((d) => d.message),
    });
  }

  req.body = value;
  next();
};

module.exports = {
  reorderLevelSchema,
  recordMovementSchema,
  createAdjustmentSchema,
  rejectAdjustmentSchema,
  validate,
};
