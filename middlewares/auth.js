const Users = require('../models/users');
const jwt = require('jsonwebtoken');

const secretKey = '65zwEsXsUd1FLQgwAVGz3UsSB0Mn7ewG';

exports.authenticateUser = async(req,res,next)=>{
  try {
    const token = req.header('Authorization')
    const {userId} = jwt.verify(token, secretKey)
    const user = await Users.findByPk(userId)
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