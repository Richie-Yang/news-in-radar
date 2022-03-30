const moment = require('moment')
const transporter = require('../config/nodemailer')

module.exports = {
  verificationCreated: () => {
    const TOTAL_LENGTH = 9
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '1234567890'
    let result = ''

    Array.from({ length: TOTAL_LENGTH }).forEach((_, i) => {
      if (i < 2) result += alphabet[Math.floor(Math.random() * alphabet.length)]
      if (i === 2) result += '-'
      if (i > 2) result += numbers[Math.floor(Math.random() * numbers.length)]
    })

    return result
  },

  verificationSent: async (email, validationCode) => {
    try {
      const result = await transporter.sendMail({
        to: email,
        subject: '會員電子信箱認證通知信 - 新聞雷達',
        text: `認證號碼為下:\n${validationCode}`
      })

      return result
    } catch (err) { throw new Error(err) }
  },

  verificationCheck: (incomingCode, inDbCode, inDbTime) => {
    const now = moment()
    const diff = Math.ceil(
      moment.duration(now.diff(inDbTime)).as('minutes')
    )
    if (diff > 30 || incomingCode !== inDbCode) return false
    return true
  }
}
