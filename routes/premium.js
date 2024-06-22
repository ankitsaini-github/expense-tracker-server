const express = require('express');

const {authenticateUser} = require('../middlewares/auth');
const premiumController = require('../controllers/premium');

const router = express.Router();

router.get('/leaderboard', premiumController.leaderboard);
router.get('/reports', authenticateUser, premiumController.getReport);
router.get('/download', authenticateUser, premiumController.downloadExpense);

module.exports = router;