const TOKEN_KEY = 'sms_token'

// 获取 Token
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

// 设置 Token
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

// 移除 Token
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// 检查是否有 Token
export function hasToken() {
  return !!getToken()
}