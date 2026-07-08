const nodemailer = require('nodemailer');
const env = require('./env');

/**
 * Creates and returns a nodemailer transporter.
 * - If EMAIL_USER + EMAIL_PASS are set in .env → uses real Gmail SMTP.
 * - Otherwise → creates a free Ethereal test account automatically and
 *   returns a preview URL so you can inspect the sent email in a browser.
 */
let _transporter = null;
let _isEthereal = false;

const getTransporter = async () => {
  if (_transporter) return { transporter: _transporter, isEthereal: _isEthereal };

  if (env.EMAIL_USER && env.EMAIL_PASS) {
    _isEthereal = false;
    _transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
    console.log(`[Mailer] Gmail transporter ready → ${env.EMAIL_USER}`);
  } else {
    _isEthereal = true;
    const testAccount = await nodemailer.createTestAccount();
    _transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Mailer] Ethereal test transporter ready → ${testAccount.user}`);
    console.log(`[Mailer] ⚠  No EMAIL_USER / EMAIL_PASS in .env → using Ethereal sandbox.`);
    console.log(`[Mailer]   Add EMAIL_USER and EMAIL_PASS to .env to send real emails.`);
  }

  return { transporter: _transporter, isEthereal: _isEthereal };
};

/**
 * Send an email.
 * @param {{ to: string, subject: string, html: string }} opts
 * @returns {Promise<string|null>} Ethereal preview URL (test mode) or null (real mode)
 */
const sendEmail = async ({ to, subject, html }) => {
  const { transporter, isEthereal } = await getTransporter();

  const from = env.EMAIL_USER
    ? `RetailSync POS <${env.EMAIL_USER}>`
    : 'RetailSync POS <noreply@retailsync.local>';

  const info = await transporter.sendMail({ from, to, subject, html });

  if (isEthereal) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[Mailer] Email sent (test) → Preview: ${previewUrl}`);
    return previewUrl;          // caller can return this to the client
  }

  console.log(`[Mailer] Email sent → ${info.messageId}`);
  return null;
};

module.exports = sendEmail;