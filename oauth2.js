const { OAuth2 } = require('oauth')
const OAuthError = require('node-oauth-error')
const url = require('url')

module.exports = oauth2

function oauth2 (options = {}) {
  if (!options.resourceUri) throw new Error('missing options.resourceUri')
  if (!options.callbackUri) throw new Error('missing options.callbackUri')
  options.scope = options.scope || ''
  options.responseType = options.responseType || 'code'
  options.grantType = options.grantType || 'authorization_code'
  return wrap(options)
}

function wrap (options) {
  return function () {
    const oa = new OAuth2(...arguments)

    return { auth: auth(oa), callback: callback(oa) }
  }

  function auth (oa) {
    return (cb) => {
      const oauthError = (err) => cb(new OAuthError(err))
      try {
        const authUrl = oa.getAuthorizeUrl({
          redirect_uri: options.callbackUri,
          scope: options.scope,
          response_type: options.responseType
        })
        cb(null, authUrl)
      } catch (err) {
        oauthError(err)
      }
    }
  }

  function callback (oa) {
    return (requestUri, cb) => {
      const urlParts = url.parse(requestUri, true)
      const oauthError = (err) => cb(new OAuthError(err))
      oa.getOAuthAccessToken(urlParts.query.code, { redirect_uri: options.callbackUri, grant_type: options.grantType },
        (err, token) => {
          if (err) return oauthError(err)
          oa.getProtectedResource(
            options.resourceUri,
            token,
            (err, data) => {
              if (err) return oauthError(err)
              try {
                cb(null, JSON.parse(data))
              } catch (err) {
                oauthError(err)
              }
            }
          )
        }
      )
    }
  }
}
