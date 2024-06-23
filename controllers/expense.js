const Expenses = require("../models/expenses");
const Users = require("../models/users");
const sequelize = require("../util/database");

//fetch all expense
exports.fetchAll = async (req, res) => {
  const uid = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {

    if(req.query.page){
      const { count, rows: expenses } = await Expenses.findAndCountAll({
        where:{userId:uid},
        offset: parseInt(offset),
        limit: parseInt(limit)
      });
  
      console.log('fetched ',count , expenses.length);
      const totalPages = Math.ceil(count / limit);
  
      return res.status(200).json({
        expenses,
        totalPages
      });
      
    }else{
      // console.log('no query ---- ')
      const expenses = await Expenses.findAll({ where: { userId: uid } });
      if (!expenses) {
        return res?res.status(404).json({ error: "No expenses found." }):[];
      }
      // console.log('got expense = ',expenses);
      return res?res.status(200).json(expenses):expenses;
    }

  } catch (err) {
    console.error(err);
    return res?res.status(500).json({ error: "Failed to fetch expenses." }):[];
  }
};

// new expense
exports.addExpense = async (req, res) => {
  const { amount, description, category } = req.body;
  const userId = req.user.id;

  if (!amount || !description || !category) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      const date = new Date().toISOString().split('T')[0];
      const expense = await Expenses.create(
        { amount, description, category, date, userId },
        { transaction: t }
      );

      const user = await Users.findByPk(userId, { transaction: t });

      user.totalExpense += parseFloat(amount);
      await user.save({ transaction: t });

      return expense;
    });

    res.status(201).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add expense." });
  }
};

//delete expense
exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const result = await sequelize.transaction(async (t) => {
      const expense = await Expenses.findByPk(id, { transaction: t });

      if (!expense) {
        return res.status(404).json({ error: "Expense not found." });
      }

      if (expense.userId != userId) {
        return res.status(403).json({ error: "Unauthorized action." });
      }

      await expense.destroy({ transaction: t });

      const user = await Users.findByPk(userId, { transaction: t });

      user.totalExpense -= parseFloat(expense.amount);
      await user.save({ transaction: t });

      return expense;
    });

    res
      .status(200)
      .json({
        message: "Expense deleted successfully.",
        deletedExpense: result,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete expense." });
  }
};
