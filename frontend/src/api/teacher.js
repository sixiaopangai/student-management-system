import request from '@/utils/request'

// 获取我的教学班列表
export function getMyCourseClasses(params) {
  return request({
    url: '/teacher/my-course-classes',
    method: 'get',
    params
  })
}

// 获取教学班详情
export function getMyCourseClassDetail(classId) {
  return request({
    url: `/teacher/my-course-classes/${classId}`,
    method: 'get'
  })
}

// 获取教学班学生列表
export function getCourseClassStudents(classId, params) {
  return request({
    url: `/teacher/my-course-classes/${classId}/students`,
    method: 'get',
    params
  })
}

// 审核通过学生
export function approveStudent(classId, studentId) {
  return request({
    url: `/teacher/my-course-classes/${classId}/students/${studentId}/approve`,
    method: 'put'
  })
}

// 拒绝学生
export function rejectStudent(classId, studentId) {
  return request({
    url: `/teacher/my-course-classes/${classId}/students/${studentId}/reject`,
    method: 'put'
  })
}

// 移除学生
export function removeStudent(classId, studentId) {
  return request({
    url: `/teacher/my-course-classes/${classId}/students/${studentId}`,
    method: 'delete'
  })
}

// 批量审核通过
export function batchApproveStudents(classId, studentIds) {
  return request({
    url: `/teacher/my-course-classes/${classId}/students/batch-approve`,
    method: 'put',
    data: { studentIds }
  })
}

// 批量拒绝
export function batchRejectStudents(classId, studentIds) {
  return request({
    url: `/teacher/my-course-classes/${classId}/students/batch-reject`,
    method: 'put',
    data: { studentIds }
  })
}