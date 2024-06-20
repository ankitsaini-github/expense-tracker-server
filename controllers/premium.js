const Expense = require('../models/expenses');
const User = require('../models/users');
const sequelize = require('../util/database');

exports.leaderboard = async(req, res, next) => {
  
  try {
    // const users = await User.findAll({
    //   attributes: [
    //     'id',
    //     'name',
    //     [sequelize.fn('SUM', sequelize.col('Expenses.amount')), 'totalExpenses']
    //   ],
    //   include: [{
    //     model: Expense,
    //     attributes: []
    //   }],
    //   group: ['id'],
    //   order: [[sequelize.literal('totalExpenses'), 'DESC']],
    //   raw: true,
    // });
    
    const users = await User.findAll({
      attributes: ['id', 'name', 'totalExpense'],
      order: [['totalExpense', 'DESC']]
    })

    return res.status(200).send(users);
  } catch (error) {
    
    return res.status(500).json({error:'failed to fetch--------'})
  }
};