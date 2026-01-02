const express = require('express');
const { body, param } = require('express-validator');
const { UserController } = require('../controllers');
const { authenticate, authorize, Roles } = require('../middlewares/auth');
const { handleValidation, paginationHandler } = require('../middlewares/validator');

const router = express.Router();

// 所有路由都需要认证
router.use(authenticate);

/**
 * 获取统计数据
 * GET /api/v1/users/stats
 */
router.get('/stats', [
  authorize(Roles.ADMIN)
], UserController.getStats);

/**
 * 获取用户列表
 * GET /api/v1/users
 */
router.get('/', [
  authorize(Roles.ADMIN),
  paginationHandler
], UserController.getList);

/**
 * 批量获取用户
 * POST /api/v1/users/batch-get
 */
router.post('/batch-get', [
  authorize(Roles.ADMIN, Roles.COUNSELOR),
  body('ids').isArray().withMessage('ids必须是数组'),
  handleValidation
], UserController.batchGet);

/**
 * 批量创建用户
 * POST /api/v1/users/batch
 */
router.post('/batch', [
  authorize(Roles.ADMIN, Roles.COUNSELOR),
  body('users').isArray().withMessage('users必须是数组'),
  handleValidation
], UserController.batchCreate);

/**
 * 批量删除用户
 * DELETE /api/v1/users/batch
 */
router.delete('/batch', [
  authorize(Roles.ADMIN),
  body('ids').isArray().withMessage('ids必须是数组'),
  handleValidation
], UserController.batchDelete);

/**
 * 更新个人信息
 * PUT /api/v1/users/profile
 */
router.put('/profile', UserController.updateProfile);

/**
 * 获取用户详情
 * GET /api/v1/users/:id
 */
router.get('/:id', [
  authorize(Roles.ADMIN, Roles.COUNSELOR),
  param('id').isInt().withMessage('用户ID必须是整数'),
  handleValidation
], UserController.getById);

/**
 * 创建用户
 * POST /api/v1/users
 */
router.post('/', [
  authorize(Roles.ADMIN, Roles.COUNSELOR),
  body('username')
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3, max: 20 }).withMessage('用户名长度为3-20个字符'),
  body('password')
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6, max: 20 }).withMessage('密码长度为6-20个字符'),
  body('realName').notEmpty().withMessage('真实姓名不能为空'),
  body('role').optional().isIn(['student', 'teacher', 'counselor', 'admin']).withMessage('角色不正确'),
  body('email').optional().isEmail().withMessage('邮箱格式不正确'),
  handleValidation
], UserController.create);

/**
 * 更新用户信息
 * PUT /api/v1/users/:id
 */
router.put('/:id', [
  authorize(Roles.ADMIN, Roles.COUNSELOR),
  param('id').isInt().withMessage('用户ID必须是整数'),
  body('email').optional().isEmail().withMessage('邮箱格式不正确'),
  handleValidation
], UserController.update);

/**
 * 删除用户
 * DELETE /api/v1/users/:id
 */
router.delete('/:id', [
  authorize(Roles.ADMIN),
  param('id').isInt().withMessage('用户ID必须是整数'),
  handleValidation
], UserController.delete);

module.exports = router;