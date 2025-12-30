const express = require('express');
const { body } = require('express-validator');
const { StudentController } = require('../controllers');
const { authenticate, authorize, Roles } = require('../middlewares/auth');
const { handleValidation } = require('../middlewares/validator');

const router = express.Router();

// 所有路由都需要认证且必须是学生角色
router.use(authenticate);
router.use(authorize(Roles.STUDENT));

/**
 * 获取我的专业班级
 * GET /api/v1/student/my-major-class
 */
router.get('/my-major-class', StudentController.getMyMajorClass);

/**
 * 获取我的课程班级列表
 * GET /api/v1/student/my-course-classes
 */
router.get('/my-course-classes', StudentController.getMyCourseClasses);

/**
 * 获取可加入的专业班级列表
 * GET /api/v1/student/available-major-classes
 */
router.get('/available-major-classes', StudentController.getAvailableMajorClasses);

/**
 * 获取可加入的课程班级列表
 * GET /api/v1/student/available-course-classes
 */
router.get('/available-course-classes', StudentController.getAvailableCourseClasses);

/**
 * 加入专业班级
 * POST /api/v1/student/join-major-class
 */
router.post('/join-major-class', [
  body('majorClassId').isInt().withMessage('专业班级ID必须是整数'),
  handleValidation
], StudentController.joinMajorClass);

/**
 * 退出专业班级
 * POST /api/v1/student/leave-major-class
 */
router.post('/leave-major-class', [
  body('majorClassId').isInt().withMessage('专业班级ID必须是整数'),
  handleValidation
], StudentController.leaveMajorClass);

/**
 * 加入课程班级
 * POST /api/v1/student/join-course-class
 */
router.post('/join-course-class', [
  body('courseClassId').isInt().withMessage('课程班级ID必须是整数'),
  handleValidation
], StudentController.joinCourseClass);

/**
 * 退出课程班级
 * POST /api/v1/student/leave-course-class
 */
router.post('/leave-course-class', [
  body('courseClassId').isInt().withMessage('课程班级ID必须是整数'),
  handleValidation
], StudentController.leaveCourseClass);

module.exports = router;