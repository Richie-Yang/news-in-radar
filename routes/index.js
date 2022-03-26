const express = require('express')
const router = express.Router()
const passport = require('passport')
const userController = require('../controllers/user-controller')
const newsController = require('../controllers/news-controller')
const admin = require('./modules/admin')
const user = require('./modules/user')
const news = require('./modules/news')
const comment = require('./modules/comment')
const { authenticated, authenticatedAdmin, activated } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')

router.use('/', newsController.genNewsList)

router.get('/login', userController.loginPage)
router.post('/login', passport.authenticate(
  'local', { failureRedirect: '/login' }
), activated, userController.login)
router.get('/logout', userController.logout)
router.get('/register', userController.registerPage)
router.post('/register', userController.register)

router.use('/news', news)
router.use('/comments', authenticated, comment)
router.use('/users', authenticated, user)
router.use('/admin', authenticatedAdmin, admin)

router.get('/', (req, res) => res.redirect('/news'))
router.use('/', generalErrorHandler)

module.exports = router
