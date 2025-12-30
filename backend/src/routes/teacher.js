const express = require('express');
const { param } = require('express-validator');
const { TeacherController } = require('../controllers');
const { authenticate, authorize, Roles } = require('../middlewares/auth');
const { handleValidation, paginationHandler } = require('../middlewares/validator');

const router = express.Router();

// 所有路由都需要认证且必须是教师角色
router.use(authenticate);
router.use(authorize(Roles.TEACHER));

/**
 * 获取我负责的课程班级列表
 * GET /api/v1/teacher/my-course-classes
 */
router.get('/my-course-classes', TeacherController.getMyCourseClasses);

/**
 * 获取我负责的课程班级详情
 * GET /api/v1/teacher/my-course-classes/:id
 */
router.get('/my-course-classes/:id', [
  param('id').isInt().withMessage('班级ID必须是整数'),
  handleValidation
], TeacherController.getMyCourseClassDetail);

/**
 * 获取我负责的课程班级的学生列表
 * GET /api/v1/teacher/my-course-classes/:id/students
 */
router.get('/my-course-classes/:id/students', [
  param('id').isInt().withMessage('班级ID必须是整数'),
  handleValidation,
  paginationHandler
], TeacherController.getMyCourseClassStudents);

module.exports = router;