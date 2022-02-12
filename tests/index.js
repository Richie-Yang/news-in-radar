const request = require('supertest')
const app = require('../app')

describe('# 測試環境初始化', function() {
  context('# First Test Case', () => {
    it(' GET root path ', (done) => {
      request(app)
        .get('/')
        .end(function (err, res) {
          done()
        })
    })
  })
})

describe('# 登入測試: POST /login', function() {
  it('# 帳號錯誤', function (done) {
    request(app)
      .post('/login')
      .type('urlencoded')
      .send('email=wrong-email@example.com&password=123')
      .expect('Location', '/login')
      .expect(302, done)
  })

  it('# 密碼錯誤', function (done) {
    request(app)
      .post('/login')
      .type('urlencoded')
      .send('email=root@example.com&password=1234')
      .expect('Location', '/login')
      .expect(302, done)
  })

  it('# root 帳號密碼正確', function (done) {
    request(app)
      .post('/login')
      .type('urlencoded')
      .send('email=root@example.com&password=123')
      .expect('Location', '/admin/news')
      .expect(302, done)
  })

  it('# user1 帳號密碼正確', function (done) {
    request(app)
      .post('/login')
      .type('urlencoded')
      .send('email=user1@example.com&password=123')
      .expect('Location', '/news')
      .expect(302, done)
  })
})
