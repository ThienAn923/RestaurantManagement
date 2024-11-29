const Queue = require("bull");
const nodemailer = require("nodemailer");
require("dotenv").config();

const emailQueue = new Queue("emailQueue", {
  redis: {
    host: process.env.REDIST_HOST,
    port: process.env.REDIST_PORT,
  },
  limiter: {
    max: 10,
    duration: 1000,
  },
});

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST, // SMTP host from .env
  port: process.env.MAIL_PORT, // SMTP port from .env
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Ignore self-signed certificates
  },
});

emailQueue.process(async (job) => {
  console.log(`processing job ${job.id} for ${job.data.to}`);
  try {
    const { to, subject, text, html } = job.data;
    const emailOptions = {
      from: process.env.MAIL_USER,
      to,
      subject,
      text,
      html,
    };

    let info = await transporter.sendMail(emailOptions);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
});

module.exports = emailQueue;
