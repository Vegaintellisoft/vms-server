const https = require('https');
const qs = require('querystring');

/**
 * Send SMS via TextGuru API
 * @param {string} phone - Recipient phone number (10-digit Indian mobile)
 * @param {string} message - SMS message to send
 * @returns {Promise<string>} - API response
 */
function sendSms(phone, message) {
  // Format mobile number to have 91 prefix
  let dmobile = phone.toString().trim();
  if (dmobile.startsWith('+91')) {
    dmobile = dmobile.substring(1); // Remove the '+'
  } else if (dmobile.length === 10) {
    dmobile = '91' + dmobile;
  }
  // If already 91XXXXXXXXXX (12 digits), keep as-is

  const username = process.env.TEXTGURU_USERNAME || 'hf579661099';
  const password = process.env.TEXTGURU_PASSWORD || '';
  const source = process.env.TEXTGURU_SOURCE || 'VEGAUV';
  const dlttempid = process.env.TEXTGURU_DLT_TEMPLATE_ID || '1707160248729731';

  console.log(`[SMS] Sending to ${dmobile} | username=${username} | password=${password.substring(0, 3)}*** | source=${source}`);

  // Use GET request (matching the browser URL format that works)
  const query = qs.stringify({
    username,
    password,
    source,
    dmobile,
    dlttempid,
    message,
  });

  const url = `/api/v22.0/?${query}`;

  const options = {
    hostname: 'www.textguru.in',
    path: url,
    method: 'GET',
  };

  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        console.log(`[SMS] TextGuru response for ${dmobile}:`, data);
        resolve(data);
      });
    });

    request.on('error', (e) => {
      console.error(`
        query: ${query}\n
        [SMS] TextGuru API error for ${dmobile}:`, e.message);
      reject(e);
    });

    request.end();
  });
}

/**
 * Send OTP via SMS
 * @param {string} phone - Recipient phone number
 * @param {string} otp - OTP code
 * @returns {Promise<string>}
 */
function sendOtpSms(phone, otp) {
  // IMPORTANT: Message MUST exactly match your DLT-approved template
  // Set TEXTGURU_OTP_TEMPLATE in .env with {OTP} as placeholder
  const template = process.env.TEXTGURU_OTP_TEMPLATE || 'Your OTP is {OTP}. Valid for 10 minutes.';
  const message = template.replace('{OTP}', otp);
  console.log(`[SMS] OTP message: "${message}"`);
  return sendSms(phone, message);
}

module.exports = { sendSms, sendOtpSms };
