import request from '@/utils/request'

// 用户登录
export function login(data) {
  return request.post('/auth/login', data)
}

// 用户注册
export function register(data) {
  return request.post('/auth/register', data)
}

// 获取当前用户信息
export function getCurrentUser() {
  return request.get('/auth/current-user')
}

// 修改密码
export function changePassword(data) {
  return request.put('/auth/change-password', data)
}

// 忘记密码 - 发送验证码
export function forgotPassword(data) {
  return request.post('/auth/forgot-password', data)
}

// 重置密码
export function resetPassword(data) {
  return request.post('/auth/reset-password', data)
}

// 退出登录
export function logout() {
  return request.post('/auth/logout')
}