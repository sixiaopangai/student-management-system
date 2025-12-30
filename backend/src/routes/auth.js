const express = require('express');
const { body } = require('express-validator');
const { AuthController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');
const { handleValidation } = require('../middlewares/validator');

const router = express.Router();

/**
 * 用户登录
 * POST /api/v1/auth/login
 */
router.post('/login', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空'),
  handleValidation
], AuthController.login);

/**
 * 用户注册
 * POST /api/v1/auth/register
 */
router.post('/register', [
  body('username')
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3, max: 20 }).withMessage('用户名长度为3-20个字符')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('用户名只能包含字母、数字和下划线'),
  body('password')
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6, max: 20 }).withMessage('密码长度为6-20个字符'),
  body('confirmPassword').notEmpty().withMessage('确认密码不能为空'),
  body('realName').notEmpty().withMessage('真实姓名不能为空'),
  body('email').optional().isEmail().withMessage('邮箱格式不正确'),
  handleValidation
], AuthController.register);

/**
 * 获取当前用户信息
 * GET /api/v1/auth/current-user
 */
router.get('/current-user', authenticate, AuthController.getCurrentUser);

/**
 * 修改密码
 * PUT /api/v1/auth/change-password
 */
router.put('/change-password', [
  authenticate,
  body('oldPassword').notEmpty().withMessage('原密码不能为空'),
  body('newPassword')
    .notEmpty().withMessage('新密码不能为空')
    .isLength({ min: 6, max: 20 }).withMessage('密码长度为6-20个字符'),
  body('confirmPassword').notEmpty().withMessage('确认密码不能为空'),
  handleValidation
], AuthController.changePassword);

/**
 * 忘记密码 - 发送验证码
 * POST /api/v1/auth/forgot-password
 */
router.post('/forgot-password', [
  body('email').notEmpty().withMessage('邮箱不能为空').isEmail().withMessage('邮箱格式不正确'),
  handleValidation
], AuthController.forgotPassword);

/**
 * 重置密码
 * POST /api/v1/auth/reset-password
 */
router.post('/reset-password', [
  body('email').notEmpty().withMessage('邮箱不能为空').isEmail().withMessage('邮箱格式不正确'),
  body('code').notEmpty().withMessage('验证码不能为空'),
  body('newPassword')
    .notEmpty().withMessage('新密码不能为空')
    .isLength({ min: 6, max: 20 }).withMessage('密码长度为6-20个字符'),
  body('confirmPassword').notEmpty().withMessage('确认密码不能为空'),
  handleValidation
], AuthController.resetPassword);

/**
 * 退出登录
 * POST /api/v1/auth/logout
 */
router.post('/logout', authenticate, AuthController.logout);

module.exports = router;