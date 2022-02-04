const moment = require('moment')
const axios = require('axios')
const { News } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

module.exports = {
  genNewsList: async (req, res, next) => {
    try {
      const now = moment()
      const PAGE_SIZE = 18

      const news = await News.findOne({
        order: [['createdAt', 'DESC']],
        limit: 1,
        raw: true
      })

      const past = news ? news.createdAt : moment([1970, 1, 1])
      const diff = Math.ceil(
        moment.duration(now.diff(past)).as('minutes')
      )
      if (diff < 60) return next()

      const requestUrl = `${process.env.NEWS_API_URI}?country=${process.env.NEWS_API_QUERY_COUNTRY}&apiKey=${process.env.NEWS_API_KEY}&pageSize=${PAGE_SIZE}`

      const { data } = await axios.get(requestUrl)
      if (data.status !== 'ok') throw new Error('新聞自動化擷取程序出錯')

      return await Promise.all(
        Array.from({ length: data.articles.length }, (_, index) => {
          console.log(data.totalResults, index, data.articles[index].title)
          const {
            title, description, url, urlToImage, publishedAt
          } = data.articles[index]

          const author = data.articles[index].author
            ? data.articles[index].author
            : '尚無出處'

          return News.findOne({ where: { title } })
            .then(news => {
              if (!news) {
                return News.create({
                  author, title, description, url, urlToImage, publishedAt
                })
              }
            })
        })
      )
    } catch (err) { next(err) }
  },

  getNewsList: (req, res, next) => {
    const page = Number(req.query.page) || 1
    const limit = 9
    const offset = getOffset(page, limit)

    return News.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      raw: true
    })
      .then(({ count, rows }) => {
        res.render('news-list', {
          news: rows,
          pagination: getPagination(page, limit, count)
        })
      })
      .catch(err => next(err))
  },

  getNews: (req, res, next) => {
    const { newsId } = req.params

    return News.findByPk(newsId, { raw: true })
      .then(news => {
        if (!news) throw new Error('這個新聞並不存在')

        return res.render('news', { news })
      })
      .catch(err => next(err))
  }
}