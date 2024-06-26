const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Expenses = sequelize.define('expenses', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  amount: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  category: {
    type: Sequelize.STRING,
    allowNull: false
  },
  date: {
    type: Sequelize.DATEONLY,
    allowNull: false
  },
});

module.exports = Expenses;