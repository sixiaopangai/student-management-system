import request from '@/utils/request'

// 获取我的专业班级
export function getMyMajorClass() {
  return request.get('/student/my-major-class')
}

// 获取我的课程班级列表
export function getMyCourseClasses() {
  return request.get('/student/my-course-classes')
}

// 获取可加入的专业班级列表
export function getAvailableMajorClasses() {
  return request.get('/student/available-major-classes')
}

// 获取可加入的课程班级列表
export function getAvailableCourseClasses() {
  return request.get('/student/available-course-classes')
}

// 加入专业班级
export function joinMajorClass(majorClassId) {
  return request.post('/student/join-major-class', { majorClassId })
}

// 退出专业班级
export function leaveMajorClass(majorClassId) {
  return request.post('/student/leave-major-class', { majorClassId })
}

// 加入课程班级
export function joinCourseClass(courseClassId) {
  return request.post('/student/join-course-class', { courseClassId })
}

// 退出课程班级
export function leaveCourseClass(courseClassId) {
  return request.post('/student/leave-course-class', { courseClassId })
}