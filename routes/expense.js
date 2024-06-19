const path = require('path');

const express = require('express');

const expenseController = require('../controllers/expense');
const {authenticateUser} = require('../middlewares/auth');

const router = express.Router();

router.get('/fetch-all',authenticateUser ,expenseController.fetchAll);

router.post('/add-expense',authenticateUser ,expenseController.addExpense);

router.delete('/delete-expense/:id',authenticateUser, expenseController.deleteExpense);

module.exports = router;