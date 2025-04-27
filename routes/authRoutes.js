const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/check-auth', authController.checkAuth);

module.exports = router;