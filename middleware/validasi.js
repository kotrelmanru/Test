const { body, validationResult } = require('express-validator');

// Middleware untuk validasi input
const validateUserInput = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 3 }).withMessage('Name should be at least 3 characters long.'),

  body('email')
    .isEmail().withMessage('Invalid email format.')
    .normalizeEmail(),

  body('age')
    .isInt({ min: 1 }).withMessage('Age must be a positive integer.')
    .toInt(),
  
  // Middleware untuk memeriksa error setelah validasi
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); // Jika validasi berhasil, lanjutkan ke middleware berikutnya
  }
];
