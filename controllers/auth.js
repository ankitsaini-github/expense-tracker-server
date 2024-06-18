const Users = require('../models/users');

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
    const result = await Users.create({ name, email, password });
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
    if (password!=user.password) {
      return res.status(401).json({ error: 'User not authorized.' });
    }

    // all good
    res.status(200).json({ message: 'Login successful.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log in.' });
  }
};