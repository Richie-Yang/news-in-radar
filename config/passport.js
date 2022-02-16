const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const { User, News, Comment } = require('../models')

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
  return User.findByPk(id, {
    include: [
      { model: News, as: 'LikedNewsForUsers' },
      { model: Comment, as: 'LikedCommentForUsers' },
      { model: User, as: 'Followings' }
    ],
    nest: true
  })
    .then(user => done(null, user.toJSON()))
    .catch(err => done(err, false))
})

module.exports = passport
