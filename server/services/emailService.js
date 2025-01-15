const sendEmail = require("../utils/sendEmail");

const sendVerificationEmail = async (to, verificationUrl) => {
  const subject = "Email Verification";
  const html = `
    <h1>Email Verification</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verificationUrl}">Verify Email</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
  await sendEmail(to, subject, html);
};

const sendPasswordResetEmail = async (to, newPassword) => {
  const subject = "Password Reset";
  const html = `
    <h1>Password Reset</h1>
    <p>Your password has been reset. Here is your new password:</p>
    <p><strong>${newPassword}</strong></p>
    <p>Please log in using this password and change it immediately.</p>
    <p>If you did not request this, please contact support.</p>
  `;
  await sendEmail(to, subject, html);
};

const sendContactEmail = async (name, from, subject, message) => {
  const to = process.env.CONTACT_RECEIVER;

  const html = `
    <h1>Contact Message from ${name}</h1>
    <p><strong>Sender Email:</strong> ${from}</p>
    <hr>
    <p>${message}</p>
  `;

  await sendEmail(to, subject, html);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendContactEmail,
};
