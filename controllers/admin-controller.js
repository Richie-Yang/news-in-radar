const moment = require('moment')
const { Op } = require('sequelize')
const { News, User, Category, Comment, Like, Followship, sequelize } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const { axiosErrorHandler } = require('../middleware/error-handler')

module.exports = {
  getNewsList: async (req, res, next) => {
    try {
      let { keyword, filter } = req.query
      const page = Number(req.query.page) || 1
      const limit = 10
      const offset = getOffset(page, limit)

      keyword = keyword ? keyword.trim() : ''
      filter = filter && filter !== 'none' ? filter : 'DESC'

      const { count, rows } = await News.findAndCountAll({
        where: {
          [Op.or]: {
            title: { [Op.like]: `%${keyword}%` },
            author: { [Op.like]: `%${keyword}%` }
          }
        },
        order: [['publishedAt', filter]],
        limit,
        offset,
        raw: true
      })

      return res.render('admin/news-list', {
        news: rows,
        pagination: getPagination(page, limit, count),
        keyword,
        filter
      })
    } catch (err) { next(err) }
  },

  editNews: async (req, res, next) => {
    try {
      const { newsId } = req.params

      let [news, categories] = await Promise.all([
        News.findByPk(newsId, { raw: true }),
        Category.findAll({ raw: true })
      ])

      if (!news) throw new Error('新聞並不存在')

      news = {
        ...news,
        publishedAt: moment(news.publishedAt).format('YYYY-MM-DDThh:mm')
      }

      return res.render('admin/news-edit', { news, categories })
    } catch (err) { next(err) }
  },

  putNews: async (req, res, next) => {
    try {
      const { newsId } = req.params
      const {
        title, description, author, url, urlToImage, publishedAt, categoryId
      } = req.body

      if (!title.trim() || !description.trim() || !categoryId) {
        throw new Error('標題、描述、類別欄位都是必填')
      }

      const news = await News.findByPk(newsId)
      if (!news) throw new Error('這個新聞已不存在')

      await news.update({
        title,
        description: description.trim(),
        author,
        url,
        urlToImage,
        publishedAt: moment(publishedAt).format(),
        categoryId: Number(categoryId)
      })

      req.flash('success_messages', '新聞內容已經成功修改')
      return res.redirect('/admin/news')
    } catch (err) { next(err) }
  },

  deleteNews: async (req, res, next) => {
    try {
      const { newsId } = req.params

      const [news, comments, likes] = await Promise.all([
        News.findByPk(newsId),
        Comment.findAll({
          where: { newsId }
        }),
        Like.findAll({
          where: { newsId }
        })
      ])

      if (!news) throw new Error('這個新聞已不存在')

      await sequelize.transaction(async t => {
        await Promise.all([
          news.destroy({ transaction: t }),
          ...comments.map(c => c.destroy({ transaction: t })),
          ...likes.map(l => l.destroy({ transaction: t }))
        ])
      })

      req.flash('success_messages', '新聞內容已經成功刪除')
      return res.redirect('back')
    } catch (err) { next(err) }
  },

  getUsers: async (req, res, next) => {
    try {
      let { keyword, filter } = req.query
      const page = Number(req.query.page) || 1
      const limit = 10
      const offset = getOffset(page, limit)

      keyword = keyword ? keyword.trim() : ''
      filter = filter && filter !== 'none' ? filter : 'DESC'

      let { count, rows } = await User.findAndCountAll({
        where: {
          [Op.or]: {
            name: { [Op.like]: `%${keyword}%` },
            email: { [Op.like]: `%${keyword}%` }
          }
        },
        order: [['createdAt', filter]],
        limit,
        offset,
        raw: true
      })

      rows = rows.map(row => ({
        ...row,
        isRoot: row.name === 'root' && row.email === 'root@example.com'
      }))

      return res.render('admin/users', {
        users: rows,
        pagination: getPagination(page, limit, count),
        keyword,
        filter
      })
    } catch (err) { next(err) }
  },

  patchUser: async (req, res, next) => {
    try {
      const { userId } = req.params

      const user = await User.findByPk(userId)
      if (!user) throw new Error('這個使用者已不存在')

      const { name, email, isAdmin } = user
      if (name === 'root' && email === 'root@example.com') {
        throw new Error('管理者權限是禁止修改的')
      }

      await user.update({ isAdmin: !isAdmin })
      req.flash('success_messages', '使用者權限調整成功')
      return res.redirect('back')
    } catch (err) { next(err) }
  },

  deleteUser: async (req, res, next) => {
    try {
      const userId = Number(req.params.userId)

      const [user, likes, followships] = await Promise.all([
        User.findByPk(userId),
        Like.findAll({
          where: { userId }
        }),
        Followship.findAll({
          where: {
            [Op.or]: [
              { followerId: userId },
              { followingId: userId }
            ]
          }
        })
      ])
      if (!user) throw new Error('使用者已不存在')

      const { name, email } = user
      if (name === 'root' && email === 'root@example.com') {
        throw new Error('管理者權限是禁止刪除的')
      }

      await sequelize.transaction(async t => {
        await Promise.all([
          user.destroy({ transaction: t }),
          ...likes.map(l => l.destroy({ transaction: t })),
          ...followships.map(f => f.destroy({ transaction: t }))
        ])
      })

      req.flash('success_messages', '使用者已經成功刪除')
      return res.redirect('back')
    } catch (err) { next(err) }
  },

  getCategories: async (req, res, next) => {
    try {
      let { keyword, filter } = req.query
      const { categoryId } = req.params
      const page = Number(req.query.page) || 1
      const limit = 10
      const offset = getOffset(page, limit)

      keyword = keyword ? keyword.trim() : ''
      filter = filter && filter !== 'none' ? filter : 'DESC'

      let { count, rows } = await Category.findAndCountAll({
        where: {
          [Op.or]: {
            name: { [Op.like]: `%${keyword}%` },
            displayName: { [Op.like]: `%${keyword}%` }
          }
        },
        order: [['createdAt', filter]],
        limit,
        offset,
        raw: true
      })

      if (categoryId) {
        rows = rows.map(row => ({
          ...row,
          isEditable: row.id === Number(categoryId)
        }))
      }

      return res.render('admin/categories', {
        categories: rows,
        pagination: getPagination(page, limit, count),
        keyword,
        filter
      })
    } catch (err) { next(err) }
  },

  postCategory: async (req, res, next) => {
    try {
      const { name, displayName } = req.body

      if (!name.trim() || !displayName.trim()) {
        throw new Error('兩個欄位都是必填的')
      }

      await Category.create({ name, displayName })

      req.flash('success_messages', '類別已經成功建立')
      return res.redirect('/admin/categories')
    } catch (err) { next(err) }
  },

  putCategory: async (req, res, next) => {
    try {
      const { categoryId } = req.params
      const { name, displayName } = req.body

      if (!name.trim() || !displayName.trim()) {
        throw new Error('兩個欄位都是必填的')
      }

      const category = await Category.findByPk(categoryId)
      if (!category) throw new Error('這個類別並不存在')

      await category.update({ name, displayName })

      req.flash('success_messages', '類別已經成功修改')
      return res.redirect('/admin/categories')
    } catch (err) { next(err) }
  },

  deleteCategory: async (req, res, next) => {
    try {
      const { categoryId } = req.params

      const category = await Category.findByPk(categoryId)
      if (!category) throw new Error('這個類別並不存在')

      await category.destroy()

      req.flash('success_messages', '類別已經成功刪除')
      return res.status(200).json({ message: 'ok' })
    } catch (err) { axiosErrorHandler(err, req, res) }
  }
}
