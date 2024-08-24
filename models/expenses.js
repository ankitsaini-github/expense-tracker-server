const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user'
  }
});

module.exports = mongoose.model('Expense', expenseSchema);


// const Sequelize = require('sequelize');

// const sequelize = require('../util/database');

// const Expenses = sequelize.define('expenses', {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true
//   },
//   amount: {
//     type: Sequelize.FLOAT,
//     allowNull: false
//   },
//   description: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },
//   category: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   date: {
//     type: Sequelize.DATEONLY,
//     allowNull: false
//   },
// });

// module.exports = Expenses;