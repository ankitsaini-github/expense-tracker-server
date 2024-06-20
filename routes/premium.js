const express = require('express');

const premiumController = require('../controllers/premium');

const router = express.Router();

router.get('/leaderboard',premiumController.leaderboard);

module.exports = router;