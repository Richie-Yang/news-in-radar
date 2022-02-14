const express = require('express')
const router = express.Router()
const passport = require('passport')
const userController = require('../controllers/user-controller')
const newsController = require('../controllers/news-controller')
const admin = require('./modules/admin')
const newsAndComments = require('./modules/news-and-comments')
const { authenticatedAdmin } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')

router.use('/', newsController.genNewsList)

router.get('/login', userController.loginPage)
router.post('/login', passport.authenticate(
  'local', { failureRedirect: '/login' }
), userController.login)
router.get('/logout', userController.logout)
router.get('/register', userController.registerPage)
router.post('/register', userController.register)

router.use('/news', newsAndComments)
router.use('/admin', authenticatedAdmin, admin)

router.get('/', (req, res) => res.redirect('/news'))
router.use('/', generalErrorHandler)

module.exports = router