const Joi = require('joi');

const STATUS = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'];

// ─── Create User Validation ───────────────────────────────
const createUserSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'First name is required',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'Last name is required',
    'any.required': 'Last name is required',
  }),
  username: Joi.string()
    .trim()
    .lowercase()
    .min(3)
    .max(30)
    .pattern(/^[a-z0-9_]+$/)
    .required()
    .messages({
      'string.empty': 'Username is required',
      'string.pattern.base': 'Username can only contain lowercase letters, numbers, and underscores',
      'any.required': 'Username is required',
    }),
  email: Joi.string().trim().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'Password is required',
  }),
  phoneNumber: Joi.string().trim().allow('', null).optional(),
  profileImage: Joi.string().uri().allow('', null).optional(),
  roleId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Role ID is required',
    'string.length': 'Invalid Role ID format',
    'string.hex': 'Invalid Role ID format',
  }),
  branchId: Joi.string().hex().length(24).allow(null, '').optional(),
  status: Joi.string()
    .valid(...STATUS)
    .default('ACTIVE')
    .optional(),
  employeeId: Joi.string().trim().optional(),
});

// ─── Update User Validation ───────────────────────────────
const updateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50).optional(),
  lastName: Joi.string().trim().min(1).max(50).optional(),
  username: Joi.string()
    .trim()
    .lowercase()
    .min(3)
    .max(30)
    .pattern(/^[a-z0-9_]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'Username can only contain lowercase letters, numbers, and underscores',
    }),
  email: Joi.string().trim().email({ tlds: { allow: false } }).optional(),
  phoneNumber: Joi.string().trim().allow('', null).optional(),
  profileImage: Joi.string().uri().allow('', null).optional(),
  roleId: Joi.string().hex().length(24).optional(),
  branchId: Joi.string().hex().length(24).allow(null, '').optional(),
  status: Joi.string()
    .valid(...STATUS)
    .optional(),
  employeeId: Joi.string().trim().optional(),
}).min(1);

// ─── Status Update Validation ─────────────────────────────
const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...STATUS)
    .required()
    .messages({
      'any.only': `Status must be one of: ${STATUS.join(', ')}`,
      'any.required': 'Status is required',
    }),
});

// ─── Reset Password Validation ────────────────────────────
const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(8).required().messages({
    'string.empty': 'New password is required',
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'New password is required',
  }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Confirm password is required',
    }),
});

// ─── Role Assignment Validation ───────────────────────────
const updateRoleSchema = Joi.object({
  roleId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Role ID is required',
    'string.length': 'Invalid Role ID format',
    'string.hex': 'Invalid Role ID format',
  }),
});

// ─── Validation Middleware Factory ────────────────────────
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
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
  createUserSchema,
  updateUserSchema,
  updateStatusSchema,
  resetPasswordSchema,
  updateRoleSchema,
  validate,
};
