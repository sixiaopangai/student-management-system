const { User } = require('../models');
const Response = require('../utils/response');
const { ErrorCodes } = require('../config/errorCodes');
const { Roles } = require('../middlewares/auth');

/**
 * 用户控制器
 */
class UserController {
  /**
   * 获取用户列表
   * GET /api/v1/users
   */
  static async getList(req, res, next) {
    try {
      const { page, pageSize } = req.pagination;
      const { role, keyword, status } = req.query;

      const result = await User.findAll({
        page,
        pageSize,
        role,
        keyword,
        status
      });

      return Response.paginate(res, result.list, result.total, page, pageSize);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户详情
   * GET /api/v1/users/:id
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

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
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };

      return Response.success(res, userInfo, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建用户
   * POST /api/v1/users
   */
  static async create(req, res, next) {
    try {
      const { username, password, realName, role, email, phone } = req.body;
      const currentUser = req.user;

      // 辅导员只能创建学生账号
      if (currentUser.role === Roles.COUNSELOR && role !== Roles.STUDENT) {
        return Response.error(res, ErrorCodes.ROLE_MISMATCH, '辅导员仅能创建学生账号');
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

      const user = await User.create({
        username,
        password,
        realName,
        role: role || Roles.STUDENT,
        email,
        phone
      });

      return Response.success(res, {
        id: user.id,
        username: user.username,
        realName: user.realName,
        role: user.role
      }, '创建成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 批量创建用户
   * POST /api/v1/users/batch
   */
  static async batchCreate(req, res, next) {
    try {
      const { users } = req.body;
      const currentUser = req.user;

      if (!users || !Array.isArray(users) || users.length === 0) {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '请提供用户数据');
      }

      if (users.length > 100) {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '单次最多创建100个用户');
      }

      // 辅导员只能创建学生账号
      if (currentUser.role === Roles.COUNSELOR) {
        const hasNonStudent = users.some(u => u.role && u.role !== Roles.STUDENT);
        if (hasNonStudent) {
          return Response.error(res, ErrorCodes.ROLE_MISMATCH, '辅导员仅能创建学生账号');
        }
        // 强制设置角色为学生
        users.forEach(u => u.role = Roles.STUDENT);
      }

      const result = await User.batchCreate(users);

      return Response.batch(res, result.success, result.failed, result.results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 批量获取用户
   * POST /api/v1/users/batch-get
   */
  static async batchGet(req, res, next) {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '请提供用户ID列表');
      }

      if (ids.length > 100) {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '单次最多查询100个用户');
      }

      const result = await User.batchGet(ids);

      // 格式化返回数据
      const list = result.list.map(user => ({
        id: user.id,
        username: user.username,
        realName: user.real_name,
        role: user.role,
        email: user.email,
        phone: user.phone,
        status: user.status
      }));

      return Response.success(res, {
        list,
        notFound: result.notFound
      }, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新用户信息
   * PUT /api/v1/users/:id
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { realName, email, phone, avatar, status } = req.body;
      const currentUser = req.user;

      const user = await User.findById(id);
      if (!user) {
        return Response.error(res, ErrorCodes.USER_NOT_FOUND);
      }

      // 辅导员只能修改学生信息
      if (currentUser.role === Roles.COUNSELOR && user.role !== Roles.STUDENT) {
        return Response.error(res, ErrorCodes.NO_PERMISSION, '辅导员只能修改学生信息');
      }

      // 检查邮箱是否被其他用户使用
      if (email && email !== user.email) {
        const existingEmail = await User.findByEmail(email);
        if (existingEmail && existingEmail.id !== parseInt(id)) {
          return Response.error(res, ErrorCodes.USER_ALREADY_EXISTS, '邮箱已被其他用户使用');
        }
      }

      const updateData = {};
      if (realName !== undefined) updateData.realName = realName;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (avatar !== undefined) updateData.avatar = avatar;
      // 只有管理员可以修改状态
      if (status !== undefined && currentUser.role === Roles.ADMIN) {
        updateData.status = status;
      }

      await User.update(id, updateData);

      return Response.success(res, null, '更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除用户
   * DELETE /api/v1/users/:id
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return Response.error(res, ErrorCodes.USER_NOT_FOUND);
      }

      // 不能删除自己
      if (user.id === req.user.id) {
        return Response.error(res, ErrorCodes.NO_PERMISSION, '不能删除自己的账号');
      }

      await User.delete(id);

      return Response.success(res, null, '删除成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 批量删除用户
   * DELETE /api/v1/users/batch
   */
  static async batchDelete(req, res, next) {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '请提供用户ID列表');
      }

      if (ids.length > 100) {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '单次最多删除100个用户');
      }

      // 不能删除自己
      if (ids.includes(req.user.id)) {
        return Response.error(res, ErrorCodes.NO_PERMISSION, '不能删除自己的账号');
      }

      const result = await User.batchDelete(ids);

      return Response.success(res, {
        success: result.success,
        failed: result.failed,
        failedIds: result.failedIds,
        failedReasons: result.failedReasons
      }, '批量删除完成');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新个人信息
   * PUT /api/v1/users/profile
   */
  static async updateProfile(req, res, next) {
    try {
      const { realName, email, phone, avatar } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return Response.error(res, ErrorCodes.USER_NOT_FOUND);
      }

      // 检查邮箱是否被其他用户使用
      if (email && email !== user.email) {
        const existingEmail = await User.findByEmail(email);
        if (existingEmail && existingEmail.id !== userId) {
          return Response.error(res, ErrorCodes.USER_ALREADY_EXISTS, '邮箱已被其他用户使用');
        }
      }

      const updateData = {};
      if (realName !== undefined) updateData.realName = realName;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (avatar !== undefined) updateData.avatar = avatar;

      await User.update(userId, updateData);

      return Response.success(res, null, '更新成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;