const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const sendEmail = async (to, subject, html) => {
  // Create a transporter using Mailjet SMTP settings
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465,
    auth: {
      user: process.env.EMAIL_USER, // Mailjet Public Key
      pass: process.env.EMAIL_PASS, // Mailjet Private Key
    },
  });

  try {
    // Verify the connection configuration
    await transporter.verify();
    console.log("SMTP Server is ready to take our messages");

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"Your App Name" <${process.env.EMAIL_FROM}>`, // sender address
      to,
      subject, // Subject line
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
