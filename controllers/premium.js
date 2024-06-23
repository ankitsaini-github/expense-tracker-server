const Expense = require('../models/expenses');
const User = require('../models/users');
const DownloadFiles = require('../models/downloadFiles');
const sequelize = require('../util/database');
const { Op } = require('sequelize');
const moment = require('moment');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

const expenseController = require('./expense');

const uploadToS3 = (data, filename)=>{

  const s3bucket = new AWS.S3({
    accessKeyId: process.env.IAM_USER_KEY,
    secretAccessKey: process.env.IAM_USER_SECRET,
  });

  
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: 'public-read'
  }

  return new Promise ((resolve,reject)=>{
    s3bucket.upload(params, (err,s3res)=>{
      if(err){
        // console.log('s3 upload error = ',err)
        reject(err);
      }
      else{
        // console.log('s3 upload success = ',s3res)
        resolve(s3res);
      }
    });
  })
    
};

exports.downloadExpense = async(req,res)=>{

  try {
    console.log('fetching--');
    const date = new Date().toISOString().replace(/[:.]/g,'-');
    const expenses = await expenseController.fetchAll(req)
    
    const stringifiedExpenses = JSON.stringify(expenses);
    const filename = `Expenses/${req.user.id}-${date}.txt`;
    const fileURL = await uploadToS3(stringifiedExpenses,filename);

    // console.log('uploaded = ',fileURL)
    
    if(fileURL.Location){
      const filelink = await DownloadFiles.create({
        id:uuidv4(),
        link: fileURL.Location,
        userId: req.user.id
      })
      return res.status(201).json({fileURL:filelink.link,success:true})
    }else{
      throw new Error('Error uploading')
    }


  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

exports.downloadAllFiles = async(req,res)=>{
  try {
    const files = await DownloadFiles.findAll({ where: { userId: req.user.id } });
    if (files.length==0) {
      return res.status(404).json({ error: "No files found." });
    }
    // console.log('files = ',files);
    return res.status(200).json(files);

  } catch (error) {
    console.log('eeeee======= ',error);
    return res.status(500).json(error);
  }
}

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