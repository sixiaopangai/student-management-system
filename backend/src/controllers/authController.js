const { User, PasswordReset } = require('../models');
const Response = require('../utils/response');
const JwtUtil = require('../utils/jwt');
const PasswordUtil = require('../utils/password');
const { ErrorCodes } = require('../config/errorCodes');

/**
 * 认证控制器
 */
class AuthController {
  /**
   * 用户登录
   * POST /api/v1/auth/login
   */
  static async login(req, res, next) {
    try {
      const { username, password, rememberMe = false } = req.body;

      // 查找用户
      const user = await User.findByUsername(username);
      if (!user) {
        return Response.error(res, ErrorCodes.USER_NOT_FOUND);
      }

      // 检查账号状态
      if (user.status !== 'active') {
        return Response.error(res, ErrorCodes.ACCOUNT_DISABLED);
      }

      // 验证密码
      const isValidPassword = await User.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return Response.error(res, ErrorCodes.PASSWORD_ERROR);
      }

      // 生成 Token
      const token = JwtUtil.generateToken({
        id: user.id,
        username: user.username,
        role: user.role
      }, rememberMe);

      // 返回用户信息（不包含密码）
      const userInfo = {
        id: user.id,
        username: user.username,
        realName: user.real_name,
        role: user.role,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar
      };

      return Response.success(res, { token, userInfo }, '登录成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 用户注册
   * POST /api/v1/auth/register
   */
  static async register(req, res, next) {
    try {
      const { username, password, confirmPassword, realName, email, phone } = req.body;

      // 验证密码确认
      if (password !== confirmPassword) {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '两次输入的密码不一致');
      }

      // 验证密码强度
      const passwordValidation = PasswordUtil.validateStrength(password);
      if (!passwordValidation.valid) {
        return Response.error(res, ErrorCodes.NEW_PASSWORD_INVALID, passwordValidation.message);
      }

      // 检查用户名是否存在
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return Response.error(res, ErrorCodes.USER_ALREADY_EXISTS);
      }

      // 检查邮箱是否存在
      if (email) {
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
          return Response.error(res, ErrorCodes.USER_ALREADY_EXISTS, '邮箱已被注册');
        }
      }

      // 创建用户（默认角色为学生）
      const user = await User.create({
        username,
        password,
        realName,
        role: 'student',
        email,
        phone
      });

      return Response.success(res, {
        id: user.id,
        username: user.username
      }, '注册成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取当前用户信息
   * GET /api/v1/auth/current-user
   */
  static async getCurrentUser(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return Response.error(res, ErrorCodes.USER_NOT_FOUND);
      }

      const userInfo = {
        id: user.id,
        username: user.username,
        realName: user.real_name,
        role: user.role,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
        createdAt: user.created_at
      };

      return Response.success(res, userInfo, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 修改密码
   * PUT /api/v1/auth/change-password
   */
  static async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;

      // 验证新密码确认
      if (newPassword !== confirmPassword) {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '两次输入的密码不一致');
      }

      // 验证新密码强度
      const passwordValidation = PasswordUtil.validateStrength(newPassword);
      if (!passwordValidation.valid) {
        return Response.error(res, ErrorCodes.NEW_PASSWORD_INVALID, passwordValidation.message);
      }

      // 获取用户信息（包含密码）
      const user = await User.findByUsername(req.user.username);
      if (!user) {
        return Response.error(res, ErrorCodes.USER_NOT_FOUND);
      }

      // 验证原密码
      const isValidPassword = await User.verifyPassword(oldPassword, user.password);
      if (!isValidPassword) {
        return Response.error(res, ErrorCodes.OLD_PASSWORD_ERROR);
      }

      // 更新密码
      await User.updatePassword(user.id, newPassword);

      return Response.success(res, null, '密码修改成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 忘记密码 - 发送验证码
   * POST /api/v1/auth/forgot-password
   */
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      // 查找用户
      const user = await User.findByEmail(email);
      if (!user) {
        return Response.error(res, ErrorCodes.USER_NOT_FOUND, '该邮箱未注册');
      }

      // 生成验证码
      const code = PasswordReset.generateCode();

      // 保存验证码记录
      await PasswordReset.create(user.id, email, code);

      // TODO: 发送邮件（这里只是模拟，实际需要配置邮件服务）
      console.log(`验证码已发送到 ${email}: ${code}`);

      return Response.success(res, null, '验证码已发送到您的邮箱');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 重置密码
   * POST /api/v1/auth/reset-password
   */
  static async resetPassword(req, res, next) {
    try {
      const { email, code, newPassword, confirmPassword } = req.body;

      // 验证新密码确认
      if (newPassword !== confirmPassword) {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '两次输入的密码不一致');
      }

      // 验证新密码强度
      const passwordValidation = PasswordUtil.validateStrength(newPassword);
      if (!passwordValidation.valid) {
        return Response.error(res, ErrorCodes.NEW_PASSWORD_INVALID, passwordValidation.message);
      }

      // 验证验证码
      const resetRecord = await PasswordReset.verify(email, code);
      if (!resetRecord) {
        return Response.error(res, ErrorCodes.VERIFY_CODE_ERROR);
      }

      // 更新密码
      await User.updatePassword(resetRecord.user_id, newPassword);

      // 标记验证码为已使用
      await PasswordReset.markAsUsed(resetRecord.id);

      return Response.success(res, null, '密码重置成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 退出登录
   * POST /api/v1/auth/logout
   */
  static async logout(req, res, next) {
    try {
      // JWT 是无状态的，客户端删除 Token 即可
      // 如果需要服务端失效，可以使用 Token 黑名单机制
      return Response.success(res, null, '退出成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;