const validator = require('validator')

module.exports = {
  registerValidation: function (data) {
    const errors = []
    const { email, password, confirmPassword } = data
    if (!email || !password || !confirmPassword) {
      throw new Error('信箱, 密碼, 確認密碼欄位都是必填')
    }

    const emailValidated = validator.isEmail(email)
    const passwordValidated = validator.isLength(password, { min: 6 })
    const twinValidated = validator.equals(password, confirmPassword)
    const lowercaseValidated = validator.matches(password, /[a-z]/)
    const uppercaseValidated = validator.matches(password, /[A-Z]/)
    const numberValidated = validator.matches(password, /[1-9]/)

    if (!emailValidated) errors.push('信箱格式不符')
    if (!passwordValidated) errors.push('密碼長度不足')
    if (!twinValidated) errors.push('兩個密碼欄位並不相符')
    if (!lowercaseValidated) errors.push('密碼需含小寫英文')
    if (!uppercaseValidated) errors.push('密碼需含大寫英文')
    if (!numberValidated) errors.push('密碼需含數字')

    return errors.length ? errors.join() : 'ok'
  }
}
