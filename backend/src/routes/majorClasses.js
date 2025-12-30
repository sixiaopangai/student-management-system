const express = require('express');
const { body, param } = require('express-validator');
const { MajorClassController } = require('../controllers');
const { authenticate, authorize, Roles } = require('../middlewares/auth');
const { handleValidation, paginationHandler } = require('../middlewares/validator');

const router = express.Router();

// 所有路由都需要认证
router.use(authenticate);

/**
 * 获取专业班级列表
 * GET /api/v1/major-classes
 */
router.get('/', paginationHandler, MajorClassController.getList);

/**
 * 批量删除专业班级
 * DELETE /api/v1/major-classes/batch
 */
router.delete('/batch', [
  authorize(Roles.ADMIN),
  body('ids').isArray().withMessage('ids必须是数组'),
  handleValidation
], MajorClassController.batchDelete);

/**
 * 获取专业班级详情
 * GET /api/v1/major-classes/:id
 */
router.get('/:id', [
  param('id').isInt().withMessage('班级ID必须是整数'),
  handleValidation
], MajorClassController.getById);

/**
 * 创建专业班级
 * POST /api/v1/major-classes
 */
router.post('/', [
  authorize(Roles.ADMIN),
  body('name').notEmpty().withMessage('班级名称不能为空'),
  body('code').notEmpty().withMessage('班级编码不能为空'),
  body('counselorId').optional().isInt().withMessage('辅导员ID必须是整数'),
  handleValidation
], MajorClassController.create);

/**
 * 更新专业班级
 * PUT /api/v1/major-classes/:id
 */
router.put('/:id', [
  authorize(Roles.ADMIN, Roles.COUNSELOR),
  param('id').isInt().withMessage('班级ID必须是整数'),
  handleValidation
], MajorClassController.update);

/**
 * 删除专业班级
 * DELETE /api/v1/major-classes/:id
 */
router.delete('/:id', [
  authorize(Roles.ADMIN),
  param('id').isInt().withMessage('班级ID必须是整数'),
  handleValidation
], MajorClassController.delete);

/**
 * 获取专业班级学生列表
 * GET /api/v1/major-classes/:id/students
 */
router.get('/:id/students', [
  authorize(Roles.ADMIN, Roles.COUNSELOR),
  param('id').isInt().withMessage('班级ID必须是整数'),
  handleValidation,
  paginationHandler
], MajorClassController.getStudents);

/**
 * 添加学生到专业班级
 * POST /api/v1/major-classes/:id/students
 */
router.post('/:id/students', [
  authorize(Roles.ADMIN, Roles.COUNSELOR),
  param('id').isInt().withMessage('班级ID必须是整数'),
  body('studentId').isInt().withMessage('学生ID必须是整数'),
  handleValidation
], MajorClassController.addStudent);

/**
 * 批量添加学生到专业班级
 * POST /api/v1/major-classes/:id/students/batch
 */
router.post('/:id/students/batch', [
  authorize(Roles.ADMIN, Roles.COUNSELOR),
  param('id').isInt().withMessage('班级ID必须是整数'),
  body('studentIds').isArray().withMessage('studentIds必须是数组'),
  handleValidation
], MajorClassController.batchAddStudents);

/**
 * 批量从专业班级移除学生
 * DELETE /api/v1/major-classes/:id/students/batch
 */
router.delete('/:id/students/batch', [
  authorize(Roles.ADMIN, Roles.COUNSELOR),
  param('id').isInt().withMessage('班级ID必须是整数'),
  body('studentIds').isArray().withMessage('studentIds必须是数组'),
  handleValidation
], MajorClassController.batchRemoveStudents);

/**
 * 从专业班级移除学生
 * DELETE /api/v1/major-classes/:id/students/:studentId
 */
router.delete('/:id/students/:studentId', [
  authorize(Roles.ADMIN, Roles.COUNSELOR),
  param('id').isInt().withMessage('班级ID必须是整数'),
  param('studentId').isInt().withMessage('学生ID必须是整数'),
  handleValidation
], MajorClassController.removeStudent);

module.exports = router;