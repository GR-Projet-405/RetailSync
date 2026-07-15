const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createUserActionSchema = Joi.object({
  userId: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'userId must be a valid MongoDB ObjectId',
    'any.required': 'userId is required'
  }),
  userName: Joi.string().required().messages({
    'any.required': 'userName is required'
  }),
  role: Joi.string().required().messages({
    'any.required': 'role is required'
  }),
  branch: Joi.string().required().messages({
    'any.required': 'branch is required'
  }),
  module: Joi.string().required().messages({
    'any.required': 'module is required'
  }),
  actionType: Joi.string().required().messages({
    'any.required': 'actionType is required'
  }),
  description: Joi.string().required().messages({
    'any.required': 'description is required'
  }),
  metadata: Joi.object().optional().default({}),
  riskLevel: Joi.string().valid('Low', 'Medium', 'High').optional().default('Low'),
  ipAddress: Joi.string().ip({ version: ['ipv4', 'ipv6'] }).optional().default('127.0.0.1'),
  device: Joi.string().optional().default('Unknown Device')
});

const validateCreateUserAction = (req, res, next) => {
  const { error, value } = createUserActionSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message);
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: messages,
    });
  }

  req.body = value;
  next();
};

module.exports = {
  validateCreateUserAction
};
