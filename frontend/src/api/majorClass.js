import request from '@/utils/request'

// 获取专业班级列表
export function getMajorClassList(params) {
  return request.get('/major-classes', { params })
}

// 获取专业班级详情
export function getMajorClassById(id) {
  return request.get(`/major-classes/${id}`)
}

// 创建专业班级
export function createMajorClass(data) {
  return request.post('/major-classes', data)
}

// 更新专业班级
export function updateMajorClass(id, data) {
  return request.put(`/major-classes/${id}`, data)
}

// 删除专业班级
export function deleteMajorClass(id) {
  return request.delete(`/major-classes/${id}`)
}

// 批量删除专业班级
export function batchDeleteMajorClasses(ids) {
  return request.delete('/major-classes/batch', { data: { ids } })
}

// 获取专业班级学生列表
export function getMajorClassStudents(id, params) {
  return request.get(`/major-classes/${id}/students`, { params })
}

// 添加学生到专业班级
export function addStudentToMajorClass(id, studentId) {
  return request.post(`/major-classes/${id}/students`, { studentId })
}

// 批量添加学生到专业班级
export function batchAddStudentsToMajorClass(id, studentIds) {
  return request.post(`/major-classes/${id}/students/batch`, { studentIds })
}

// 从专业班级移除学生
export function removeStudentFromMajorClass(id, studentId) {
  return request.delete(`/major-classes/${id}/students/${studentId}`)
}

// 批量从专业班级移除学生
export function batchRemoveStudentsFromMajorClass(id, studentIds) {
  return request.delete(`/major-classes/${id}/students/batch`, { data: { studentIds } })
}