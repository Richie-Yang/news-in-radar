const express = require('express')
const router = express.Router()
const passport = require('passport')
const userController = require('../controllers/userController')
const adminController = require('../controllers/adminController')
const { authenticated, authenticatedAdmin } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')

router.get('/login', userController.loginPage)
router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), userController.login)

router.get('/register', userController.registerPage)
router.post('/register', userController.register)

router.get('/admin/news', adminController.getNewsList)
router.get('/admin/news/:newsId/edit', adminController.editNews)
router.put('/admin/news/:newsId', adminController.putNews)
router.delete('/admin/news/:newsId', adminController.deleteNews)

router.get('/admin/users', adminController.getUsers)
router.patch('/admin/users/:userId', adminController.patchUser)
router.delete('/admin/users/:userId', adminController.deleteUser)

router.get('/', (req, res) => res.redirect('/login'))
router.use('/', generalErrorHandler)

module.exports = router