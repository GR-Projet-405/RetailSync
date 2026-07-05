const Joi = require('joi');

const SUBJECT_OPTIONS = [
  'Technical Issue',
  'Billing',
  'Account Access',
  'Feature Request',
  'Other',
];

const createContactMessageSchema = Joi.object({
  fullName: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Full name is required',
    'any.required': 'Full name is required',
  }),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  subject: Joi.string()
    .valid(...SUBJECT_OPTIONS)
    .required()
    .messages({
      'any.only': 'Subject must be a valid option',
      'any.required': 'Subject is required',
    }),
  message: Joi.string().trim().min(1).max(5000).required().messages({
    'string.empty': 'Message is required',
    'any.required': 'Message is required',
  }),
  attachments: Joi.array()
    .items(
      Joi.object({
        fileName: Joi.string().trim().required(),
        fileType: Joi.string().trim().allow(''),
      })
    )
    .optional()
    .default([]),
});

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
  createContactMessageSchema,
  validate,
};