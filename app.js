const express = require('express')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const app = express()
const PORT = process.env.PORT

app.get('/', (req, res) => res.send('<h1>Hello</h1>'))

app.listen(PORT, () => console.info(`Express server is listening at 127.0.0.1:${3000}`))
