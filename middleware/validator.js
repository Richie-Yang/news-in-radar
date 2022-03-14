const validator = require('validator')

module.exports = {
  registerValidation: data => {
    const errors = []
    const { email, password, confirmPassword } = data

    if (!email || !password || !confirmPassword) {
      return '信箱, 密碼, 確認密碼欄位都是必填'
    }

    const emailValidated = validator.isEmail(email)
    const passwordValidated = validator.isLength(password, { min: 6 })
    const twinValidated = validator.equals(password, confirmPassword)

    if (!emailValidated) errors.push('信箱格式不符')
    if (!passwordValidated) errors.push('密碼長度不足')
    if (!twinValidated) errors.push('密碼欄位不符')

    return errors.length ? errors.join() : 'ok'
  }
}