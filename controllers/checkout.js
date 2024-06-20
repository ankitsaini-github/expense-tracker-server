const Razorpay = require("razorpay");
const Users = require('../models/users');

require('dotenv').config();

exports.buyPro = async(req, res, next)=>{
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: 5100,
      currency: "INR",
    };

    const order = await razorpay.orders.create(options);
    res.json({order, key_id: razorpay.key_id, currency:options.currency});

  } catch (error) {
    res.status(500).send(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const {payment_id, order_id} = req.body;
    req.user.update({isProUser: true}).then(()=>{
      return res.status(202).json({success:true, message: 'Transaction successful'})
    })
  } catch (error) {
    return res.status(500).json({error:'Transaction Failed'})
  }
};