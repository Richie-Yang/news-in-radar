const express = require('express')
const router = express.Router()
const passport = require('passport')
const userController = require('../controllers/userController')
const { authenticated, authenticatedAdmin } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')

router.get('/login', userController.loginPage)
router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), userController.login)

router.get('/register', userController.registerPage)
router.post('/register', userController.register)

router.get('/', (req, res) => res.redirect('/login'))
router.use('/', generalErrorHandler)

module.exports = router