const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const { User } = require('../models')

passport.use(new LocalStrategy({
  usernameField: 'email', passReqToCallback: true
}, (req, email, password, done) => {
  return User.findOne({ where: { email } })
    .then(user => {
      if (!user) {
        req.flash('error_messages', '信箱或是密碼錯誤')
        return done(null, false)
      }
      
      return bcrypt.compare(password, user.password)
        .then(isMatched => {
          if (!isMatched) {
            req.flash('error_messages', '信箱或是密碼錯誤')
            return done(null, false)
          }
          return done(null, user)
        })
    })
    .catch(err => done(err, false))
}))

passport.serializeUser((user, done) => {
  return done(null, user.id)
})

passport.deserializeUser((id, done) => {
  return User.findByPk(id, { raw: true })
    .then(user => done(null, user))
    .catch(err => done(err, false))
})

