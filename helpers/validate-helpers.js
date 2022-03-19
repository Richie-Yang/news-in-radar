const validator = require('validator')

module.exports = {
  allFieldsCheck: (fields, data, cb) => {
    // not tested yet
    const fieldsCheck = fields.every(f => data.includes(f))
    if (!fieldsCheck) return cb(new Error('信箱, 密碼, 確認密碼欄位都是必填'))
    return cb(null)
  },

  emailCheck: (email, cb) => {
    // not tested yet
    const emailValidated = validator.isEmail(email)
    if (!emailValidated) return cb(new Error('信箱格式不符'))
    return cb(null)
  },

  passwordCheck: (password, confirmPassword, cb) => {
    // not tested yet
    const errors = []
    const passwordValidated = validator.isLength(password, { min: 6 })
    const twinValidated = validator.equals(password, confirmPassword)

    if (!passwordValidated) errors.push('密碼長度不足')
    if (!twinValidated) errors.push('密碼欄位不符')

    if (errors.length) return cb(new Error(errors))
    return cb(null)
  },

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
