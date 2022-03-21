const validator = require('validator')

class ValidateHelper {
  constructor (errors) {
    this.errors = errors
  }

  emailCheck (email) {
    if (!validator.isEmail(email)) this.errors.push('信箱格式不符')
    return this.errors
  }

  lengthCheck (keyName, keyValue, min = 6, max) {
    const option = { min }
    if (max) option.max = max

    if (!validator.isLength(keyValue, option)) {
      this.errors.push(`${keyName}長度不足`)
    }

    return this.errors
  }

  equalCheck (keyName, keyValueA, keyValueB) {
    if (!validator.equals(keyValueA, keyValueB)) {
      this.errors.push(`兩個${keyName}欄位並不相符`)
    }

    return this.errors
  }

  lowercaseCheck (keyName, keyValue) {
    if (!validator.matches(keyValue, /[a-z]/)) {
      this.errors.push(`${keyName}需要包含至少一個小寫英文`)
    }

    return this.errors
  }

  uppercaseCheck (keyName, keyValue) {
    if (!validator.matches(keyValue, /[A-Z]/)) {
      this.errors.push(`${keyName}需要包含至少一個大寫英文`)
    }

    return this.errors
  }

  numberCheck (keyName, keyValue) {
    if (!validator.matches(keyValue, /[1-9]/)) {
      this.errors.push(`${keyName}需要包含至少一個數字`)
    }

    return this.errors
  }

  specialCharacterCheck (keyName, keyValue) {
    if (!validator.matches(keyValue, /[~!@#$%^&*()_+{}|:"<>?]/)) {
      this.errors.push(`${keyName}需要包含至少一個特殊符號`)
    }

    return this.errors
  }

  registerCheck (email, password, confirmPassword) {
    if (!email || !password || !confirmPassword) {
      throw new Error('信箱, 密碼, 確認密碼欄位都是必填')
    }

    this.emailCheck(email)
    if (this.errors.length) throw new Error(this.errors.join())

    this.lengthCheck('密碼', password, 6)
    this.equalCheck('密碼', password, confirmPassword)
    if (this.errors.length) throw new Error(this.errors.join())

    this.lowercaseCheck('密碼', password)
    this.uppercaseCheck('密碼', password)
    this.numberCheck('密碼', password)
    this.specialCharacterCheck('密碼', password)
    if (this.errors.length) throw new Error(this.errors.join())
  }

  editUserCheck (password, confirmPassword) {
    if (!password || !confirmPassword) {
      throw new Error('密碼, 確認密碼欄位都是必填')
    }

    this.lengthCheck('密碼', password, 6)
    this.equalCheck('密碼', password, confirmPassword)
    if (this.errors.length) throw new Error(this.errors.join())

    this.lowercaseCheck('密碼', password)
    this.uppercaseCheck('密碼', password)
    this.numberCheck('密碼', password)
    this.specialCharacterCheck('密碼', password)
    if (this.errors.length) throw new Error(this.errors.join())
  }
}

module.exports = ValidateHelper
