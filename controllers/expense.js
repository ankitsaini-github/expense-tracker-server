const mongoose = require('mongoose')
const Expense = require("../models/expenses");
const User = require("../models/users");


//fetch all expense
exports.fetchAll = async (req, res) => {
  const uid = req.user._id;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  try {
    if (req.query.page) {
      // with pagination
      const [expenses, count] = await Promise.all([
        Expense.find({ userId: uid })
          .skip(parseInt(skip))
          .limit(parseInt(limit)),
        Expense.countDocuments({ userId: uid })
      ]);

      const totalPages = Math.ceil(count / limit);

      // console.log('expenses = ',expenses)
      return res.status(200).json({
        expenses,
        totalPages
      });

    } else {
      // without pagination
      const expenses = await Expense.find({ userId: uid });

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
      
      // Create a new expense
      const expense = new Expense({ amount, description, category, date, userId });
      await expense.save({ session });

      // Find user and update total expense
      const user = await User.findById(userId).session(session);
      user.totalExpense += parseFloat(amount);
      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).send(expense);
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
    const session = await Expense.startSession();
    session.startTransaction();

    try {
      const expense = await Expense.findById(id).session(session); //find

      if (!expense) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: "Expense not found." });
      }

      if (expense.userId.toString() !== userId.toString()) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ error: "Unauthorized action." });
      }

      await expense.deleteOne({ session }); //delete

      const user = await User.findById(userId).session(session);
      user.totalExpense -= parseFloat(expense.amount);
      await user.save({ session }); //save

      await session.commitTransaction(); //commit
      session.endSession();

      res.status(200).json({
        message: "Expense deleted successfully.",
        deletedExpense: expense,
      });
    } catch (err) {
      await session.abortTransaction(); //rollback
      session.endSession();
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete expense." });
  }
};
