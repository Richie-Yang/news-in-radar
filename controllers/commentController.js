const { Op } = require("sequelize")
const { Comment, News, User, Like } = require('../models')

module.exports = {
  postComment: async (req, res, next) => {
    try {
      const { newsId, commentId } = req.params
      const content = req.body.comment
      const userId = req.user.id

      if (!content.trim()) throw new Error('評論欄位不能為空')

      const [_, news] = await Promise.all([
        Comment.create({
          content, newsId, userId, commentId
        }),
        News.findByPk(newsId)
      ])

      if (!news) throw new Error('新聞已經不存在了')
      await news.increment('totalComments', { by: 1 })

      req.flash('success_messages', '評論已經成功送出')
      return res.redirect('back')

    } catch (err) { next(err) }
  },

  putComment: (req, res, next) => {
    const { newsId, commentId } = req.params
    let content = req.body.comment.trim()
    const userId = req.user.id

    if (!content) throw new Error('評論欄位不能為空')
    
    return Comment.findOne({
      where: { id: commentId, newsId, userId }
    })
      .then(comment => {
        if (!comment) throw new Error('評論已經不存在了')

        return comment.update({ content })
      })
      .then(() => {
        req.flash('success_messages', '評論已經成功修改')
        return res.redirect(`/news/${newsId}`)
      })
      .catch(err => next(err))
  },

  deleteComment: async (req, res, next) => {
    try {
      const { newsId, commentId } = req.params
      const userId = req.user.id

      const [comment, replies, news] = await Promise.all([
        Comment.findOne({
          where: { id: commentId, newsId, userId }
        }),
        Comment.findAndCountAll({
          where: { commentId }
        }),
        News.findByPk(newsId)
      ])

      if (!comment) throw new Error('評論已經不存在了')
      if (!news) throw new Error('新聞已經不存在了')

      await Promise.all([
        comment.destroy(),
        ...replies.rows.map(reply => reply.destroy()),
        news.decrement('totalComments', { by: replies.count + 1 })
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
        Comment.findByPk(commentId),
        Like.findOne({
          where: { commentId, userId }
        })
      ])

      if (!comment) throw new Error('評論已經不存在了')
      if (like) throw new Error('你已經喜歡過這個評論')

      await Promise.all([
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
        Comment.findByPk(commentId),
        Like.findOne({
          where: { commentId, userId }
        })
      ])

      if (!comment) throw new Error('評論已經不存在了')
      if (!like) throw new Error('你尚未喜歡過這個評論')

      await Promise.all([
        comment.decrement('totalLikes', { by: 1 }),
        like.destroy()
      ])

      return res.redirect('back')

    } catch (err) { next(err) }
  }
}