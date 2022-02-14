const express = require('express')
const router = express.Router()
const passport = require('passport')
const userController = require('../controllers/userController')
const adminController = require('../controllers/adminController')
const newsController = require('../controllers/newsController')
const commentController = require('../controllers/commentController')
const { authenticated, authenticatedAdmin } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')

router.use('/', newsController.genNewsList)

router.get('/admin/news', authenticatedAdmin, adminController.getNewsList)
router.get('/admin/news/:newsId/edit', authenticatedAdmin, adminController.editNews)
router.put('/admin/news/:newsId', authenticatedAdmin, adminController.putNews)
router.delete('/admin/news/:newsId', authenticatedAdmin, adminController.deleteNews)

router.get('/admin/categories/:categoryId/edit', authenticatedAdmin, adminController.getCategories)
router.put('/admin/categories/:categoryId', authenticatedAdmin, adminController.putCategory)
router.delete('/admin/categories/:categoryId', authenticatedAdmin, adminController.deleteCategory)
router.post('/admin/categories', authenticatedAdmin, adminController.postCategory)
router.get('/admin/categories', authenticatedAdmin, adminController.getCategories)

router.get('/admin/users', authenticatedAdmin, adminController.getUsers)
router.patch('/admin/users/:userId', authenticatedAdmin, adminController.patchUser)
router.delete('/admin/users/:userId', authenticatedAdmin, adminController.deleteUser)

router.get('/login', userController.loginPage)
router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), userController.login)
router.get('/logout', userController.logout)

router.get('/register', userController.registerPage)
router.post('/register', userController.register)

router.put('/news/:newsId/comments/:commentId', authenticated, commentController.putComment)
router.delete('/news/:newsId/comments/:commentId', authenticated, commentController.deleteComment)
router.post('/news/:newsId/comments/:commentId', authenticated, commentController.postComment)
router.post('/news/:newsId/comments', authenticated, commentController.postComment)

router.post('/comments/:commentId/likes', authenticated, commentController.postLike)
router.delete('/comments/:commentId/likes', authenticated, commentController.deleteLike)

router.post('/news/:newsId/likes', authenticated, newsController.postLike)
router.delete('/news/:newsId/likes', authenticated, newsController.deleteLike)

router.get('/news/:newsId', newsController.getNews)
router.get('/news', newsController.getNewsList)

router.get('/', (req, res) => res.redirect('/news'))
router.use('/', generalErrorHandler)

module.exports = router