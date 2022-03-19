const { Op } = require('sequelize')
const { Comment, News, User, Like, sequelize } = require('../models')

module.exports = {
  postComment: async (req, res, next) => {
    try {
      const { newsId, commentId } = req.params
      const content = req.body.comment
      const userId = req.user.id

      if (!content.trim()) throw new Error('評論欄位不能為空')

      await sequelize.transaction(async t => {
        const [user, news] = await Promise.all([
          User.findByPk(userId, {
            attributes: ['id', 'totalComments'],
            transaction: t
          }),
          News.findByPk(newsId, {
            attributes: ['id', 'totalComments'],
            transaction: t
          }),
          Comment.create(
            { content, newsId, userId, commentId },
            { transaction: t }
          )
        ])

        if (!news) throw new Error('新聞已經不存在了')
        await user.increment('totalComments', { by: 1, transaction: t })
        await news.increment('totalComments', { by: 1, transaction: t })
      })

      req.flash('success_messages', '評論已經成功送出')
      return res.redirect('back')
    } catch (err) { next(err) }
  },

  putComment: async (req, res, next) => {
    try {
      const { newsId, commentId } = req.params
      const content = req.body.comment.trim()
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

      await sequelize.transaction(async t => {
        await Promise.all([
          rootComment.destroy({ transaction: t }),
          Comment.destroy({
            where: {
              id: { [Op.in]: childComments.rows.map(c => c.id) }
            },
            transaction: t
          }),
          news.decrement('totalComments', {
            by: childComments.count + 1, transaction: t
          }),
          Like.destroy({
            where: {
              id: { [Op.in]: likes.map(l => l.id) }
            },
            transaction: t
          })
        ])
      })

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
          attributes: ['id', 'totalLikes', 'userId']
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

      await sequelize.transaction(async t => {
        await Promise.all([
          user.increment('totalLikes', { by: 1, transaction: t }),
          comment.increment('totalLikes', { by: 1, transaction: t }),
          Like.create({ commentId, userId }, { transaction: t })
        ])
      })

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

      await sequelize.transaction(async t => {
        await Promise.all([
          user.decrement('totalLikes', { by: 1, transaction: t }),
          comment.decrement('totalLikes', { by: 1, transaction: t }),
          like.destroy({ transaction: t })
        ])
      })

      return res.redirect('back')
    } catch (err) { next(err) }
  }
}
