const nodemailer = require('nodemailer');

// Uses Gmail SMTP via nodemailer. Requires EMAIL_USER / EMAIL_PASS
// (a Gmail App Password, not your regular login password) in .env.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify the connection once at startup so config issues surface early
// instead of silently failing on the first real send.
transporter.verify((err) => {
  if (err) {
    console.error('Nodemailer transport verification failed:', err.message);
  } else {
    console.log('Nodemailer is ready to send emails.');
  }
});

/**
 * Send an email.
 * @param {Object} options
 * @param {string} options.to      - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html    - Email HTML body
 */
async function send({ to, subject, html }) {
  if (!to) {
    throw new Error('Cannot send email: no recipient address provided');
  }

  // Configurable via .env so the "From" display name matches your company
  // instead of a hardcoded default. Falls back to "Purchasing Team" if unset.
  const senderName = process.env.EMAIL_SENDER_NAME || 'Purchasing Team';

  const info = await transporter.sendMail({
    from: `"${senderName}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  return info;
}

module.exports = { send };