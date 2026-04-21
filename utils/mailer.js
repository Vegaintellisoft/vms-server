const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const nodemailer = require("nodemailer");

const isProduction = process.env.NODE_ENV === "production";

let sendEmail;

if (isProduction && process.env.MJ_APIKEY_PUBLIC && process.env.MJ_APIKEY_PRIVATE) {
  // ── PRODUCTION: Use Mailjet HTTP API (works on Render) ──
  const Mailjet = require("node-mailjet");
  const mailjet = Mailjet.apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE
  );
  const senderEmail = process.env.MJ_SENDER_EMAIL || process.env.EMAIL_USER;

  console.log("[Mailer] Production mode: Mailjet configured with sender:", senderEmail);

  sendEmail = async (options) => {
    const recipients = options.to.split(",").map((email) => ({
      Email: email.trim(),
    }));

    const result = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: senderEmail,
            Name: "Visitor Management System",
          },
          To: recipients,
          Subject: options.subject,
          HTMLPart: options.html,
          ...(options.attachments && {
            Attachments: options.attachments.map(att => ({
              ContentType: "image/png",
              Filename: att.filename,
              Base64Content: Buffer.isBuffer(att.content) ? att.content.toString("base64") : att.content
            }))
          })
        },
      ],
    });

    return result.body;
  };
} else {
  // ── DEVELOPMENT: Use Gmail SMTP (works locally) ──
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("[Mailer] WARNING: EMAIL_USER/EMAIL_PASS not set. Emails will fail.");
  } else {
    console.log("[Mailer] Dev mode: Gmail SMTP configured with:", process.env.EMAIL_USER);
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  sendEmail = async (options) => {
    return transporter.sendMail({
      from: `"Visitor Management System" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments
    });
  };
}

module.exports = sendEmail;