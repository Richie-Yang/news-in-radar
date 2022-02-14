const moment = require('moment')
const { Op } = require("sequelize")
const { News, Comment, User, Like, Category } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const newsServices = require('../services/news-services')

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

      // this is fixed data object format which...
      // will be sent to newsServices.genNewsList
      const data = {
        NEWS_API_URI: process.env.NEWS_API_URI,
        NEWS_API_QUERY_COUNTRY: [
          process.env.NEWS_API_QUERY_COUNTRY_1,
          process.env.NEWS_API_QUERY_COUNTRY_2,
          process.env.NEWS_API_QUERY_COUNTRY_3
        ],
        NEWS_API_KEY: [
          process.env.NEWS_API_KEY_1,
          process.env.NEWS_API_KEY_2,
        ],
        PAGE_SIZE
      }

      await newsServices.genNewsList(data, (err) => {
        err ? next(err) : next()
      })

    } catch (err) { next(err) }
  },

  getNewsList: async (req, res, next) => {
    try {
      let { keyword, filter, categoryId } = req.query
      const page = Number(req.query.page) || 1
      const limit = 9
      const offset = getOffset(page, limit)

      keyword = keyword ? keyword.trim() : ''
      filter = filter && filter !== 'none'
        ? filter : "DESC"

      const where = {
        [Op.or]: {
          title: { [Op.like]: `%${keyword}%` },
          author: { [Op.like]: `%${keyword}%` }
        }
      }

      switch (true) {
        case (Number(categoryId) === 0):
          categoryId = Number(categoryId)
          where.categoryId = categoryId
          break
        case (Number(categoryId) > 0):
          categoryId = Number(categoryId)
          where.categoryId = categoryId
          break
        default:
          categoryId = 'all'
          where.categoryId = { [Op.like]: '%' }
      }

      const [news, categories] = await Promise.all([
        News.findAndCountAll({
          where,
          order: [['publishedAt', filter]],
          limit,
          offset,
          raw: true
        }),

        Category.findAll({ raw: true })
      ])

      let { count, rows } = news

      const likedNewsIdArray = req.user?.LikedNewsForUsers.map(likedNews => likedNews.id) || []
      rows = rows.map(item => ({
        ...item,
        isLiked: likedNewsIdArray.some(likedNewsId => likedNewsId === item.id)
      }))

      return res.render('news-list', {
        news: rows,
        pagination: getPagination(page, limit, count),
        keyword,
        filter,
        categories,
        categoryId
      })
    } catch (err) { next(err) }
  },

  getNews: async (req, res, next) => {
    try {
      const { newsId } = req.params
      const userId = req.user?.id || null

      // using eager loading to get two rows comment data
      let news = await News.findByPk(newsId, {
        include: { 
          model: Comment, include: [
            { model: User },
            { model: Comment, as: 'ReplyComments', include: User }
          ] 
        },
        nest: true
      })

      if (!news) throw new Error('這個新聞並不存在')
      // retrieve user's likes for comments first
      const likedCommentsIdArray = req.user?.LikedCommentForUsers.map(likedComment => likedComment.id) || []

      news = news.toJSON()
      // remove non root comment from first row
      for (let i = news.Comments.length - 1; i >= 0; i--) {
        if (news.Comments[i].commentId) news.Comments.splice(i, 1)
      }

      // assign to one variable for later simplicity
      const newsComments = news.Comments

      // loop root comments (first row) to insert 'isLiked' and 'isEditable'
      for (let x = 0; x < newsComments.length; x++) {
        newsComments[x].isLiked = likedCommentsIdArray.some(
          likedCommentId => likedCommentId === newsComments[x].id
        )
        newsComments[x].isEditable = newsComments[x].userId === userId

        // assign to one variable for later simplicity
        const replyComments = news.Comments[x].ReplyComments
        
        if (replyComments.length) {
          // loop child comments (second row) to insert 'isLiked' and 'isEditable'
          for (let y = 0; y < replyComments.length; y++) {
            replyComments[y].isLiked = likedCommentsIdArray.some(
              likedCommentId => likedCommentId === replyComments[y].id
            )
            replyComments[y].isEditable = replyComments[y].userId === userId
          }
        }
      }

      let relatedNews = await News.findAll({
        where: { author: news.author, id: { [Op.ne]: news.id } },
        limit: 5,
        raw: true
      })

      return res.render('news', { news, relatedNews })

    } catch (err) { next(err) }
  },

  postLike: async (req, res, next) => {
    try {
      const { newsId } = req.params
      const userId = req.user.id

      const [news, like] = await Promise.all([
        News.findByPk(newsId),
        Like.findOne({
          where: { newsId, userId }
        })
      ])

      if (!news) throw new Error('新聞已經不存在了')
      if (like) throw new Error('你已經喜歡過這則新聞')

      await Promise.all([
        news.increment('totalLikes', { by: 1 }),
        Like.create({ newsId, userId })
      ])

      return res.redirect('back')
      
    } catch (err) { next(err) }
  },

  deleteLike: async (req, res, next) => {
    try {
      const { newsId } = req.params
      const userId = req.user.id

      const [news, like] = await Promise.all([
        News.findByPk(newsId),
        Like.findOne({
          where: { newsId, userId }
        })
      ])

      if (!news) throw new Error('新聞已經不存在了')
      if (!like) throw new Error('你尚未喜歡過這則新聞')

      await Promise.all([
        news.decrement('totalLikes', { by: 1 }),
        like.destroy()
      ])

      return res.redirect('back')

    } catch (err) { next(err) }
  }
}