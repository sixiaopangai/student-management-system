import request from '@/utils/request'

// 获取我管理的专业班级列表
export function getMyMajorClasses(params) {
  return request({
    url: '/counselor/my-major-classes',
    method: 'get',
    params
  })
}

// 获取专业班级详情
export function getMyMajorClassDetail(classId) {
  return request({
    url: `/counselor/my-major-classes/${classId}`,
    method: 'get'
  })
}

// 获取专业班级学生列表
export function getMajorClassStudents(classId, params) {
  return request({
    url: `/counselor/my-major-classes/${classId}/students`,
    method: 'get',
    params
  })
}

// 获取我负责的所有学生列表
export function getMyStudents(params) {
  return request({
    url: '/counselor/my-students',
    method: 'get',
    params
  })
}

// 添加学生到专业班级
export function addStudentToClass(classId, studentId) {
  return request({
    url: `/counselor/my-major-classes/${classId}/students`,
    method: 'post',
    data: { studentId }
  })
}

// 批量添加学生到专业班级
export function batchAddStudentsToClass(classId, studentIds) {
  return request({
    url: `/counselor/my-major-classes/${classId}/students/batch`,
    method: 'post',
    data: { studentIds }
  })
}

// 从专业班级移除学生
export function removeStudentFromClass(classId, studentId) {
  return request({
    url: `/counselor/my-major-classes/${classId}/students/${studentId}`,
    method: 'delete'
  })
}

// 创建学生账号
export function createStudent(data) {
  return request({
    url: '/counselor/create-student',
    method: 'post',
    data
  })
}

// 批量创建学生账号
export function batchCreateStudents(data) {
  return request({
    url: '/counselor/batch-create-students',
    method: 'post',
    data
  })
}

// 更新学生信息
export function updateStudent(studentId, data) {
  return request({
    url: `/counselor/students/${studentId}`,
    method: 'put',
    data
  })
}

// 重置学生密码
export function resetStudentPassword(studentId) {
  return request({
    url: `/counselor/students/${studentId}/reset-password`,
    method: 'put'
  })
}