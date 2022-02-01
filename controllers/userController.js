module.exports = {
  loginPage: (req, res) => {
    return res.render('login')
  },

  login: (req, res, next) => {
    const { email, password } = req.body
    console.log(email, password)
    return res.send('ok')
  },

  registerPage: (req, res) => {
    return res.render('register')
  },

  register: (req, res, next) => {
    const { 
      name, email, password, confirmPassword 
    } = req.body

    console.log(
      name, email, password, confirmPassword 
    )
    return res.redirect('/login')
  }
}