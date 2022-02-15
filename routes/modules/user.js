const express = require('express')
const router = express.Router()
const userController = require('../../controllers/user-controller')
const upload = require('../../middleware/multer')

router.get('/:userId/edit', userController.editUser)
router.put('/:userId', upload.single('image'), userController.putUser)
router.get('/:userId', userController.getUser)

module.exports = router
