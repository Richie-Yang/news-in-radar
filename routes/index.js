const express = require('express')
const router = express.Router()
const passport = require('passport')
const userController = require('../controllers/userController')
const adminController = require('../controllers/adminController')
const newsController = require('../controllers/newsController')
const { authenticated, authenticatedAdmin } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')

router.use('/', newsController.genNewsList)

router.get('/admin/news', authenticatedAdmin, adminController.getNewsList)
router.get('/admin/news/:newsId/edit', authenticatedAdmin, adminController.editNews)
router.put('/admin/news/:newsId', authenticatedAdmin, adminController.putNews)
router.delete('/admin/news/:newsId', authenticatedAdmin, adminController.deleteNews)

router.get('/admin/users', authenticatedAdmin, adminController.getUsers)
router.patch('/admin/users/:userId', authenticatedAdmin, adminController.patchUser)
router.delete('/admin/users/:userId', authenticatedAdmin, adminController.deleteUser)

router.get('/login', userController.loginPage)
router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), userController.login)
router.get('/logout', userController.logout)

router.get('/register', userController.registerPage)
router.post('/register', userController.register)

router.get('/news/:newsId', newsController.getNews)
router.get('/news', newsController.getNewsList)

router.get('/', (req, res) => res.redirect('/news'))
router.use('/', generalErrorHandler)

module.exports = router