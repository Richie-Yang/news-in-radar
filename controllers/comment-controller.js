const { Op } = require("sequelize")
const { Comment, News, User, Like } = require('../models')

module.exports = {
  postComment: async (req, res, next) => {
    try {
      const { newsId, commentId } = req.params
      const content = req.body.comment
      const userId = req.user.id

      if (!content.trim()) throw new Error('評論欄位不能為空')

      const [_, user, news] = await Promise.all([
        Comment.create({
          content, newsId, userId, commentId
        }),
        User.findByPk(userId, { 
          attributes: ['id', 'totalComments']
        }),
        News.findByPk(newsId, {
          attributes: ['id', 'totalComments']
        })
      ])

      if (!news) throw new Error('新聞已經不存在了')
      await user.increment('totalComments', { by: 1 })
      await news.increment('totalComments', { by: 1 })

      req.flash('success_messages', '評論已經成功送出')
      return res.redirect('back')

    } catch (err) { next(err) }
  },

  putComment: async (req, res, next) => {
    try {
      const { newsId, commentId } = req.params
      let content = req.body.comment.trim()
      const userId = req.user.id

      if (!content) throw new Error('評論欄位不能為空')

      const comment = await Comment.findOne({
        where: { id: commentId, newsId, userId }
      })

      if (!comment) throw new Error('評論已經不存在了')
      comment.update({ content })

      req.flash('success_messages', '評論已經成功修改')
      return res.redirect(`/news/${newsId}`)

    } catch (err) { next(err) }
  },

  deleteComment: async (req, res, next) => {
    try {
      const { newsId, commentId } = req.params
      const userId = req.user.id

      const [rootComment, childComments, news, likes] = await Promise.all([
        Comment.findOne({
          attributes: ['id'],
          where: { id: commentId, newsId, userId }
        }),
        Comment.findAndCountAll({
          attributes: ['id'],
          where: { commentId }
        }),
        News.findByPk(newsId, {
          attributes: ['id', 'totalComments']
        }),
        Like.findAll({
          where: { commentId }
        })
      ])

      if (!rootComment) throw new Error('評論已經不存在了')
      if (!news) throw new Error('新聞已經不存在了')

      await Promise.all([
        rootComment.destroy(),
        ...childComments.rows.map(c => c.destroy()),
        news.decrement('totalComments', { by: childComments.count + 1 }),
        ...likes.map(l => l.destroy())
      ])
      
      req.flash('success_messages', '評論已經成功刪除')
      return res.redirect('back')

    } catch (err) { next(err) }
  },

  postLike: async (req, res, next) => {
    try {
      const { commentId } = req.params
      const userId = req.user.id

      const [comment, like] = await Promise.all([
        Comment.findByPk(commentId, {
          attributes: ['id', 'totalLikes', 'userId'],
        }),
        Like.findOne({
          attributes: ['id'],
          where: { commentId, userId }
        })
      ])

      if (!comment) throw new Error('評論已經不存在了')
      if (like) throw new Error('你已經喜歡過這個評論')

      const user = await User.findByPk(comment.userId, {
        attributes: ['id', 'totalLikes']
      })
      if (!user) throw new Error('這個使用者已經不存在了')

      await Promise.all([
        user.increment('totalLikes', { by: 1 }),
        comment.increment('totalLikes', { by: 1 }),
        Like.create({ commentId, userId })
      ])

      return res.redirect('back')

    } catch (err) { next(err) }
  },

  deleteLike: async (req, res, next) => {
    try {
      const { commentId } = req.params
      const userId = req.user.id

      const [comment, like] = await Promise.all([
        Comment.findByPk(commentId, {
          attributes: ['id', 'totalLikes', 'userId']
        }),
        Like.findOne({
          where: { commentId, userId }
        })
      ])

      if (!comment) throw new Error('評論已經不存在了')
      if (!like) throw new Error('你尚未喜歡過這個評論')

      const user = await User.findByPk(comment.userId, {
        attributes: ['id', 'totalLikes']
      })
      if (!user) throw new Error('這個使用者已經不存在了')

      await Promise.all([
        user.decrement('totalLikes', { by: 1 }),
        comment.decrement('totalLikes', { by: 1 }),
        like.destroy()
      ])

      return res.redirect('back')

    } catch (err) { next(err) }
  }
}