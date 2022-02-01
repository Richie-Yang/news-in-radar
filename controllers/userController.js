module.exports = {
  loginPage: (req, res) => {
    return res.render('login')
  },
  login: (req, res, next) => {
    const { email, password } = req.body
    console.log(email, password)
    return res.send('ok')
  }
}