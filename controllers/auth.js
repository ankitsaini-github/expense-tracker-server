const bcrypt = require("bcrypt");
const Users = require("../models/users");
var jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
const Mailgen = require('mailgen')

require("dotenv").config();

const saltRounds = 10;
const secretKey = process.env.JWT_SECRET_KEY;

function generateToken(uid) {
  return jwt.sign({ userId: uid }, secretKey);
}

// new user
exports.signUp = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password should be at least 8 characters long." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await Users.create({
      name,
      email,
      password: hashedPassword,
    });
    res.status(201).send(result);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      res.status(409).json({ error: "User already exists." });
    } else if (err.name === "SequelizeValidationError") {
      res.status(400).json({ error: "Validation error." });
    } else {
      console.error(err);
      res.status(500).json({ error: "Failed to add user." });
    }
  }
};

// existing user
exports.logIn = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await Users.findOne({ where: { email } });

    // user not found
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // incorrect password
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(401).json({ error: "User not authorized." });
    }

    // all good
    res.status(200).json({
      message: "Login successful.",
      token: generateToken(user.id),
      useremail: user.email,
      isPro: user.isProUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to log in." });
  }
};

//forgot password
exports.forgotPassword = async (req, res) => {
  const userEmail = req.body.email;
  if (!userEmail) {
    return res.status(400).json({ error: "Registered email is required." });
  }

  try {

    //check user exist
    const user = await Users.findOne({ where: { email:userEmail } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    //#region using nodemailer - test account
    //   const testAcc = await nodemailer.createTestAccount();

    // const transporter = await nodemailer.createTransport({
    //   host: "smtp.ethereal.email",
    //   port: 587,
    //   secure: false,
    //   auth: { 
    //     user: 'felipe.cartwright62@ethereal.email',
    //     pass: 'Tnf3rWGCVC5mzfS4RR' 
    //   },
    // });

    // const info = await transporter.sendMail({
    //   from: '"dhan diary" <dhandiary@support.com>',
    //   to: userEmail,
    //   subject: "password reset",
    //   text: "your OTP is 1234",
    //   html: "<b>your OTP is 1234</b>",
    // });
    //#endregion

    //using gmail - real account

    const transporter = await nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: { 
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_APP_PASS,
      },
    });
    
    let MailGenerator = new Mailgen({
      theme: 'default', //cerberus,salted,neopolitan
      product: {
        name: 'DhanDiary Support',
        link: '#',
        copyright: 'Copyright © 2024 DhanDiary. All rights reserved.',
        logo: 'https://i.imgur.com/XAQWwQd.png',
      }
    });

    const otp=1234; //test

    const response = {
      body: {
        name: user.name,
        intro: 'This is an auto generated One Time Password, do not share it with others.',
        action: {
          instructions: `Your OTP is: ${otp}`,
          button: {
            color: '#84cc16',
            text: '1234',
            link: '#'
        }
      },
        outro: 'If you did not request a password reset, no further action is required on your part.',
        signature: 'Best regards',
      }
    }

    const mail = MailGenerator.generate(response)

    const info = await transporter.sendMail({
      from: process.env.GMAIL_ID,
      to: userEmail,
      subject: "Password Reset",
      html: mail,
    });

    console.log("Message sent-----------");//test
    res.json({info,message:'Reset Link Sent.'})

  } catch (error) {
    console.log('email error ===== ',error)
    res.status(500).json({error:'Failed to send reset link. Try again.'})
  }
};
