module.exports = {
  authenticated: (req, res, next) => {
    req.isAuthenticated() && req.user.isActive
      ? next()
      : res.redirect('/login')
  },

  authenticatedAdmin: (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.isAdmin) return next()
      return res.redirect('/')
    }
    return res.redirect('/login')
  }
}
