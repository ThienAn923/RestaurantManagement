const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter;
try {
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
} catch (err) {
  err.message;
}

exports.sendEmail = async (emailOptions) => {
  console.log("ahhhhhhhhhhhhhhhhhhhhh");
  return await transporter.sendMail(emailOptions);
};
