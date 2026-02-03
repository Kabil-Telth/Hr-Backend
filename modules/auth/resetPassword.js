const crypto = require('crypto');
const User = require('./user.model');
const { sendPasswordResetConfirmation } = require('../../utils/emailService');

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    // 1. Validate input
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        message: 'Please provide token, new password, and confirm password' 
      });
    }

    // 2. Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        message: 'Passwords do not match' 
      });
    }

    // 3. Check password strength (optional but recommended)
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // 4. Hash the token from client
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // 5. Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() } // Check if token hasn't expired
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Token is invalid or has expired' 
      });
    }

    // 6. Update password and clear reset token fields
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    // This will trigger the pre-save hook to hash the password
    await user.save();

    // 7. Send confirmation email
    try {
      await sendPasswordResetConfirmation(user.email);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the reset process if email fails
    }

    // 8. Invalidate all refresh tokens (optional security measure)
    user.refreshToken = undefined;
    await user.save();

    res.status(200).json({
      message: 'Password reset successful. Please login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = resetPassword;