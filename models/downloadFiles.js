const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const DownloadFiles = sequelize.define('downloadfiles', {
  id: {
    type: Sequelize.STRING,
    allowNull:false,
    primaryKey: true
  },
  link: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = DownloadFiles;