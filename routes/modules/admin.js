const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/admin-controller')

router.get('/news', adminController.getNewsList)
router.get('/news/:newsId/edit', adminController.editNews)
router.put('/news/:newsId', adminController.putNews)
router.delete('/news/:newsId', adminController.deleteNews)

router.get('/categories/:categoryId/edit', adminController.getCategories)
router.put('/categories/:categoryId', adminController.putCategory)
router.delete('/categories/:categoryId', adminController.deleteCategory)
router.post('/categories', adminController.postCategory)
router.get('/categories', adminController.getCategories)

router.get('/users', adminController.getUsers)
router.patch('/users/:userId', adminController.patchUser)
router.delete('/users/:userId', adminController.deleteUser)

module.exports = router
