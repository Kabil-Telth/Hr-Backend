// utils/emailService.js
const { Resend } = require('resend');

// Initialize Resend with your API key
let resend;
try {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set in environment variables');
    throw new Error('RESEND_API_KEY is required');
  }
  
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Resend initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Resend:', error.message);
  resend = null;
}

// Simple fallback email template for testing
const getPasswordResetTemplate = (resetToken, name, resetURL) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f9f9f9; border-radius: 10px; padding: 30px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb;">${process.env.APP_NAME || 'Your App'}</h1>
        </div>
        
        <h2>Hi ${name},</h2>
        
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetURL}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p>Or copy and paste this link in your browser:</p>
        <div style="background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; word-break: break-all; margin: 15px 0;">
          ${resetURL}
        </div>
        
        <p>This link will expire in <strong>10 minutes</strong>.</p>
        
        <p>If you didn't request this password reset, please ignore this email.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
          <p>Best regards,<br>The ${process.env.APP_NAME || 'Your App'} Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, name = 'User') => {
  // Validate inputs
  if (!email || !resetToken) {
    throw new Error('Email and reset token are required');
  }

  // Check if Resend is initialized
  if (!resend) {
    console.warn('⚠️ Resend not initialized, logging email details instead');
    console.log('Password reset email details:', {
      to: email,
      token: resetToken,
      name: name,
      frontendUrl: process.env.FRONTEND_URL
    });
    return { id: 'mock-email-id', status: 'logged' };
  }

  const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  
  console.log('📧 Sending password reset email to:', email);
  console.log('Reset URL:', resetURL);
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>',
      to: [email],
      subject: `Reset Your ${process.env.APP_NAME || 'Account'} Password`,
      html: getPasswordResetTemplate(resetToken, name, resetURL),
      text: `Hi ${name},\n\nYou requested to reset your password. Visit this link to reset your password: ${resetURL}\n\nThis link expires in 10 minutes.\n\nBest,\n${process.env.APP_NAME || 'Your App'} Team`
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      throw new Error(`Resend API error: ${error.message}`);
    }

    console.log('✅ Email sent successfully:', data?.id);
    return data;
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    
    // Re-throw with more context
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send password reset confirmation email
const sendPasswordResetConfirmation = async (email, name = 'User') => {
  try {
    if (!resend) {
      console.warn('Resend not initialized, skipping confirmation email');
      return null;
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>',
      to: [email],
      subject: 'Password Reset Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Password Reset Successful</h2>
          <p>Hi ${name},</p>
          <p>Your password has been successfully reset.</p>
          <p>If you did not make this change, please contact support immediately.</p>
        </div>
      `,
      text: `Hi ${name},\n\nYour password has been successfully reset.\n\nIf you did not make this change, please contact support immediately.\n\nBest,\n${process.env.APP_NAME || 'Your App'} Team`
    });

    if (error) {
      console.error('Resend confirmation error:', error);
      return null;
    }

    console.log('Confirmation email sent:', data?.id);
    return data;
  } catch (error) {
    console.error('Confirmation email error:', error);
    return null;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordResetConfirmation
};