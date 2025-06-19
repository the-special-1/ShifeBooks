import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import crypto from 'crypto';
import generateTokenAndSetCookie from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, newUser.role, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        isApproved: newUser.isApproved,
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in signup controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || '');

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    generateTokenAndSetCookie(user._id, user.role, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
    });
  } catch (error) {
    console.error('Error in login controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 0 });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error in logout controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const checkAuth = async (req, res) => {
  try {
    // The protectRoute middleware has already attached the user to the request
    res.status(200).json(req.user);
  } catch (error) {
    console.error('Error in checkAuth controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // To prevent email enumeration attacks, send a generic success message
      return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the following link, or paste it into your browser to complete the process within ten minutes of receiving it: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message,
      });

      res.status(200).json({ message: 'Password reset link sent to your email.' });
    } catch (err) {
      console.error('Email sending error:', err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      res.status(500).json({ error: 'Email could not be sent.' });
    }
  } catch (error) {
    console.error('Error in forgotPassword controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Log the user in
    generateTokenAndSetCookie(user._id, user.role, res);

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error('Error in resetPassword controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
