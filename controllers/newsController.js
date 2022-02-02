const { News } = require('../models')

module.exports = {
  getNewsList: (req, res, next) => {
    return News.findAll({ raw: true })
      .then(news => res.render('news', { news }))
      .catch(err => next(err))
  }
}