const TOKEN_KEY = 'cinema_browser_token'
const NAME_KEY  = 'cinema_user_name'

/** Returns the browser token, creating one if it doesn't exist. */
export function getBrowserToken() {
  let token = localStorage.getItem(TOKEN_KEY)
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem(TOKEN_KEY, token)
  }
  return token
}

export function getUserName() {
  return localStorage.getItem(NAME_KEY) || ''
}

export function setUserName(name) {
  localStorage.setItem(NAME_KEY, name)
}

export function clearUserData() {
  localStorage.removeItem(NAME_KEY)
}
