const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.get('/login', userController.loginPage)
router.post('/login', userController.login)
router.get('/', (req, res) => res.redirect('/login'))

module.exports = router