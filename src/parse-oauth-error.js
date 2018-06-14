module.exports = error => new Error(message(json(error)))

function json (error) {
  if (!error || !error.data) return {}
  if (typeof error.data === 'string') {
    try {
      error.data = JSON.parse(error.data)
    } catch (e) {}
  }
  return { data: error.data }
}

function message (error) {
  try {
    if (typeof error.data === 'string') return error.data
    if (error.data.error) {
      return error.data.error
    }
    if (error.data.errors) {
      if (Array.isArray(error.data.errors) && error.data.errors[0].message) {
        return error.data.errors[0].message
      }
    }
    return 'unspecified OAuthError.'
  } catch (e) {
    return 'unable to extract OAuthError.'
  }
}
