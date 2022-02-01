const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.get('/login', userController.loginPage)
router.post('/login', userController.login)
router.get('/register', userController.registerPage)
router.post('/register', userController.register)

router.get('/', (req, res) => res.redirect('/login'))

module.exports = router