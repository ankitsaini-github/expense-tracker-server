const express = require('express')
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

const sequelize = require('./util/database');
const authRoutes = require('./routes/auth');

app.use(cors());
app.use(bodyParser.json({ extended: false }));

app.use("/user", authRoutes);

sequelize.sync().then(() => {
  app.listen(3000);
  console.log(`\u001b[1;32m app listening on port --> http://localhost:${port} \u001b[0m`)

}).catch(err => {
  console.log(err);
})