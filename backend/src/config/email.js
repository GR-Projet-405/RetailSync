const nodemailer = require('nodemailer');
const env = require('./env');

const transportConfig = env.EMAIL_HOST
  ? {
      host: env.EMAIL_HOST,
      port: parseInt(env.EMAIL_PORT || '587', 10),
      secure: env.EMAIL_SECURE === 'true',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    }
  : {
      service: 'gmail',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    };

const transporter = nodemailer.createTransport(transportConfig);

const sendEmail = async (options) => {
  const mailOptions = {
    from: `RetailSync <${env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;