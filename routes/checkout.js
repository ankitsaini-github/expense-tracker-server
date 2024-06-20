const path = require('path');

const express = require('express');

const checkoutController = require('../controllers/checkout');
const {authenticateUser} = require('../middlewares/auth');

const router = express.Router();

router.get('/buy-pro',authenticateUser ,checkoutController.buyPro);
router.post('/update-status',authenticateUser ,checkoutController.updateStatus);

module.exports = router;