import request from '@/utils/request'

// 获取教学班列表
export function getCourseClassList(params) {
  return request({
    url: '/course-classes',
    method: 'get',
    params
  })
}

// 获取教学班详情
export function getCourseClassById(id) {
  return request({
    url: `/course-classes/${id}`,
    method: 'get'
  })
}

// 创建教学班
export function createCourseClass(data) {
  return request({
    url: '/course-classes',
    method: 'post',
    data
  })
}

// 批量创建教学班
export function batchCreateCourseClasses(data) {
  return request({
    url: '/course-classes/batch',
    method: 'post',
    data
  })
}

// 更新教学班
export function updateCourseClass(id, data) {
  return request({
    url: `/course-classes/${id}`,
    method: 'put',
    data
  })
}

// 删除教学班
export function deleteCourseClass(id) {
  return request({
    url: `/course-classes/${id}`,
    method: 'delete'
  })
}

// 批量删除教学班
export function batchDeleteCourseClasses(ids) {
  return request({
    url: '/course-classes/batch',
    method: 'delete',
    data: { ids }
  })
}

// 获取教学班学生列表
export function getCourseClassStudents(classId, params) {
  return request({
    url: `/course-classes/${classId}/students`,
    method: 'get',
    params
  })
}

// 添加学生到教学班
export function addStudentToCourseClass(classId, studentId) {
  return request({
    url: `/course-classes/${classId}/students`,
    method: 'post',
    data: { studentId }
  })
}

// 批量添加学生到教学班
export function batchAddStudentsToCourseClass(classId, studentIds) {
  return request({
    url: `/course-classes/${classId}/students/batch`,
    method: 'post',
    data: { studentIds }
  })
}

// 从教学班移除学生
export function removeStudentFromCourseClass(classId, studentId) {
  return request({
    url: `/course-classes/${classId}/students/${studentId}`,
    method: 'delete'
  })
}

// 批量从教学班移除学生
export function batchRemoveStudentsFromCourseClass(classId, studentIds) {
  return request({
    url: `/course-classes/${classId}/students/batch`,
    method: 'delete',
    data: { studentIds }
  })
}

// 审核通过学生加入教学班
export function approveStudentInCourseClass(classId, studentId) {
  return request({
    url: `/course-classes/${classId}/students/${studentId}/approve`,
    method: 'put'
  })
}

// 拒绝学生加入教学班
export function rejectStudentInCourseClass(classId, studentId) {
  return request({
    url: `/course-classes/${classId}/students/${studentId}/reject`,
    method: 'put'
  })
}

// 学生加入教学班（申请）
export function joinCourseClass(classId) {
  return request({
    url: `/student/course-classes/${classId}/join`,
    method: 'post'
  })
}

// 学生退出教学班
export function leaveCourseClass(classId) {
  return request({
    url: `/student/course-classes/${classId}/leave`,
    method: 'post'
  })
}