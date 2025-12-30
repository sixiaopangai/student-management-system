const { CourseClass, User } = require('../models');
const Response = require('../utils/response');
const { ErrorCodes } = require('../config/errorCodes');
const { Roles } = require('../middlewares/auth');

/**
 * 课程班级控制器
 */
class CourseClassController {
  /**
   * 获取课程班级列表
   * GET /api/v1/course-classes
   */
  static async getList(req, res, next) {
    try {
      const { page, pageSize } = req.pagination;
      const { keyword, status, teacherId } = req.query;

      const result = await CourseClass.findAll({
        page,
        pageSize,
        keyword,
        status,
        teacherId
      });

      // 格式化返回数据
      const list = result.list.map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        teacherId: item.teacher_id,
        teacherName: item.teacher_name,
        description: item.description,
        maxStudents: item.max_students,
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
   * 获取课程班级详情
   * GET /api/v1/course-classes/:id
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const courseClass = await CourseClass.findById(id);

      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      const data = {
        id: courseClass.id,
        name: courseClass.name,
        code: courseClass.code,
        teacherId: courseClass.teacher_id,
        teacherName: courseClass.teacher_name,
        description: courseClass.description,
        maxStudents: courseClass.max_students,
        status: courseClass.status,
        createdAt: courseClass.created_at,
        updatedAt: courseClass.updated_at
      };

      return Response.success(res, data, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建课程班级
   * POST /api/v1/course-classes
   */
  static async create(req, res, next) {
    try {
      const { name, code, teacherId, description, maxStudents } = req.body;

      // 检查编码是否存在
      const existingClass = await CourseClass.findByCode(code);
      if (existingClass) {
        return Response.error(res, ErrorCodes.CLASS_NAME_EXISTS, '课程编码已存在');
      }

      // 验证教师是否存在且角色正确
      const teacher = await User.findById(teacherId);
      if (!teacher) {
        return Response.error(res, ErrorCodes.USER_NOT_FOUND, '教师不存在');
      }
      if (teacher.role !== Roles.TEACHER) {
        return Response.error(res, ErrorCodes.ROLE_MISMATCH, '指定用户不是教师');
      }

      const courseClass = await CourseClass.create({
        name,
        code,
        teacherId,
        description,
        maxStudents
      });

      return Response.success(res, courseClass, '创建成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新课程班级
   * PUT /api/v1/course-classes/:id
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, code, teacherId, description, maxStudents, status } = req.body;
      const currentUser = req.user;

      const courseClass = await CourseClass.findById(id);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 教师只能修改自己负责的班级
      if (currentUser.role === Roles.TEACHER && courseClass.teacher_id !== currentUser.id) {
        return Response.error(res, ErrorCodes.NO_PERMISSION, '只能修改自己负责的班级');
      }

      // 检查编码是否被其他班级使用
      if (code && code !== courseClass.code) {
        const existingClass = await CourseClass.findByCode(code);
        if (existingClass && existingClass.id !== parseInt(id)) {
          return Response.error(res, ErrorCodes.CLASS_NAME_EXISTS, '课程编码已被使用');
        }
      }

      // 验证教师（只有管理员可以修改教师）
      if (teacherId !== undefined && currentUser.role === Roles.ADMIN) {
        const teacher = await User.findById(teacherId);
        if (!teacher) {
          return Response.error(res, ErrorCodes.USER_NOT_FOUND, '教师不存在');
        }
        if (teacher.role !== Roles.TEACHER) {
          return Response.error(res, ErrorCodes.ROLE_MISMATCH, '指定用户不是教师');
        }
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (code !== undefined) updateData.code = code;
      if (description !== undefined) updateData.description = description;
      if (maxStudents !== undefined) updateData.maxStudents = maxStudents;
      // 只有管理员可以修改教师和状态
      if (currentUser.role === Roles.ADMIN) {
        if (teacherId !== undefined) updateData.teacherId = teacherId;
        if (status !== undefined) updateData.status = status;
      }

      await CourseClass.update(id, updateData);

      return Response.success(res, null, '更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除课程班级
   * DELETE /api/v1/course-classes/:id
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const courseClass = await CourseClass.findById(id);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      await CourseClass.delete(id);

      return Response.success(res, null, '删除成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 批量删除课程班级
   * DELETE /api/v1/course-classes/batch
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

      const result = await CourseClass.batchDelete(ids);

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
   * 获取课程班级学生列表
   * GET /api/v1/course-classes/:id/students
   */
  static async getStudents(req, res, next) {
    try {
      const { id } = req.params;
      const { page, pageSize } = req.pagination;
      const { status, keyword } = req.query;
      const currentUser = req.user;

      const courseClass = await CourseClass.findById(id);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 教师只能查看自己负责的班级
      if (currentUser.role === Roles.TEACHER && courseClass.teacher_id !== currentUser.id) {
        return Response.error(res, ErrorCodes.NO_PERMISSION, '只能查看自己负责的班级');
      }

      const result = await CourseClass.getStudents(id, {
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
   * 添加学生到课程班级
   * POST /api/v1/course-classes/:id/students
   */
  static async addStudent(req, res, next) {
    try {
      const { id } = req.params;
      const { studentId } = req.body;
      const currentUser = req.user;

      const courseClass = await CourseClass.findById(id);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 教师只能操作自己负责的班级
      if (currentUser.role === Roles.TEACHER && courseClass.teacher_id !== currentUser.id) {
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
      const existing = await CourseClass.getStudentRelation(id, studentId);
      if (existing && existing.status === 'approved') {
        return Response.error(res, ErrorCodes.STUDENT_ALREADY_IN_CLASS);
      }

      // 检查班级人数限制
      if (courseClass.max_students) {
        const currentCount = await CourseClass.getStudentCount(id);
        if (currentCount >= courseClass.max_students) {
          return Response.error(res, ErrorCodes.CLASS_FULL);
        }
      }

      await CourseClass.addStudent(id, studentId);

      return Response.success(res, null, '添加成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 批量添加学生到课程班级
   * POST /api/v1/course-classes/:id/students/batch
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

      const courseClass = await CourseClass.findById(id);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 教师只能操作自己负责的班级
      if (currentUser.role === Roles.TEACHER && courseClass.teacher_id !== currentUser.id) {
        return Response.error(res, ErrorCodes.NO_PERMISSION, '只能操作自己负责的班级');
      }

      const result = await CourseClass.batchAddStudents(id, studentIds);

      return Response.batch(res, result.success, result.failed, result.results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 从课程班级移除学生
   * DELETE /api/v1/course-classes/:id/students/:studentId
   */
  static async removeStudent(req, res, next) {
    try {
      const { id, studentId } = req.params;
      const currentUser = req.user;

      const courseClass = await CourseClass.findById(id);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 教师只能操作自己负责的班级
      if (currentUser.role === Roles.TEACHER && courseClass.teacher_id !== currentUser.id) {
        return Response.error(res, ErrorCodes.NO_PERMISSION, '只能操作自己负责的班级');
      }

      // 检查学生是否在班级中
      const existing = await CourseClass.getStudentRelation(id, studentId);
      if (!existing || existing.status !== 'approved') {
        return Response.error(res, ErrorCodes.STUDENT_NOT_IN_CLASS);
      }

      await CourseClass.removeStudent(id, studentId);

      return Response.success(res, null, '移除成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 批量从课程班级移除学生
   * DELETE /api/v1/course-classes/:id/students/batch
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

      const courseClass = await CourseClass.findById(id);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 教师只能操作自己负责的班级
      if (currentUser.role === Roles.TEACHER && courseClass.teacher_id !== currentUser.id) {
        return Response.error(res, ErrorCodes.NO_PERMISSION, '只能操作自己负责的班级');
      }

      const result = await CourseClass.batchRemoveStudents(id, studentIds);

      return Response.batch(res, result.success, result.failed, result.results);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CourseClassController;