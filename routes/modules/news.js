const express = require('express')
const router = express.Router()
const newsController = require('../../controllers/news-controller')
const commentController = require('../../controllers/comment-controller')
const { authenticated } = require('../../middleware/auth')

router.put('/:newsId/comments/:commentId', authenticated, commentController.putComment)
router.delete('/:newsId/comments/:commentId', authenticated, commentController.deleteComment)
router.post('/:newsId/comments/:commentId', authenticated, commentController.postComment)
router.post('/:newsId/comments', authenticated, commentController.postComment)

router.post('/:newsId/likes', authenticated, newsController.postLike)
router.delete('/:newsId/likes', authenticated, newsController.deleteLike)

router.get('/:newsId', newsController.getNews)
router.get('/', newsController.getNewsList)

module.exports = router
