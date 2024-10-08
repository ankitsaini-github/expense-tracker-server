const express = require("express");
const mongoose = require('mongoose')

const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
const mongoose_key = process.env.MONGOOSE_KEY;

// const sequelize = require("./util/database");
const authRoutes = require("./routes/auth");
const expenseRoutes = require("./routes/expense");
const checkoutRoutes = require("./routes/checkout");
const premiumRoutes = require("./routes/premium");

// const Expenses = require("./models/expenses");
// const Users = require("./models/users");
// const DownloadFiles = require("./models/downloadFiles");
// const ForgotPasswordRequests = require("./models/forgotPasswordRequests");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(cors());
app.use(helmet());
app.use(morgan("combined",{stream: accessLogStream}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ extended: false }));

app.use("/user", authRoutes);
app.use("/expenses", expenseRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/premium", premiumRoutes);

// Users.hasMany(Expenses);
// Expenses.belongsTo(Users);

// Users.hasMany(DownloadFiles);
// DownloadFiles.belongsTo(Users);

// Users.hasMany(ForgotPasswordRequests);
// ForgotPasswordRequests.belongsTo(Users);

mongoose
  .connect(mongoose_key)
  .then(() => {
    app.listen(port);
    console.log(
      `\u001b[1;32m app listening on port --> http://localhost:${port} \u001b[0m`
    );
  })
  .catch((err) => {
    console.log(err);
  });
