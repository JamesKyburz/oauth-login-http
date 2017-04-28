const oauth2 = require('../').oauth2({
  resourceUri: 'https://api.github.com/user',
  callbackUri: 'http://localhost:3000/callback',
  scope: 'user'
})(
  'id',
  'secret',
  'https://github.com',
  '/login/oauth/authorize',
  '/login/oauth/access_token'
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
