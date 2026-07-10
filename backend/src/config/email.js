const nodemailer = require('nodemailer');
const env = require('./env');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred service
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

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