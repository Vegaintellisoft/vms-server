const sendEmail = require('./mailer');

/**
 * Send OTP via EmailJS (HTTP API - works on Render free tier)
 * @param {string} email - Recipient email address
 * @param {string} otp - OTP code to send
 */
async function sendOTP(email, otp) {
  await sendEmail({
    to: email,
    subject: 'Your OTP Code - Visitor Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Visitor Management System</h2>
        <p>Your OTP verification code is:</p>
        <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p style="color: #666;">This code will expire in 5 minutes.</p>
        <p style="color: #999; font-size: 12px;">If you did not request this code, please ignore this email.</p>
      </div>
    `,
  });
}

module.exports = sendOTP;
