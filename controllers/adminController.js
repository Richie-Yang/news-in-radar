const moment = require('moment')
const { News, User } = require('../models')

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
  },

  getUsers: (req, res, next) => {
    return User.findAll({ raw: true })
      .then(users => {
        users = users.map(user => ({
          ...user,
          isRoot: user.name === 'root' && user.email === 'root@example.com'
        }))
        res.render('admin/users', { users })
      })
      .catch(err => next(err))
  },

  patchUser: (req, res, next) => {
    const { userId } = req.params

    return User.findByPk(userId)
      .then(user => {
        if (!user) throw new Error('這個使用者已不存在')

        const { name, email, isAdmin } = user
        if (name === 'root' && email === 'root@example.com') {
          throw new Error('管理者權限是禁止修改的')
        }

        return user.update({
          isAdmin: !isAdmin
        })
      })
      .then(() => {
        req.flash('success_messages', '使用者權限調整成功')
        res.redirect('back')
      })
      .catch(err => next(err))
  },

  deleteUser: (req, res, next) => {
    const { userId } = req.params

    return User.findByPk(userId)
      .then(user => {
        if (!user) throw new Error('使用者已不存在')

        const { name, email } = user
        if (name === 'root' && email === 'root@example.com') {
          throw new Error('管理者權限是禁止刪除的')
        }

        return user.destroy()
      })
      .then(() => {
        req.flash('success_messages', '使用者已經成功刪除')
        return res.redirect('back')
      })
      .catch(err => next(err))
  }
}