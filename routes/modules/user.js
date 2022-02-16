const express = require('express')
const router = express.Router()
const userController = require('../../controllers/user-controller')
const upload = require('../../middleware/multer')

router.post('/:followingId/followship', userController.postFollowship)
router.delete('/:followingId/followship', userController.deleteFollowship)
router.get('/:userId/edit', userController.editUser)
router.put('/:userId', upload.single('image'), userController.putUser)
router.get('/:userId', userController.getUser)

module.exports = router
