const QRCode = require('qrcode');

async function generateVisitorQr(visitorId) {
  const qrData = `visitor-${visitorId}`;
  return await QRCode.toDataURL(qrData); // returns Base64
}

module.exports = { generateVisitorQr };
