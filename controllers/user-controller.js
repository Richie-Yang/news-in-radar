const bcrypt = require('bcryptjs')
const { User, Comment, News, Followship, sequelize } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')
const ValidateHelper = require('../helpers/validate-helper')
const userServices = require('../services/user-services')

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

  register: async (req, res, next) => {
    try {
      const errors = []
      const { name, email, password, confirmPassword } = req.body

      const validate = new ValidateHelper(errors)
      validate.registerCheck(email, password, confirmPassword)

      const user = await User.findOne({ where: { email } })
      if (user) throw new Error('信箱已經被使用過')

      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(password, salt)

      // generate related validation material
      const validationTime = Date.now()
      const validationCode = userServices.verificationCreated()

      await User.create({
        name: name || email,
        email,
        password: hash,
        validationCode,
        validationTime
      })

      await userServices.verificationSent(
        email, req.headers.host, validationCode
      )

      req.flash('success_messages', '帳號已經成功註冊')
      res.redirect('/login')
    } catch (err) { next(err) }
  },

  logout: (req, res) => {
    req.flash('success_messages', '你已經成功登出了')
    req.logout()
    return res.redirect('/login')
  },

  verifyPage: (req, res) => {
    return res.render('verify')
  },

  verify: async (req, res, next) => {
    try {
      const { status } = req.query
      const user = await User.findByPk(req.user.id)
      if (!user) throw new Error('沒有該使用者')

      if (status === 'email_sent') {
        // generate related validation material
        const validationTime = Date.now()
        const validationCode = userServices.verificationCreated()

        await Promise.all([
          user.update({ validationTime, validationCode }),
          userServices.verificationSent(
            user.email, validationCode
          )
        ])

        req.flash('success_messages', '認證信件已經成功寄送')
        return res.status(200).send()
      }

      if (status === 'email_verify') {
        const { prefix, postfix } = req.query
        const { validationCode, validationTime, isAdmin } = req.user
        const incomingCode = `${prefix}-${postfix}`

        const isActive = userServices.verificationCheck(
          incomingCode, validationCode, validationTime
        )

        if (!isActive) {
          req.flash('warning_messages', '認證失敗，請再重新驗證')
          return res.redirect('back')
        }
        await user.update({ isActive })
        const redirectPath = isAdmin ? '/admin/news' : '/news'
        return res.redirect(redirectPath)
      }

      return res.render('verify')
    } catch (err) { next(err) }
  },

  getUser: async (req, res, next) => {
    try {
      const sessionUserId = req.user.id
      const requestUserId = Number(req.params.userId)
      const DEFAULT_COUNT = 14

      let [user, comments] = await Promise.all([
        User.findByPk(requestUserId, {
          include: [
            { model: News, as: 'LikedNewsForUsers' },
            { model: User, as: 'Followings' },
            { model: User, as: 'Followers' },
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
      const followerIdArray = user.Followers.map(f => f.id)

      user = {
        ...user.toJSON(),
        isEditable: sessionUserId === requestUserId,
        isFollowed: followerIdArray.some(f => f === sessionUserId)
      }

      // sort user.LikedNewsForUsers
      user.LikedNewsForUsers = user.LikedNewsForUsers.sort(
        (pre, next) => next.id - pre.id
      )

      // sort user.Comments
      user.Comments = user.Comments.sort(
        (pre, next) => next.id - pre.id
      )

      // filter for only first 14 rows of results from user.Comments
      const commentSet = new Set()
      user.Comments = user.Comments.filter(c => {
        return !commentSet.has(c.newsId) && commentSet.size < DEFAULT_COUNT
          ? commentSet.add(c.newsId)
          : false
      })

      return res.render('users/profile', {
        requestUser: user, comments, getProfile: true
      })
    } catch (err) { next(err) }
  },

  editUser: async (req, res, next) => {
    try {
      const userId = req.user.id

      const user = await User.findByPk(userId, { raw: true })
      if (!user) throw new Error('這位使用者已經不存在了')

      return res.render('users/profile', {
        requestUser: user, editProfile: true
      })
    } catch (err) { next(err) }
  },

  putUser: async (req, res, next) => {
    try {
      const errors = []
      const userId = req.user.id
      const {
        name, description, passwordEditCheck, password, confirmPassword
      } = req.body
      const { file } = req
      let hash

      if (!name.trim()) throw new Error('名稱欄位必填')
      if (passwordEditCheck === 'on') {
        const validate = new ValidateHelper(errors)
        validate.editUserCheck(password, confirmPassword)

        const salt = await bcrypt.genSalt(10)
        hash = await bcrypt.hash(password.trim(), salt)
      }

      const [user, filePath] = await Promise.all([
        User.findByPk(userId),
        imgurFileHandler(file)
      ])

      if (!user) throw new Error('這位使用者已經不存在了')

      await user.update({
        name: name.trim(),
        image: filePath || user.image,
        description,
        password: hash || user.password
      })

      req.flash('success_messages', '個人資訊已經成功修改')
      return res.redirect(`/users/${userId}`)
    } catch (err) { next(err) }
  },

  postFollowship: async (req, res, next) => {
    try {
      const followerId = req.user.id
      const { followingId } = req.params

      const [followship, follower, following] = await Promise.all([
        Followship.findOne({
          where: { followerId, followingId },
          raw: true
        }),
        User.findByPk(followerId, {
          attributes: ['id', 'totalFollowings']
        }),
        User.findByPk(followingId, {
          attributes: ['id', 'totalFollowers']
        })
      ])

      if (followship) throw new Error('你已經追隨過該使用者')
      if (!follower || !following) throw new Error('追隨或是被追隨者已不存在')

      await sequelize.transaction(async t => {
        await Promise.all([
          Followship.create({ followerId, followingId }, { transaction: t }),
          follower.increment('totalFollowings', { by: 1, transaction: t }),
          following.increment('totalFollowers', { by: 1, transaction: t })
        ])
      })

      req.flash('success_messages', '你已經成功追隨該使用者')
      return res.redirect('back')
    } catch (err) { next(err) }
  },

  deleteFollowship: async (req, res, next) => {
    try {
      const followerId = req.user.id
      const { followingId } = req.params

      const [followship, follower, following] = await Promise.all([
        Followship.findOne({
          where: { followerId, followingId }
        }),
        User.findByPk(followerId, {
          attributes: ['id', 'totalFollowings']
        }),
        User.findByPk(followingId, {
          attributes: ['id', 'totalFollowers']
        })
      ])

      if (!followship) throw new Error('你尚未追隨過該使用者')
      if (!follower || !following) throw new Error('追隨或是被追隨者已不存在')

      await sequelize.transaction(async t => {
        await Promise.all([
          followship.destroy({ transaction: t }),
          follower.decrement('totalFollowings', { by: 1, transaction: t }),
          following.decrement('totalFollowers', { by: 1, transaction: t })
        ])
      })

      req.flash('success_messages', '你已經停止追隨該使用者')
      return res.redirect('back')
    } catch (err) { next(err) }
  }
}
