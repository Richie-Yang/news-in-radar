const express = require('express')
const router = express.Router()
const commentController = require('../../controllers/comment-controller')

router.post('/:commentId/likes', commentController.postLike)
router.delete('/:commentId/likes', commentController.deleteLike)

module.exports = router
