const express = require('express');
const { body, param } = require('express-validator');
const { CounselorController } = require('../controllers');
const { authenticate, authorize, Roles } = require('../middlewares/auth');
const { handleValidation, paginationHandler } = require('../middlewares/validator');

const router = express.Router();

// 所有路由都需要认证且必须是辅导员角色
router.use(authenticate);
router.use(authorize(Roles.COUNSELOR));

/**
 * 获取我负责的专业班级列表
 * GET /api/v1/counselor/my-major-classes
 */
router.get('/my-major-classes', CounselorController.getMyMajorClasses);

/**
 * 获取我负责的专业班级详情
 * GET /api/v1/counselor/my-major-classes/:id
 */
router.get('/my-major-classes/:id', [
  param('id').isInt().withMessage('班级ID必须是整数'),
  handleValidation
], CounselorController.getMyMajorClassDetail);

/**
 * 获取我负责的专业班级的学生列表
 * GET /api/v1/counselor/my-major-classes/:id/students
 */
router.get('/my-major-classes/:id/students', [
  param('id').isInt().withMessage('班级ID必须是整数'),
  handleValidation,
  paginationHandler
], CounselorController.getMyMajorClassStudents);

/**
 * 获取我负责的所有学生列表
 * GET /api/v1/counselor/my-students
 */
router.get('/my-students', paginationHandler, CounselorController.getMyStudents);

/**
 * 创建学生账号
 * POST /api/v1/counselor/create-student
 */
router.post('/create-student', [
  body('username')
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3, max: 20 }).withMessage('用户名长度为3-20个字符'),
  body('password')
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6, max: 20 }).withMessage('密码长度为6-20个字符'),
  body('realName').notEmpty().withMessage('真实姓名不能为空'),
  body('email').optional().isEmail().withMessage('邮箱格式不正确'),
  body('majorClassId').optional().isInt().withMessage('专业班级ID必须是整数'),
  handleValidation
], CounselorController.createStudent);

/**
 * 批量创建学生账号
 * POST /api/v1/counselor/batch-create-students
 */
router.post('/batch-create-students', [
  body('students').isArray().withMessage('students必须是数组'),
  body('majorClassId').optional().isInt().withMessage('专业班级ID必须是整数'),
  handleValidation
], CounselorController.batchCreateStudents);

module.exports = router;