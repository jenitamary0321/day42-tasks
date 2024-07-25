// controllers/authController.js
const User = require('../models/User');
const Token = require('../models/Token');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

exports.register = async (req, res) => {
  const { email, firstName, lastName, password } = req.body;
  try {
    const user = new User({ email, firstName, lastName, password });
    const savedUser = await user.save();
    const token = new Token({
      userId: savedUser._id,
      token: crypto.randomBytes(16).toString('hex'),
    });
    await token.save();
    const mailOptions = {
      from: process.env.EMAIL,
      to: savedUser.email,
      subject: 'Account Verification Link',
      text: `Please verify your account by clicking the link: \nhttp://${req.headers.host}/api/auth/verify-email/${token.token}`,
    };
    transporter.sendMail(mailOptions);
    res.status(201).json({ message: 'User registered. Please check your email to verify your account.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found.' });
    if (!user.isActive) return res.status(400).json({ error: 'User not activated.' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials.' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found.' });
    const token = new Token({
      userId: user._id,
      token: crypto.randomBytes(16).toString('hex'),
    });
    await token.save();
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Password Reset Link',
      text: `Please reset your password by clicking the link: \nhttp://${req.headers.host}/reset-password/${token.token}`,
    };
    transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const tokenRecord = await Token.findOne({ token });
    if (!tokenRecord) return res.status(400).json({ error: 'Invalid or expired token.' });
    const user = await User.findById(tokenRecord.userId);
    user.password = newPassword;
    await user.save();
    await tokenRecord.remove();
    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const tokenRecord = await Token.findOne({ token });
    if (!tokenRecord) return res.status(400).json({ error: 'Invalid or expired token.' });
    const user = await User.findById(tokenRecord.userId);
    user.isActive = true;
    await user.save();
    await tokenRecord.remove();
    res.json({ message: 'Account verified successfully.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
