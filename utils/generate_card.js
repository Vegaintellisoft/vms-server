const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

async function generateVisitorCardImage(data) {
  const width = 450;
  const height = 550;

  // Read local image or default if none
  let avatarBase64 = '';
  if (data.imageFilename) {
    const imagePath = path.join(__dirname, '../uploads', data.imageFilename);
    try {
      if (fs.existsSync(imagePath)) {
        const imageBuf = await sharp(imagePath).resize(150, 150).png().toBuffer();
        avatarBase64 = `data:image/png;base64,${imageBuf.toString('base64')}`;
      }
    } catch (e) {
      console.warn('Could not read/process visitor image for card.', e.message);
    }
  }

  // Generate QR Code base64
  let qrBase64 = '';
  try {
    const rawQr = await QRCode.toDataURL(`visitor-${data.visitorId}`, { width: 120, margin: 1 });
    qrBase64 = rawQr;
  } catch (e) {
    console.warn('Could not generate QR code for card.', e.message);
  }

  // Build SVG Content
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <!-- Clip path for circular avatar -->
        <clipPath id="circleClip">
          <circle cx="225" cy="180" r="75" />
        </clipPath>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="#ffffff" />
      
      <!-- Header Background -->
      <rect x="0" y="0" width="100%" height="120" fill="#2c4463" />
      
      <!-- VMS Logo Circle -->
      <circle cx="50" cy="60" r="25" fill="none" stroke="#ffffff" stroke-width="2" />
      <text x="50" y="65" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#ffffff" font-weight="bold" text-anchor="middle">VMS</text>
      
      <!-- Company & Date -->
      <text x="${width - 30}" y="50" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#ffffff" font-weight="bold" text-anchor="end">${escapeXml(data.companyName)}</text>
      <text x="${width - 30}" y="70" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#ffffff" opacity="0.9" text-anchor="end">${data.date}</text>
      
      <!-- Visitor Photo -->
      ${avatarBase64 ? 
        `<image href="${avatarBase64}" x="150" y="105" width="150" height="150" preserveAspectRatio="xMidYMid slice" clip-path="url(#circleClip)" />` :
        `<circle cx="225" cy="180" r="75" fill="#f0f0f0" />
         <text x="225" y="185" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#888888" text-anchor="middle">No Photo</text>`
      }
      <circle cx="225" cy="180" r="75" fill="none" stroke="#ffffff" stroke-width="4" />
      
      <g transform="translate(30, 290)">
        <!-- Details rows -->
        <text x="0" y="20" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#8898aa" font-weight="bold">NAME</text>
        <text x="120" y="20" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#32325d" font-weight="bold">${escapeXml(data.name)}</text>
        <line x1="0" y1="35" x2="390" y2="35" stroke="#f0f0f0" stroke-width="1" />
        
        <text x="0" y="65" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#8898aa" font-weight="bold">TO MEET</text>
        <text x="120" y="65" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#32325d" font-weight="bold">${escapeXml(data.employeeName)}</text>
        <line x1="0" y1="80" x2="390" y2="80" stroke="#f0f0f0" stroke-width="1" />
        
        <text x="0" y="110" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#8898aa" font-weight="bold">PURPOSE</text>
        <text x="120" y="110" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#32325d" font-weight="bold">${escapeXml(data.purposeText)}</text>
        <line x1="0" y1="125" x2="390" y2="125" stroke="#f0f0f0" stroke-width="1" />
        
        <text x="0" y="160" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#8898aa" font-weight="bold">PHONE</text>
        <text x="120" y="160" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#32325d" font-weight="bold">${escapeXml(data.phone)}</text>
      </g>
      
      <!-- QR section -->
      <g transform="translate(300, 390)">
        ${qrBase64 ? `<image href="${qrBase64}" x="0" y="0" width="120" height="120" />` : ''}
        <text x="60" y="145" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#32325d" font-weight="bold" text-anchor="middle">${data.padVisitorId}</text>
      </g>
      
    </svg>
  `;

  // Render SVG to Buffer with Sharp
  return sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
    }
  });
}

module.exports = { generateVisitorCardImage };
