const bcrypt = require('bcryptjs')
const { User } = require('../models')

module.exports = {
  loginPage: (req, res) => {
    return res.render('login')
  },

  login: (req, res) => {
    const { name } = req.user

    req.flash('success_messages', `歡迎回來 ${name}`)
    return res.redirect('/admin/news')
  },

  registerPage: (req, res) => {
    return res.render('register')
  },

  register: (req, res, next) => {
    const { 
      name, email, password, confirmPassword 
    } = req.body

    if (!email || !password || !confirmPassword) {
      throw new Error('信箱, 密碼, 確認密碼欄位都是必填')
    }
    if (password !== confirmPassword) {
      throw new Error('密碼欄位不符')
    }

    return User.findOne({ where: { email } })
      .then(user => {
        if (user) throw new Error('信箱已經被使用過')

        return bcrypt.genSalt(10)
      })
      .then(salt => bcrypt.hash(password, salt))
      .then(hash => {
        const inputName = name ? name : email

        return User.create({
          name: inputName, email, password: hash
        })
      })
      .then(() => {
        req.flash('success_messages', '帳號已經成功註冊')
        res.redirect('/login')
      })
      .catch(err => next(err))
  }
}