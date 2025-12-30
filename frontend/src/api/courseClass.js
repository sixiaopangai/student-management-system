import request from '@/utils/request'

// 获取课程班级列表
export function getCourseClassList(params) {
  return request.get('/course-classes', { params })
}

// 获取课程班级详情
export function getCourseClassById(id) {
  return request.get(`/course-classes/${id}`)
}

// 创建课程班级
export function createCourseClass(data) {
  return request.post('/course-classes', data)
}

// 更新课程班级
export function updateCourseClass(id, data) {
  return request.put(`/course-classes/${id}`, data)
}

// 删除课程班级
export function deleteCourseClass(id) {
  return request.delete(`/course-classes/${id}`)
}

// 批量删除课程班级
export function batchDeleteCourseClasses(ids) {
  return request.delete('/course-classes/batch', { data: { ids } })
}

// 获取课程班级学生列表
export function getCourseClassStudents(id, params) {
  return request.get(`/course-classes/${id}/students`, { params })
}

// 添加学生到课程班级
export function addStudentToCourseClass(id, studentId) {
  return request.post(`/course-classes/${id}/students`, { studentId })
}

// 批量添加学生到课程班级
export function batchAddStudentsToCourseClass(id, studentIds) {
  return request.post(`/course-classes/${id}/students/batch`, { studentIds })
}

// 从课程班级移除学生
export function removeStudentFromCourseClass(id, studentId) {
  return request.delete(`/course-classes/${id}/students/${studentId}`)
}

// 批量从课程班级移除学生
export function batchRemoveStudentsFromCourseClass(id, studentIds) {
  return request.delete(`/course-classes/${id}/students/batch`, { data: { studentIds } })
}