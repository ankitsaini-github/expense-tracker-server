const bcrypt = require('bcrypt');
const Users = require('../models/users');
var jwt = require('jsonwebtoken');

require('dotenv').config();

const saltRounds = 10;
const secretKey = process.env.JWT_SECRET_KEY;

function generateToken(uid){
  return jwt.sign({ userId : uid }, secretKey);
}

// new user
exports.signUp = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password should be at least 8 characters long.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await Users.create({ name, email, password: hashedPassword });
    res.status(201).send(result);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ error: 'User already exists.' });
    } else if (err.name === 'SequelizeValidationError') {
      res.status(400).json({ error: 'Validation error.' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Failed to add user.' });
    }
  }
};

// existing user
exports.logIn = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await Users.findOne({ where: { email } });

    // user not found
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // incorrect password
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(401).json({ error: 'User not authorized.' });
    }

    // all good
    res.status(200).json({ message: 'Login successful.', token: generateToken(user.id), useremail:user.email, isPro: user.isProUser });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log in.' });
  }
};