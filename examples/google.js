const oauth2 = require('../').oauth2({
  resourceUri: 'https://www.googleapis.com/oauth2/v3/userinfo?grant_type=profile',
  callbackUri: 'http://localhost:3000/callback',
  scope: 'profile email'
})(
  'id',
  'secret',
  'https://accounts.google.com',
  '/o/oauth2/v2/auth',
  '/o/oauth2/token'
)

const http = require('http')

http.createServer((q, r) => {
  console.log(q.url)
  if (q.url === '/') {
    oauth2.auth((err, authUrl) => {
      if (err) return console.error(err, err.stack)
      r.writeHead(302, {
        location: authUrl
      })
      r.end()
    })
    return
  }

  if (q.url.match('/callback')) {
    oauth2.callback(q.url, (err, data) => {
      if (err) {
        console.log('401!!!!!!')
        r.writeHead(401, err)
        r.end()
        return
      }
      console.log(data)
      r.end()
    })
    return
  }

  r.end()
})
.listen(3000)
