const moment = require('moment')
const { News } = require('../models')

module.exports = {
  getNewsList: (req, res, next) => {
    return News.findAll({ raw: true })
      .then(news => {
        news = news.map(item => ({
          ...item,
          publishedAt: moment(item.publishedAt).format("YYYY/MM/DD")
        }))

        return res.render('admin/news', { news })
      })
      .catch(err => next(err))
  },

  editNews: (req, res, next) => {
    const { newsId } = req.params

    return News.findByPk(newsId, { raw: true })
      .then(news => {
        if (!news) throw new Error('新聞並不存在')
        return res.render('admin/news-edit', { news })
      })
      .catch(err => next(err))
  },

  putNews: (req, res, next) => {
    const { newsId } = req.params
    const { 
      title, description, author, url, urlToImage, publishedAt 
    } = req.body

    if (!title.trim() || !description.trim()) {
      throw new Error('標題和描述欄位都是必填')
    }

    return News.findByPk(newsId)
      .then(news => {
        if (!news) throw new Error('這個新聞已不存在')

        return news.update({
          title,
          description: description.trim(),
          author,
          url,
          urlToImage,
          publishedAt: moment(publishedAt).format()
        })
      })
      .then(() => {
        req.flash('success_messages', '新聞內容已經成功修改')
        return res.redirect('/admin/news')
      })
      .catch(err => next(err))
  },

  deleteNews: (req, res, next) => {
    const { newsId } = req.params

    return News.findByPk(newsId)
      .then(news => {
        if (!news) throw new Error('這個新聞已不存在')

        return news.destroy()
      })
      .then(() => {
        req.flash('success_messages', '新聞內容已經成功刪除')
        return res.redirect('back')
      })
      .catch(err => next(err))
  }
}