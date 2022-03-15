const bcrypt = require('bcryptjs')
const { User, Comment, News, Followship } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')
const { registerValidation } = require('../helpers/validate-helpers')

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
      const { name, email, password } = req.body

      const validatedResult = registerValidation(req.body)
      if (validatedResult !== 'ok') {
        throw new Error(validatedResult)
      }

      const user = await User.findOne({ where: { email } })
      if (user) throw new Error('信箱已經被使用過')

      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(password, salt)

      await User.create({
        name: name || email, email, password: hash
      })

      req.flash('success_messages', '帳號已經成功註冊')
      res.redirect('/login')
    } catch (err) { next(err) }
  },

  logout: (req, res) => {
    req.flash('success_messages', '你已經成功登出了')
    req.logout()
    return res.redirect('/login')
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
      const userId = req.user.id
      const {
        name, description, passwordEditCheck, password, confirmPassword
      } = req.body
      const { file } = req
      let hash

      if (!name.trim()) throw new Error('名稱欄位必填')
      if (passwordEditCheck === 'on') {
        if (password.trim() !== confirmPassword.trim()) {
          throw new Error('密碼欄位並不符合')
        }

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

      await Promise.all([
        Followship.create({
          followerId, followingId
        }),
        follower.increment('totalFollowings', { by: 1 }),
        following.increment('totalFollowers', { by: 1 })
      ])

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

      await Promise.all([
        followship.destroy(),
        follower.decrement('totalFollowings', { by: 1 }),
        following.decrement('totalFollowers', { by: 1 })
      ])

      req.flash('success_messages', '你已經停止追隨該使用者')
      return res.redirect('back')
    } catch (err) { next(err) }
  }
}
