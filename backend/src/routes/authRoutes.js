const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');
const validate = require('../validators');
const { loginSchema, refreshTokenSchema, registerSchema } = require('../validators/authValidator');

// POST /auth/login
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// POST /auth/register - Admin registration (public, but should be protected in production)
router.post('/register', authLimiter, validate(registerSchema), authController.register);

// POST /auth/refresh
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

// POST /auth/logout
router.post('/logout', authenticate, authController.logout);

module.exports = router;


