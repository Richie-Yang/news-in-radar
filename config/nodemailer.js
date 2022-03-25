const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_MAIL_USER,
    pass: process.env.SMTP_MAIL_PASSWORD
  }
})

module.exports = transporter
