import request from '@/utils/request'

// 获取用户列表
export function getUserList(params) {
  return request.get('/users', { params })
}

// 获取用户详情
export function getUserById(id) {
  return request.get(`/users/${id}`)
}

// 创建用户
export function createUser(data) {
  return request.post('/users', data)
}

// 更新用户信息
export function updateUser(id, data) {
  return request.put(`/users/${id}`, data)
}

// 删除用户
export function deleteUser(id) {
  return request.delete(`/users/${id}`)
}

// 批量创建用户
export function batchCreateUsers(users) {
  return request.post('/users/batch', { users })
}

// 批量获取用户
export function batchGetUsers(ids) {
  return request.post('/users/batch-get', { ids })
}

// 批量删除用户
export function batchDeleteUsers(ids) {
  return request.delete('/users/batch', { data: { ids } })
}

// 更新个人信息
export function updateProfile(data) {
  return request.put('/users/profile', data)
}

// 获取统计数据
export function getStats() {
  return request.get('/users/stats')
}