const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

// ── Generate report ──────────────────────────────────────────────────────────

const generateReportSchema = Joi.object({
  type: Joi.string()
    .valid('SALES', 'INVENTORY', 'FINANCE', 'EMPLOYEE', 'CUSTOMER')
    .uppercase()
    .required()
    .messages({
      'any.only':     'Report type must be one of: SALES, INVENTORY, FINANCE, EMPLOYEE, CUSTOMER',
      'any.required': 'Report type is required',
    }),

  name: Joi.string().trim().max(200).optional().messages({
    'string.max': 'Report name cannot exceed 200 characters',
  }),

  dateFrom: Joi.date().iso().optional().messages({
    'date.format': 'dateFrom must be a valid ISO date',
  }),

  dateTo: Joi.date().iso().min(Joi.ref('dateFrom')).optional().messages({
    'date.format': 'dateTo must be a valid ISO date',
    'date.min':    'dateTo must be after dateFrom',
  }),

  allBranches: Joi.boolean().default(true),

  branches: Joi.array()
    .items(objectId.messages({ 'string.length': 'Invalid branch ID format' }))
    .optional(),

  additionalFilters: Joi.object().optional(),
});

// ── Middleware factory ────────────────────────────────────────────────────────

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly:    false,
    stripUnknown:  true,
    convert:       true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message);
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors:  messages,
    });
  }

  req.body = value;
  next();
};

module.exports = { generateReportSchema, validate };
