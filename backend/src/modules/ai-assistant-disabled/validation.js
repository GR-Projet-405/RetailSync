const Joi = require('joi');

const objectId = Joi.string().hex().length(24);
const dateValue = Joi.alternatives().try(Joi.date().iso(), Joi.date());

const chatSchema = Joi.object({
  message: Joi.string().trim().min(1).max(1000).required(),
  conversationId: objectId.allow('', null).optional(),
  filters: Joi.object({
    startDate: dateValue.optional(),
    endDate: dateValue.optional(),
    branchId: objectId.allow('', null).optional(),
    branchCode: Joi.string().trim().max(30).uppercase().allow('', null).optional(),
    period: Joi.string().valid('daily', 'weekly', 'monthly').default('daily'),
    limit: Joi.number().integer().min(1).max(20).default(5),
  }).default({}),
});

const historyQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  status: Joi.string().valid('ACTIVE', 'ARCHIVED').default('ACTIVE'),
});

const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map((detail) => detail.message),
    });
  }

  req.body = value;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    return res.status(422).json({
      success: false,
      message: 'Invalid query parameters',
      errors: error.details.map((detail) => detail.message),
    });
  }

  req.query = value;
  next();
};

module.exports = {
  chatSchema,
  historyQuerySchema,
  validateBody,
  validateQuery,
};
