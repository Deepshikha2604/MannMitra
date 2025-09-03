const Joi = require('joi');

// Validation schemas
const schemas = {
  sendOTP: Joi.object({
    phone: Joi.string().pattern(/^(\+?[1-9]\d{1,14}|[0-9]{10})$/).required()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number (10 digits for India or international format)'
      })
  }),

  verifyOTP: Joi.object({
    phone: Joi.string().pattern(/^(\+?[1-9]\d{1,14}|[0-9]{10})$/).required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
      .messages({
        'string.length': 'OTP must be exactly 6 digits',
        'string.pattern.base': 'OTP must contain only numbers'
      })
  }),

  onboarding: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    age: Joi.number().integer().min(13).max(120).required(),
    gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').required(),
    location: Joi.string().min(2).max(100).required(),
    education_level: Joi.string().valid('primary', 'secondary', 'high_school', 'diploma', 'bachelor', 'master', 'phd', 'other').required(),
    occupation: Joi.string().min(2).max(100).required(),
    preferred_language: Joi.string().valid('hindi', 'english', 'bengali', 'telugu', 'marathi', 'tamil', 'gujarati', 'kannada', 'malayalam', 'punjabi').required(),
    comfort_level: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
    emergency_contact: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
  }),

  moodEntry: Joi.object({
    mood_score: Joi.number().integer().min(1).max(10).required(),
    mood_emoji: Joi.string().max(10).optional(),
    primary_emotion: Joi.string().max(50).required(),
    secondary_emotion: Joi.string().max(50).optional(),
    energy_level: Joi.number().integer().min(1).max(10).optional(),
    sleep_quality: Joi.number().integer().min(1).max(10).optional(),
    stress_level: Joi.number().integer().min(1).max(10).optional(),
    notes: Joi.string().max(1000).optional(),
    triggers: Joi.array().items(Joi.string().max(100)).optional(),
    activities_done: Joi.array().items(Joi.string().max(100)).optional(),
    location: Joi.string().max(100).optional(),
    weather: Joi.string().max(50).optional()
  }),

  chatMessage: Joi.object({
    content: Joi.string().min(1).max(2000).required(),
    content_type: Joi.string().valid('text', 'voice', 'image').default('text'),
    language: Joi.string().max(10).optional(),
    session_id: Joi.string().uuid().optional()
  }),

  crisisDetection: Joi.object({
    message: Joi.string().min(1).max(2000).required(),
    user_id: Joi.string().uuid().optional()
  })
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorDetails
      });
    }

    req.body = value;
    next();
  };
};

// Query parameter validation
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors: errorDetails
      });
    }

    req.query = value;
    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  schemas
};




