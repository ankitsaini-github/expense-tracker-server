const User = require('../models/users');
const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET_KEY;

exports.authenticateUser = async(req,res,next)=>{
  try {
    const token = req.header('Authorization')
    const {userId} = jwt.verify(token, secretKey)
    const user = await User.findById(userId)
    if(!user){
      throw new Error('User not found.');
    }
    req.user = user;
    next();
  } catch (error) {
    console.log('USER NOT AUTHORIZED !')
    res.status(401).json({error,success:false,})
  }
};