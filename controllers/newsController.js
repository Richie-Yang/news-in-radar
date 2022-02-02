const moment = require('moment')
const axios = require('axios')
const { News } = require('../models')

module.exports = {
  genNewsList: async (req, res, next) => {
    try {
      const now = moment()

      const news = await News.findOne({
        order: [['createdAt', 'DESC']],
        limit: 1,
        raw: true
      })

      const past = moment(news.createdAt)
      const diff = Math.ceil(
        moment.duration(now.diff(past)).as('minutes')
      )
      if (diff < 60) return next()

      const requestUrl = `${process.env.NEWS_API_URI}?country=${process.env.NEWS_API_QUERY_COUNTRY}&apiKey=${process.env.NEWS_API_KEY}`

      const { data } = await axios.get(requestUrl)
      if (data.status !== 'ok') throw new Error('新聞自動化擷取程序出錯')

      return Promise.all(
        Array.from({ length: data.totalResults }, (_, index) => {
          const {
            author, title, description, url, urlToImage, publishedAt
          } = data.articles[index]

          return News.create({
            author, title, description, url, urlToImage, publishedAt
          })
        })
      )
    } catch (err) { next(err) }
  },

  getNewsList: (req, res, next) => {
    return News.findAll({ raw: true })
      .then(news => res.render('news', { news }))
      .catch(err => next(err))
  }
}