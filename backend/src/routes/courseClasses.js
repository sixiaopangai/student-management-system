const express = require('express');
const { body, param } = require('express-validator');
const { CourseClassController } = require('../controllers');
const { authenticate, authorize, Roles } = require('../middlewares/auth');
const { handleValidation, paginationHandler } = require('../middlewares/validator');

const router = express.Router();

// 所有路由都需要认证
router.use(authenticate);

/**
 * 获取课程班级列表
 * GET /api/v1/course-classes
 */
router.get('/', paginationHandler, CourseClassController.getList);

/**
 * 批量删除课程班级
 * DELETE /api/v1/course-classes/batch
 */
router.delete('/batch', [
  authorize(Roles.ADMIN),
  body('ids').isArray().withMessage('ids必须是数组'),
  handleValidation
], CourseClassController.batchDelete);

/**
 * 获取课程班级详情
 * GET /api/v1/course-classes/:id
 */
router.get('/:id', [
  param('id').isInt().withMessage('班级ID必须是整数'),
  handleValidation
], CourseClassController.getById);

/**
 * 创建课程班级
 * POST /api/v1/course-classes
 */
router.post('/', [
  authorize(Roles.ADMIN),
  body('name').notEmpty().withMessage('课程名称不能为空'),
  body('code').notEmpty().withMessage('课程编码不能为空'),
  body('teacherId').isInt().withMessage('教师ID必须是整数'),
  body('maxStudents').optional().isInt({ min: 1 }).withMessage('最大学生数必须是正整数'),
  handleValidation
], CourseClassController.create);

/**
 * 更新课程班级
 * PUT /api/v1/course-classes/:id
 */
router.put('/:id', [
  authorize(Roles.ADMIN, Roles.TEACHER),
  param('id').isInt().withMessage('班级ID必须是整数'),
  body('maxStudents').optional().isInt({ min: 1 }).withMessage('最大学生数必须是正整数'),
  handleValidation
], CourseClassController.update);

/**
 * 删除课程班级
 * DELETE /api/v1/course-classes/:id
 */
router.delete('/:id', [
  authorize(Roles.ADMIN),
  param('id').isInt().withMessage('班级ID必须是整数'),
  handleValidation
], CourseClassController.delete);

/**
 * 获取课程班级学生列表
 * GET /api/v1/course-classes/:id/students
 */
router.get('/:id/students', [
  authorize(Roles.ADMIN, Roles.TEACHER),
  param('id').isInt().withMessage('班级ID必须是整数'),
  handleValidation,
  paginationHandler
], CourseClassController.getStudents);

/**
 * 添加学生到课程班级
 * POST /api/v1/course-classes/:id/students
 */
router.post('/:id/students', [
  authorize(Roles.ADMIN, Roles.TEACHER),
  param('id').isInt().withMessage('班级ID必须是整数'),
  body('studentId').isInt().withMessage('学生ID必须是整数'),
  handleValidation
], CourseClassController.addStudent);

/**
 * 批量添加学生到课程班级
 * POST /api/v1/course-classes/:id/students/batch
 */
router.post('/:id/students/batch', [
  authorize(Roles.ADMIN, Roles.TEACHER),
  param('id').isInt().withMessage('班级ID必须是整数'),
  body('studentIds').isArray().withMessage('studentIds必须是数组'),
  handleValidation
], CourseClassController.batchAddStudents);

/**
 * 批量从课程班级移除学生
 * DELETE /api/v1/course-classes/:id/students/batch
 */
router.delete('/:id/students/batch', [
  authorize(Roles.ADMIN, Roles.TEACHER),
  param('id').isInt().withMessage('班级ID必须是整数'),
  body('studentIds').isArray().withMessage('studentIds必须是数组'),
  handleValidation
], CourseClassController.batchRemoveStudents);

/**
 * 从课程班级移除学生
 * DELETE /api/v1/course-classes/:id/students/:studentId
 */
router.delete('/:id/students/:studentId', [
  authorize(Roles.ADMIN, Roles.TEACHER),
  param('id').isInt().withMessage('班级ID必须是整数'),
  param('studentId').isInt().withMessage('学生ID必须是整数'),
  handleValidation
], CourseClassController.removeStudent);

module.exports = router;