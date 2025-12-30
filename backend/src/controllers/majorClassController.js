const { MajorClass, User } = require('../models');
const Response = require('../utils/response');
const { ErrorCodes } = require('../config/errorCodes');
const { Roles } = require('../middlewares/auth');

/**
 * 专业班级控制器
 */
class MajorClassController {
  /**
   * 获取专业班级列表
   * GET /api/v1/major-classes
   */
  static async getList(req, res, next) {
    try {
      const { page, pageSize } = req.pagination;
      const { keyword, status, counselorId } = req.query;

      const result = await MajorClass.findAll({
        page,
        pageSize,
        keyword,
        status,
        counselorId
      });

      // 格式化返回数据
      const list = result.list.map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        counselorId: item.counselor_id,
        counselorName: item.counselor_name,
        description: item.description,
        status: item.status,
        studentCount: item.student_count,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      return Response.paginate(res, list, result.total, page, pageSize);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取专业班级详情
   * GET /api/v1/major-classes/:id
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const majorClass = await MajorClass.findById(id);

      if (!majorClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      const data = {
        id: majorClass.id,
        name: majorClass.name,
        code: majorClass.code,
        counselorId: majorClass.counselor_id,
        counselorName: majorClass.counselor_name,
        description: majorClass.description,
        status: majorClass.status,
        createdAt: majorClass.created_at,
        updatedAt: majorClass.updated_at
      };

      return Response.success(res, data, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建专业班级
   * POST /api/v1/major-classes
   */
  static async create(req, res, next) {
    try {
      const { name, code, counselorId, description } = req.body;

      // 检查编码是否存在
      const existingClass = await MajorClass.findByCode(code);
      if (existingClass) {
        return Response.error(res, ErrorCodes.CLASS_NAME_EXISTS, '班级编码已存在');
      }

      // 验证辅导员是否存在且角色正确
      if (counselorId) {
        const counselor = await User.findById(counselorId);
        if (!counselor) {
          return Response.error(res, ErrorCodes.USER_NOT_FOUND, '辅导员不存在');
        }
        if (counselor.role !== Roles.COUNSELOR) {
          return Response.error(res, ErrorCodes.ROLE_MISMATCH, '指定用户不是辅导员');
        }
      }

      const majorClass = await MajorClass.create({
        name,
        code,
        counselorId,
        description
      });

      return Response.success(res, majorClass, '创建成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新专业班级
   * PUT /api/v1/major-classes/:id
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, code, counselorId, description, status } = req.body;
      const currentUser = req.user;

      const majorClass = await MajorClass.findById(id);
      if (!majorClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 辅导员只能修改自己负责的班级
      if (currentUser.role === Roles.COUNSELOR && majorClass.counselor_id !== currentUser.id) {
        return Response.error(res, ErrorCodes.NO_PERMISSION, '只能修改自己负责的班级');
      }

      // 检查编码是否被其他班级使用
      if (code && code !== majorClass.code) {
        const existingClass = await MajorClass.findByCode(code);
        if (existingClass && existingClass.id !== parseInt(id)) {
          return Response.error(res, ErrorCodes.CLASS_NAME_EXISTS, '班级编码已被使用');
        }
      }

      // 验证辅导员（只有管理员可以修改辅导员）
      if (counselorId !== undefined && currentUser.role === Roles.ADMIN) {
        if (counselorId) {
          const counselor = await User.findById(counselorId);
          if (!counselor) {
            return Response.error(res, ErrorCodes.USER_NOT_FOUND, '辅导员不存在');
          }
          if (counselor.role !== Roles.COUNSELOR) {
            return Response.error(res, ErrorCodes.ROLE_MISMATCH, '指定用户不是辅导员');
          }
        }
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (code !== undefined) updateData.code = code;
      if (description !== undefined) updateData.description = description;
      // 只有管理员可以修改辅导员和状态
      if (currentUser.role === Roles.ADMIN) {
        if (counselorId !== undefined) updateData.counselorId = counselorId;
        if (status !== undefined) updateData.status = status;
      }

      await MajorClass.update(id, updateData);

      return Response.success(res, null, '更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除专业班级
   * DELETE /api/v1/major-classes/:id
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const majorClass = await MajorClass.findById(id);
      if (!majorClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      await MajorClass.delete(id);

      return Response.success(res, null, '删除成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 批量删除专业班级
   * DELETE /api/v1/major-classes/batch
   */
  static async batchDelete(req, res, next) {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '请提供班级ID列表');
      }

      if (ids.length > 50) {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '单次最多删除50个班级');
      }

      const result = await MajorClass.batchDelete(ids);

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
   * 获取专业班级学生列表
   * GET /api/v1/major-classes/:id/students
   */
  static async getStudents(req, res, next) {
    try {
      const { id } = req.params;
      const { page, pageSize } = req.pagination;
      const { status, keyword } = req.query;
      const currentUser = req.user;

      const majorClass = await MajorClass.findById(id);
      if (!majorClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 辅导员只能查看自己负责的班级
      if (currentUser.role === Roles.COUNSELOR && majorClass.counselor_id !== currentUser.id) {
        return Response.error(res, ErrorCodes.NO_PERMISSION, '只能查看自己负责的班级');
      }

      const result = await MajorClass.getStudents(id, {
        page,
        pageSize,
        status,
        keyword
      });

      // 格式化返回数据
      const list = result.list.map(item => ({
        id: item.id,
        username: item.username,
        realName: item.real_name,
        email: item.email,
        phone: item.phone,
        userStatus: item.user_status,
        status: item.status,
        joinedAt: item.joined_at,
        approvedAt: item.approved_at
      }));

      return Response.paginate(res, list, result.total, page, pageSize);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加学生到专业班级
   * POST /api/v1/major-classes/:id/students
   */
  static async addStudent(req, res, next) {
    try {
      const { id } = req.params;
      const { studentId } = req.body;
      const currentUser = req.user;

      const majorClass = await MajorClass.findById(id);
      if (!majorClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 辅导员只能操作自己负责的班级
      if (currentUser.role === Roles.COUNSELOR && majorClass.counselor_id !== currentUser.id) {
        return Response.error(res, ErrorCodes.NO_PERMISSION, '只能操作自己负责的班级');
      }

      // 验证学生是否存在
      const student = await User.findById(studentId);
      if (!student) {
        return Response.error(res, ErrorCodes.USER_NOT_FOUND, '学生不存在');
      }
      if (student.role !== Roles.STUDENT) {
        return Response.error(res, ErrorCodes.ROLE_MISMATCH, '指定用户不是学生');
      }

      // 检查学生是否已在班级中
      const existing = await MajorClass.getStudentRelation(id, studentId);
      if (existing && existing.status === 'approved') {
        return Response.error(res, ErrorCodes.STUDENT_ALREADY_IN_CLASS);
      }

      await MajorClass.addStudent(id, studentId);

      return Response.success(res, null, '添加成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 批量添加学生到专业班级
   * POST /api/v1/major-classes/:id/students/batch
   */
  static async batchAddStudents(req, res, next) {
    try {
      const { id } = req.params;
      const { studentIds } = req.body;
      const currentUser = req.user;

      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '请提供学生ID列表');
      }

      if (studentIds.length > 100) {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '单次最多添加100个学生');
      }

      const majorClass = await MajorClass.findById(id);
      if (!majorClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 辅导员只能操作自己负责的班级
      if (currentUser.role === Roles.COUNSELOR && majorClass.counselor_id !== currentUser.id) {
        return Response.error(res, ErrorCodes.NO_PERMISSION, '只能操作自己负责的班级');
      }

      const result = await MajorClass.batchAddStudents(id, studentIds);

      return Response.batch(res, result.success, result.failed, result.results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 从专业班级移除学生
   * DELETE /api/v1/major-classes/:id/students/:studentId
   */
  static async removeStudent(req, res, next) {
    try {
      const { id, studentId } = req.params;
      const currentUser = req.user;

      const majorClass = await MajorClass.findById(id);
      if (!majorClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 辅导员只能操作自己负责的班级
      if (currentUser.role === Roles.COUNSELOR && majorClass.counselor_id !== currentUser.id) {
        return Response.error(res, ErrorCodes.NO_PERMISSION, '只能操作自己负责的班级');
      }

      // 检查学生是否在班级中
      const existing = await MajorClass.getStudentRelation(id, studentId);
      if (!existing || existing.status !== 'approved') {
        return Response.error(res, ErrorCodes.STUDENT_NOT_IN_CLASS);
      }

      await MajorClass.removeStudent(id, studentId);

      return Response.success(res, null, '移除成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 批量从专业班级移除学生
   * DELETE /api/v1/major-classes/:id/students/batch
   */
  static async batchRemoveStudents(req, res, next) {
    try {
      const { id } = req.params;
      const { studentIds } = req.body;
      const currentUser = req.user;

      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '请提供学生ID列表');
      }

      if (studentIds.length > 100) {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '单次最多移除100个学生');
      }

      const majorClass = await MajorClass.findById(id);
      if (!majorClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 辅导员只能操作自己负责的班级
      if (currentUser.role === Roles.COUNSELOR && majorClass.counselor_id !== currentUser.id) {
        return Response.error(res, ErrorCodes.NO_PERMISSION, '只能操作自己负责的班级');
      }

      const result = await MajorClass.batchRemoveStudents(id, studentIds);

      return Response.batch(res, result.success, result.failed, result.results);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MajorClassController;