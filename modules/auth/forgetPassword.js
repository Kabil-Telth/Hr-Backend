const crypto = require('crypto');
const User = require('./user.model');
const { sendPasswordResetEmail } = require('../../utils/emailService');

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Check if email is provided
    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address' });
    }

    // 2. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal that the user doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a password reset link shortly' 
      });
    }

    // 3. Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 4. Send email with reset token
    try {
      await sendPasswordResetEmail(user.email, resetToken);
      
      res.status(200).json({
        message: 'Password reset link sent to your email',
        // Don't send token in production, only for testing
        ...(process.env.NODE_ENV === 'development' && { resetToken })
      });
    } catch (error) {
      // If email fails, remove the reset token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ 
        message: 'There was an error sending the email. Try again later.' 
      });
    }
  } catch (error) {
    console.error('Forget password error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = forgetPassword;