const oauth1 = require('../').oauth1({
  resourceUri: 'https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true&include_entities=false&include_email=true'
})(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  'id',
  'secret',
  '1.0',
  'http://localhost:3000/callback',
  'HMAC-SHA1'
)

const http = require('http')

http.createServer((q, r) => {
  console.log(q.url)
  if (q.url === '/') {
    oauth1.auth((err, token) => {
      if (err) return console.error(err, err.stack)
      r.writeHead(302, {
        location: 'https://twitter.com/oauth/authenticate?oauth_token=' + token
      })
      r.end()
    })
    return
  }

  if (q.url.match('/callback')) {
    oauth1.callback(q.url, (err, data) => {
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
