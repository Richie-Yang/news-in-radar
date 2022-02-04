const { Op } = require("sequelize")
const { Comment, News, User } = require('../models')

module.exports = {
  postComment: async (req, res, next) => {
    try {
      const { newsId } = req.params
      const content = req.body.comment
      const userId = req.user.id

      if (!content.trim()) throw new Error('評論欄位不能為空')

      const [_, news] = await Promise.all([
        Comment.create({
          content, newsId, userId
        }),
        News.findByPk(newsId)
      ])

      if (!news) throw new Error('新聞已經不存在了')
      await news.increment('totalComments', { by: 1 })

      req.flash('success_messages', '評論已經成功送出')
      return res.redirect('back')

    } catch (err) { next(err) }
  },

  editComment: async (req, res, next) => {
    const { newsId, commentId } = req.params
    const userId = req.user.id

    let [news, comment] = await Promise.all([
      News.findByPk(newsId, {
        include: { model: Comment, include: User },
        nest: true
      }),
      Comment.findOne({
        where: { id: commentId, newsId, userId },
        raw: true
      })
    ])

    if (!news) throw new Error('這個新聞並不存在')
    if (!comment) throw new Error('評論已經不存在了')
    news = news.toJSON()

    let relatedNews = await News.findAll({
      where: { author: news.author, id: { [Op.ne]: news.id } },
      raw: true
    })

    return res.render('news', {
      news,
      relatedNews,
      comment,
      editComment: true })
  },

  putComment: (req, res, next) => {
    const { newsId, commentId } = req.params
    const content = req.body.comment
    const userId = req.user.id

    if (!content.trim()) throw new Error('評論欄位不能為空')
    
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

      const [comment, news] = await Promise.all([
        Comment.findOne({
          where: { id: commentId, newsId, userId }
        }),
        News.findByPk(newsId)
      ])

      if (!comment) throw new Error('評論已經不存在了')
      if (!news) throw new Error('新聞已經不存在了')

      await Promise.all([
        comment.destroy(),
        news.decrement('totalComments', { by: 1 })
      ])
      
      req.flash('success_messages', '評論已經成功刪除')
      return res.redirect('back')

    } catch (err) { next(err) }
  }
}