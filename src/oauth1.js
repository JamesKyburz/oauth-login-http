const { OAuth } = require('oauth')
const parseOAuthError = require('./parse-oauth-error')
const url = require('url')

module.exports = oauth1

function oauth1 (options = {}) {
  return wrap(options)
}

function wrap (options) {
  return function () {
    const oa = new OAuth(...arguments)

    return {
      auth: auth(oa),
      callback: callback(oa)
    }
  }

  function getRequestToken (oa, cb) {
    oa.getOAuthRequestToken({ scope: 'all' }, cb)
  }

  function auth (oa) {
    return cb => getRequestToken(oa, cb)
  }

  function callback (oa) {
    return (requestUri, cb) => {
      const oauthError = err => cb(parseOAuthError(err))
      const urlParts = url.parse(requestUri, true)
      getRequestToken(oa, (err, token, secret, result) => {
        if (err) return oauthError(err)
        oa.getOAuthAccessToken(
          urlParts.query.oauth_token,
          secret,
          urlParts.query.oauth_verifier,
          (err, token, secret, result) => {
            if (err) return oauthError(err)

            if (options.resourceUri) {
              oa.get(options.resourceUri, token, secret, (err, data) => {
                if (err) return oauthError(err)
                try {
                  cb(null, JSON.parse(data))
                } catch (err) {
                  oauthError(err)
                }
              })
            } else {
              cb(null, { token, secret })
            }
          }
        )
      })
    }
  }
}
