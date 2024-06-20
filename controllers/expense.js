const Expenses = require('../models/expenses');

//fetch all expense
exports.fetchAll = async (req, res) => {
  const uid = req.user.id;
  try {
    const expenses = await Expenses.findAll({ where: { userId: uid } });
    if (!expenses) {
      return res.status(404).json({ error: 'No expenses found.' });
    }
    res.status(200).json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
};

// new expense
exports.addExpense = async (req, res) => {
  const { amount, description, category } = req.body;
  const userId = req.user.id;
  
  if (!amount || !description || !category) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const result = await Expenses.create({ amount, description, category, userId });
    res.status(201).send(result);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to add expense.' });
  }
};

//delete expense
exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const expense = await Expenses.findByPk(id);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found.' });
    }
    if(expense.userId != userId){
      return res.status(403).json({ error: 'Unauthorized action.' });
    }
    
    await expense.destroy();
    res.status(200).json({ message: 'Expense deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete expense.' });
  }
};