const express = require('express')
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

const sequelize = require('./util/database');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expense');
const checkoutRoutes = require('./routes/checkout');
const premiumRoutes = require('./routes/premium');

const Expenses = require('./models/expenses');
const Users = require('./models/users');
const DownloadFiles = require('./models/downloadFiles');
const ForgotPasswordRequests = require('./models/forgotPasswordRequests');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ extended: false }));

app.use("/user", authRoutes);
app.use("/expenses", expenseRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/premium", premiumRoutes);

Users.hasMany(Expenses);
Expenses.belongsTo(Users);

Users.hasMany(DownloadFiles);
DownloadFiles.belongsTo(Users);

Users.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(Users);

sequelize.sync().then(() => {
  app.listen(3000);
  console.log(`\u001b[1;32m app listening on port --> http://localhost:${port} \u001b[0m`)

}).catch(err => {
  console.log(err);
})