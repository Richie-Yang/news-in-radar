const bcrypt = require('bcryptjs')
const sequelize = require("sequelize")
const { User, Comment, News } = require('../models')

module.exports = {
  loginPage: (req, res) => {
    return res.render('login')
  },

  login: (req, res) => {
    const { name, isAdmin } = req.user
    const redirectPath = isAdmin ? '/admin/news' : '/news'

    req.flash('success_messages', `歡迎回來 ${name}`)
    return res.redirect(redirectPath)
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
  },

  logout: (req, res) => {
    req.flash('success_messages', '你已經成功登出了')
    req.logout()
    return res.redirect('/login')
  },

  getUser: async (req, res, next) => {
    const sessionUserId = req.user.id
    const requestUserId = Number(req.params.userId)
    const DEFAULT_COUNT = 14

    let [user, comments] = await Promise.all([
      User.findByPk(requestUserId, {
        include: [
          { model: News, as: 'LikedNewsForUsers' },
          { model: Comment, include: News }
        ],
        nest: true
      }),

      Comment.findAll({
        include: News,
        where: { userId: requestUserId },
        order: [['totalLikes', 'DESC']],
        limit: 3,
        raw: true,
        nest: true
      })
    ])

    if (!user) throw new Error('這位使用者已經不存在了')

    console.log(user)
    user = {
      ...user.toJSON(),
      isEditable: sessionUserId === requestUserId
    }


    const commentSet = new Set()
    user.Comments = user.Comments.filter(c => {
      return !commentSet.has(c.newsId) && commentSet.size < DEFAULT_COUNT
        ? commentSet.add(c.newsId)
        : false
    })

    user.LikedNewsForUsers = user.LikedNewsForUsers.sort(
      (pre, next) => next.id - pre.id
    )

    user.Comments = user.Comments.sort(
      (pre, next) => next.id - pre.id
    )

    return res.render('users/profile', { user, comments })
  }
}