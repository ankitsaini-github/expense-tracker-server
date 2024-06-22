const Expense = require('../models/expenses');
const User = require('../models/users');
const sequelize = require('../util/database');
const { Op } = require('sequelize');
const moment = require('moment');
const AWS = require('aws-sdk');
require("dotenv").config();

const expenseController = require('./expense');

const uploadToS3 = (data, filename)=>{
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
};

exports.downloadExpense = async(req,res)=>{

  try {
    console.log('fetching--');
    const date = new Date().toISOString().split('T')[0];
    const expenses = await expenseController.fetchAll(req)
    console.log('expenses == ',expenses);
    
    const stringifiedExpenses = JSON.stringify(expenses);
    const filename = `${req.user.name}-expenses-${date}.txt`;
    const fileURL = uploadToS3(stringifiedExpenses,filename);

    console.log('uploaded = ',fileURL)
    // return res.status(201).json({fileURL,success:true})

  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

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

//reports

exports.getReport = async(req,res)=>{
  const { date, month } = req.query;
  const userId = req.user.id;
  // console.log('uid = ',userId)
  try {
    let expenses;
    if (date) {
      // console.log('date = ',date)
      expenses = await Expense.findAll({
        where: {
          date,
          userId,
        }
      });
    } else if (month) {
      const startDate=moment(month).startOf('month').format('YYYY-MM-DD');
      const endDate=moment(month).endOf('month').format('YYYY-MM-DD');
      // console.log('month = ',startDate,endDate)

      expenses = await Expense.findAll({
        where: {
          date: {
            [Op.between]: [startDate,endDate]
          },
          userId,
        }
      });
    } else {
      // console.log('empty------')
      expenses = [];
    }
    // console.log('report = ',expenses)
    return res.status(200).json(expenses);
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching Report.' });
  }
};