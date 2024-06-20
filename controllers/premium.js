const Expense = require('../models/expenses');
const User = require('../models/users');
const sequelize = require('../util/database');

exports.leaderboard = async(req, res, next) => {
  console.log('start') // test
  try {
    const users = await User.findAll({
      attributes: [
        'id',
        'name',
        [sequelize.fn('SUM', sequelize.col('Expenses.amount')), 'totalExpenses']
      ],
      include: [{
        model: Expense,
        // as: 'Expenses',
        attributes: []
      }],
      group: ['id'],
      order: [[sequelize.literal('totalExpenses'), 'DESC']],
      raw: true,
    });
    console.log('user--',users)//test
    return res.status(200).send(users);
  } catch (error) {
    console.log(error)//test
    return res.status(500).json({error:'failed to fetch--------'})
  }
};