const mongoose = require('mongoose')
// const Expense = require("../models/expenses");
const User = require("../models/users");


//fetch all expense
exports.fetchAll = async (req, res) => {
  const uid = req.user._id;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const user = await User.findById(uid);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    let expenses;
    if (req.query.page) {
      // Pagination
      const totalExpenses = user.expenses.length;
      const totalPages = Math.ceil(totalExpenses / limit);
      expenses = user.expenses.slice(skip, skip + parseInt(limit));

      return res.status(200).json({
        expenses,
        totalPages
      });
    } else {
      // Without pagination
      expenses = user.expenses;
      
      if (!expenses.length) {
        return res.status(404).json({ error: "No expenses found." });
      }

      return res.status(200).json(expenses);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch expenses." });
  }
};

// new expense
exports.addExpense = async (req, res) => {
  const { amount, description, category } = req.body;
  const userId = req.user._id;

  if (!amount || !description || !category) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const date = new Date().toISOString().split('T')[0];

      const user = await User.findById(userId).session(session);

      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: "User not found." });
      }

      const newExpense = { amount, description, category, date };
      user.expenses.push(newExpense);
      user.totalExpense += parseFloat(amount);

      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).send(newExpense);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add expense." });
  }
};

//delete expense
exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);

      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: "User not found." });
      }

      const expenseIndex = user.expenses.findIndex(exp => exp._id.toString() === id);
      if (expenseIndex === -1) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: "Expense not found." });
      }

      const expense = user.expenses[expenseIndex];
      user.totalExpense -= parseFloat(expense.amount);
      user.expenses.splice(expenseIndex, 1); // Remove the expense

      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        message: "Expense deleted successfully.",
        deletedExpense: expense,
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete expense." });
  }
};
