const crypto = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../utils/jwtHelper');
const sendEmail = require('../config/email');
const logger = require('../utils/logger');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, error: 'User already exists with this email' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      firstName, lastName, email, password,
      role: role || 'user',
      verificationToken,
      verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000
    });

    // Send verification email (non-blocking)
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    sendEmail({
      email: user.email,
      subject: 'Welcome to ProConnect - Verify Your Email',
      html: `<h2>Welcome to ProConnect, ${user.firstName}!</h2>
             <p>Please verify your email by clicking the link below:</p>
             <a href="${verifyUrl}" style="background:#0A66C2;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;">Verify Email</a>
             <p>This link expires in 24 hours.</p>`
    }).catch(err => logger.warn(`Verification email failed: ${err.message}`));

    const token = generateToken(user._id);
    user.password = undefined;

    res.status(201).json({
      success: true,
      data: { user, token },
      message: 'Registration successful! Please verify your email.'
    });
  } catch (error) { next(error); }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    user.lastActive = Date.now();
    user.isOnline = true;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    user.password = undefined;

    res.json({ success: true, data: { user, token } });
  } catch (error) { next(error); }
};

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { isOnline: false });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) { next(error); }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
exports.verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpire: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ success: false, error: 'Invalid or expired verification link' });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Email verified successfully!' });
  } catch (error) { next(error); }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, error: 'No user with that email' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    try {
      await sendEmail({
        email: user.email,
        subject: 'ProConnect - Password Reset Request',
        html: `<h2>Password Reset</h2>
               <p>Click below to reset your password (expires in 10 minutes):</p>
               <a href="${resetUrl}" style="background:#0A66C2;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;">Reset Password</a>`
      });
      res.json({ success: true, message: 'Password reset email sent' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }
  } catch (error) { next(error); }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, error: 'Invalid or expired token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, data: { token }, message: 'Password reset successful' });
  } catch (error) { next(error); }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) { next(error); }
};
