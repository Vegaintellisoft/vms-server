const { body, param, query, validationResult } = require("express-validator");

/**
 * Middleware to check validation results
 * Must be called after validation rules
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
      receivedBody: req.body,
    });
  }
  next();
};

/**
 * Validation rules for authentication
 */
const loginValidation = [
  body("emailId")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters"),
  validate,
];

/**
 * Validation rules for visitor registration
 */
const visitorValidation = [
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ max: 50 })
    .withMessage("First name must be less than 50 characters"),
  body("last_name")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("Last name must be less than 50 characters"),
  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("phone")
    .matches(/^[0-9]{10}$/)
    .withMessage("Phone must be a 10-digit number"),
  body("gender")
    .optional({ checkFalsy: true })
    .isIn(["male", "female", "other", "Male", "Female", "Other"])
    .withMessage("Gender must be male, female, or other"),
  body("aadhar_no")
    .optional({ checkFalsy: true })
    .matches(/^[0-9]{12}$/)
    .withMessage("Aadhar must be a 12-digit number"),
  validate,
];

/**
 * Validation rules for OTP
 */
// Visitor: Phone only
const visitorOtpValidation = [
  body("phone").custom((value) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (phoneRegex.test(value)) return true;
    throw new Error("Phone must be a valid 10-digit number");
  }),
  validate,
];

const visitorVerifyOtpValidation = [
  body("phone").custom((value) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (phoneRegex.test(value)) return true;
    throw new Error("Phone must be a valid 10-digit number");
  }),
  body("otp")
    .isLength({ min: 4, max: 6 })
    .withMessage("OTP must be 4-6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),
  validate,
];

// Appointment: Contact (Email or Phone)
const appointmentOtpValidation = [
  body("contact").custom((value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    if (emailRegex.test(value) || phoneRegex.test(value)) return true;
    throw new Error("Contact must be a valid email or 10-digit phone number");
  }),
  validate,
];

const appointmentVerifyOtpValidation = [
  body("contact").custom((value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    if (emailRegex.test(value) || phoneRegex.test(value)) return true;
    throw new Error("Contact must be a valid email or 10-digit phone number");
  }),
  body("otp")
    .isLength({ min: 4, max: 6 })
    .withMessage("OTP must be 4-6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),
  validate,
];

/**
 * Validation rules for appointment
 */
const appointmentValidation = [
  body("first_name").trim().notEmpty().withMessage("First name is required"),
  body("last_name").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone")
    .matches(/^[0-9]{10}$/)
    .withMessage("Phone must be a 10-digit number"),
  body("appointment_date")
    .notEmpty()
    .withMessage("Appointment date is required"),
  body("appointment_time")
    .notEmpty()
    .withMessage("Appointment time is required"),
  body("purpose_of_visit")
    .notEmpty()
    .withMessage("Purpose of visit is required"),
  validate,
];

/**
 * Validation for ID parameters
 */
const idParamValidation = [
  param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  validate,
];

/**
 * Validation for employee creation
 */
const employeeValidation = [
  body("first_name").trim().notEmpty().withMessage("First name is required"),
  body("last_name").trim().notEmpty().withMessage("Last name is required"),
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("phone")
    .matches(/^[0-9]{10}$/)
    .withMessage("Phone must be a 10-digit number"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  validate,
];

module.exports = {
  validate,
  loginValidation,
  visitorValidation,
  visitorOtpValidation,
  visitorVerifyOtpValidation,
  appointmentOtpValidation,
  appointmentVerifyOtpValidation,
  appointmentValidation,
  idParamValidation,
  employeeValidation,
};
