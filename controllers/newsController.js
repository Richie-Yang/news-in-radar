const moment = require('moment')
const axios = require('axios')
const { Op } = require("sequelize")
const { News, Comment, User } = require('../models')
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

      await Promise.allSettled(
        Array.from({ length: data.articles.length }, (_, index) => {
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
      next()
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

  getNews: async (req, res, next) => {
    try {
      const { newsId } = req.params

      let news = await News.findByPk(newsId, {
        include: { model: Comment, include: User },
        nest: true
      })

      if (!news) throw new Error('這個新聞並不存在')
      news = news.toJSON()

      // const relatedNews = await News.findAll({
      //   where: { title: { [Op.like]: `%${news.title.substring(0, 5)}%` } },
      //   raw: true
      // })

      let relatedNews = await News.findAll({
        where: { author: news.author, id: { [Op.ne]: news.id } },
        raw: true
      })

      return res.render('news', { news, relatedNews })

    } catch (err) { next(err) }
  }
}