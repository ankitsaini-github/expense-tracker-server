const mongoose = require("mongoose");
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
    default: Date.now,
  },
});


const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isProUser: {
    type: Boolean,
    default: false,
  },
  totalExpense: {
    type: Number,
    default: 0,
  },
  expenses: [expenseSchema],
});


module.exports = mongoose.model("User", userSchema);

// const Sequelize = require('sequelize');

// const sequelize = require('../util/database');

// const Users = sequelize.define('users', {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true
//   },
//   name: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   email: {
//     type: Sequelize.STRING,
//     allowNull: false,
//     unique: true,
//   },
//   password: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   isProUser: {
//     type: Sequelize.BOOLEAN,
//     defaultValue: false
//   },
//   totalExpense: {
//     type: Sequelize.FLOAT,
//     defaultValue: 0
//   },
// });

// module.exports = Users;