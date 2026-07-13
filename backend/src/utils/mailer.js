const nodemailer = require('nodemailer');

// Configure transporter based on available environment variables.
// Fallback to Gmail service if custom host is not configured.
const transportConfig = process.env.EMAIL_HOST
  ? {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_SECURE === '1' || process.env.EMAIL_SECURE === true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    }
  : {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };

const transporter = nodemailer.createTransport(transportConfig);

// Verify the connection once at startup so config issues surface early
// instead of silently failing on the first real send.
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify((err) => {
    if (err) {
      console.error('Nodemailer transport verification failed:', err.message);
    } else {
      console.log('Nodemailer is ready to send emails.');
    }
  });
} else {
  console.log('Nodemailer: Verification skipped (no EMAIL_USER/EMAIL_PASS found in environment).');
}

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