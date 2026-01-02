const TOKEN_KEY = 'sms_token'
const REMEMBER_KEY = 'sms_remember'
const USERNAME_KEY = 'sms_username'
const PASSWORD_KEY = 'sms_password'

// 简单的加密/解密函数（用于密码存储，非安全加密，仅做混淆）
const encode = (str) => {
  return btoa(encodeURIComponent(str))
}

const decode = (str) => {
  try {
    return decodeURIComponent(atob(str))
  } catch {
    return ''
  }
}

// 获取 Token
export function getToken() {
  // 先从 localStorage 获取，再从 sessionStorage 获取
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

// 设置 Token
export function setToken(token, remember = false) {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token)
    sessionStorage.removeItem(TOKEN_KEY)
  } else {
    sessionStorage.setItem(TOKEN_KEY, token)
    localStorage.removeItem(TOKEN_KEY)
  }
}

// 移除 Token
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

// 检查是否有 Token
export function hasToken() {
  return !!getToken()
}

// 保存记住的用户凭证
export function saveRememberedCredentials(username, password) {
  localStorage.setItem(REMEMBER_KEY, 'true')
  localStorage.setItem(USERNAME_KEY, username)
  localStorage.setItem(PASSWORD_KEY, encode(password))
}

// 获取记住的用户凭证
export function getRememberedCredentials() {
  const remembered = localStorage.getItem(REMEMBER_KEY) === 'true'
  const username = localStorage.getItem(USERNAME_KEY) || ''
  const password = decode(localStorage.getItem(PASSWORD_KEY) || '')
  return { remembered, username, password }
}

// 清除记住的用户凭证
export function clearRememberedCredentials() {
  localStorage.removeItem(REMEMBER_KEY)
  localStorage.removeItem(USERNAME_KEY)
  localStorage.removeItem(PASSWORD_KEY)
}

// 兼容旧版本的函数名
export const saveRememberedUser = saveRememberedCredentials
export const getRememberedUser = () => {
  const { remembered, username } = getRememberedCredentials()
  return { remembered, username }
}
export const clearRememberedUser = clearRememberedCredentials