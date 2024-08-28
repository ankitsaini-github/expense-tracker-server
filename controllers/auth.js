const bcrypt = require("bcrypt");
const mongoose = require('mongoose')
const User = require("../models/users");
const ForgotPasswordRequest = require("../models/forgotPasswordRequests");
// const sequelize = require("../util/database");
const {getpasswordpage} = require("../util/forgotpasswordpage");

var jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

// require("dotenv").config();

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
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const result = await newUser.save();
    res.status(201).send(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add user." });
  }
};

// existing user
exports.logIn = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });

    // User not found
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Incorrect password
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(401).json({ error: "User not authorized." });
    }

    // All good
    res.status(200).json({
      message: "Login successful.",
      token: generateToken(user._id),
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
    //check user exists
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    //create password reset request
    const resetReq = new ForgotPasswordRequest({
      id: uuidv4(),
      isActive: true,
      userId: user._id,
    });
    await resetReq.save();

    //nodemailer using Gmail
    const transporter = await nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_APP_PASS,
      },
    });

    // mailgen
    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "DhanDiary Support",
        link: "#",
        copyright: "Copyright © 2024 DhanDiary. All rights reserved.",
        logo: "https://i.imgur.com/XAQWwQd.png",
      },
    });

    const resetLink = `http://localhost:3000/user/reset-password/${resetReq.id}`; // Dynamic reset link

    const response = {
      body: {
        name: user.name,
        intro: "This is an auto-generated Link, do not share it with others.",
        action: {
          instructions: "Click below button to RESET your Password",
          button: {
            color: "#84cc16",
            text: "Reset",
            link: resetLink,
          },
        },
        outro: "If you did not request a password reset, no further action is required on your part.",
        signature: "Best regards",
      },
    };

    const mail = MailGenerator.generate(response);

    const info = await transporter.sendMail({
      from: process.env.GMAIL_ID,
      to: userEmail,
      subject: "Password Reset",
      html: mail,
    });

    res.json({ info, message: "Reset Link Sent." });
  } catch (error) {
    console.log("email error ===== ", error);
    res.status(500).json({ error: "Failed to send reset link. Try again." });
  }
};

//reset password page
exports.resetPasswordPage = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the forgot password request exists and is active
    const resetReq = await ForgotPasswordRequest.findOne({ id, isActive: true });

    // If no request found or the request is not active
    if (!resetReq) {
      return res.status(404).send(`
        <html>
          <body>
            <h1>Link Expired</h1>
          </body>
        </html>
      `);
    }

    const result = getpasswordpage(id);
    return res.send(result);

  } catch (error) {
    console.log('error---- ', error);
    return res.status(500).json({ error: "An error occurred while processing your request." });
  }
};

//reset password
exports.resetPassword = async(req,res) => {
  const { id } = req.params;
  const newPassword = req.body.password;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // find request
      const resetReq = await ForgotPasswordRequest.findById(id).session(session);

      if (!resetReq) {
        throw new Error("Invalid or expired reset request.");
      }

      // find user
      const user = await User.findById(resetReq.userId).session(session);

      if (!user) {
        throw new Error("User not found.");
      }

      user.password = await bcrypt.hash(newPassword, saltRounds);

      // Save user and delete req
      await user.save({ session });
      await resetReq.deleteOne({ session });

      await session.commitTransaction();
      session.endSession();

      // redirect
      res.redirect('http://localhost:5173/login');
      console.log('User password reset for:', user.name);

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.log('Error:', error);
    res.redirect('http://localhost:5173/login');
  }
};