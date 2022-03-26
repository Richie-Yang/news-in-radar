module.exports = {
  authenticated: (req, res, next) => {
    return req.isAuthenticated()
      ? next()
      : res.redirect('/login')
  },

  authenticatedAdmin: (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.isAdmin) return next()
      return res.redirect('/')
    }
    return res.redirect('/login')
  },

  activated: (req, res, next) => {
    return req.user.isActive
      ? next()
      : res.redirect('/verify')
  }
}
