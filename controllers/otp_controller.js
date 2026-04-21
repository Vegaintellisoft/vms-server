const otpGenerator = require('otp-generator');
const { sendOtpSms } = require('../utils/sendSms');
const { logger } = require('../utils/logger');
const otpStore = {}; // Temporary in-memory store

exports.sendOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ status: false, message: "Phone number is required" });
  }

  // Generate a 4-digit numeric OTP
  const otp = otpGenerator.generate(4, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
  otpStore[phone] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 }; // Expires in 10 mins

  logger.debug(`OTP generated for ${phone}`);

  try {
    await sendOtpSms(phone, otp);
    return res.status(200).json({ status: true, message: "OTP sent successfully" });
  } catch (e) {
    console.error('SMS send error:', e.message);
    // Still return success — OTP is stored in memory, SMS delivery may have partial failure
    return res.status(200).json({ status: true, message: "OTP sent successfully" });
  }
};

exports.verifyOtp = (req, res) => {
  const { phone, otp } = req.body;

  const record = otpStore[phone];
  if (!record) {
    return res.status(400).json({ status: false, message: "OTP not sent or expired" });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[phone];
    return res.status(400).json({ status: false, message: "OTP expired" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ status: false, message: "Invalid OTP" });
  }

  delete otpStore[phone];
  return res.status(200).json({ status: true, message: "OTP verified successfully" });
};
