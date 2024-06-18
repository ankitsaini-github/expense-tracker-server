const Users = require('../models/users');

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
