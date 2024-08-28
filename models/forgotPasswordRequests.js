const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const forgotPasswordRequestSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const ForgotPasswordRequest = mongoose.model("ForgotPasswordRequest", forgotPasswordRequestSchema);

module.exports = ForgotPasswordRequest;


// const Sequelize = require('sequelize');

// const sequelize = require('../util/database');

// const ForgotPasswordRequests = sequelize.define('forgotPasswordRequests', {
//   id: {
//     type: Sequelize.STRING,
//     allowNull:false,
//     primaryKey: true
//   },
//   isActive: {
//     type: Sequelize.BOOLEAN,
//     allowNull: true,
//   },
// });

// module.exports = ForgotPasswordRequests;