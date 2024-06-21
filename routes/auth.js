const path = require('path');

const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.post('/signup',authController.signUp);

router.post('/login',authController.logIn);

router.post('/forgot-password',authController.forgotPassword);

router.get('/reset-password/:id',authController.resetPasswordPage);

router.post('/reset-password/:id',authController.resetPassword);

module.exports = router;