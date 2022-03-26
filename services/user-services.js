const moment = require('moment')
const transporter = require('../config/nodemailer')

module.exports = {
  verificationSent: async (email, localHostURL, validationCode) => {
    try {
      const callBackURL = `http://${localHostURL}?activate=${validationCode}`

      const info = await transporter.sendMail({
        to: email,
        subject: '會員電子信箱認證通知信 - 新聞雷達',
        text: `請點擊以下的連結:\n${callBackURL}`
      })

      return info
    } catch (err) { throw new Error(err) }
  },

  verificationCheck: (incomingCode, inDbCode, inDbTime) => {
    const now = moment()
    const diff = Math.ceil(
      moment.duration(now.diff(inDbTime)).as('minutes')
    )
    if (diff < 30 || incomingCode !== inDbCode) return false
    return true
  }
}
