const { CourseClass, User } = require('../models');
const Response = require('../utils/response');
const { ErrorCodes } = require('../config/errorCodes');

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
      const { keyword, status } = req.query;

      const result = await CourseClass.findAll({
        page,
        pageSize,
        keyword,
        status
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
        studentCount: item.student_count,
        pendingCount: item.pending_count,
        status: item.status,
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

      // 获取教师信息
      const teacher = await User.findById(courseClass.teacher_id);

      // 获取学生数量
      const studentCount = await CourseClass.getStudentCount(id);

      const data = {
        id: courseClass.id,
        name: courseClass.name,
        code: courseClass.code,
        teacherId: courseClass.teacher_id,
        teacherName: teacher ? teacher.real_name : null,
        description: courseClass.description,
        maxStudents: courseClass.max_students,
        studentCount,
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

      // 检查编码是否已存在
      const existing = await CourseClass.findByCode(code);
      if (existing) {
        return Response.error(res, ErrorCodes.CLASS_CODE_EXISTS);
      }

      // 检查教师是否存在
      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== 'teacher') {
        return Response.error(res, ErrorCodes.USER_NOT_FOUND, '教师不存在');
      }

      const id = await CourseClass.create({
        name,
        code,
        teacherId,
        description,
        maxStudents
      });

      return Response.success(res, { id }, '创建成功', 201);
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

      const courseClass = await CourseClass.findById(id);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 如果修改了编码，检查是否与其他班级冲突
      if (code && code !== courseClass.code) {
        const existing = await CourseClass.findByCode(code);
        if (existing) {
          return Response.error(res, ErrorCodes.CLASS_CODE_EXISTS);
        }
      }

      // 如果修改了教师，检查教师是否存在
      if (teacherId && teacherId !== courseClass.teacher_id) {
        const teacher = await User.findById(teacherId);
        if (!teacher || teacher.role !== 'teacher') {
          return Response.error(res, ErrorCodes.USER_NOT_FOUND, '教师不存在');
        }
      }

      await CourseClass.update(id, {
        name,
        code,
        teacherId,
        description,
        maxStudents,
        status
      });

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

      if (!Array.isArray(ids) || ids.length === 0) {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, 'ids不能为空');
      }

      const result = await CourseClass.batchDelete(ids);

      return Response.success(res, result, '批量删除完成');
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

      const courseClass = await CourseClass.findById(id);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 默认只查询 pending 和 approved 状态
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

      const courseClass = await CourseClass.findById(id);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 检查学生是否存在
      const student = await User.findById(studentId);
      if (!student || student.role !== 'student') {
        return Response.error(res, ErrorCodes.USER_NOT_FOUND, '学生不存在');
      }

      // 检查是否已在班级中
      const isInClass = await CourseClass.isStudentInClass(id, studentId);
      if (isInClass) {
        return Response.error(res, ErrorCodes.STUDENT_ALREADY_IN_CLASS);
      }

      // 检查班级人数是否已满
      if (courseClass.max_students) {
        const studentCount = await CourseClass.getStudentCount(id);
        if (studentCount >= courseClass.max_students) {
          return Response.error(res, ErrorCodes.CLASS_FULL);
        }
      }

      // 管理员/教师添加的学生直接通过
      await CourseClass.addStudent(id, studentId, 'approved', req.user.id);

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

      const courseClass = await CourseClass.findById(id);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      let success = 0;
      let failed = 0;

      for (const studentId of studentIds) {
        try {
          const student = await User.findById(studentId);
          if (!student || student.role !== 'student') {
            failed++;
            continue;
          }

          const isInClass = await CourseClass.isStudentInClass(id, studentId);
          if (isInClass) {
            failed++;
            continue;
          }

          // 管理员/教师添加的学生直接通过
          await CourseClass.addStudent(id, studentId, 'approved', req.user.id);
          success++;
        } catch {
          failed++;
        }
      }

      return Response.success(res, { success, failed }, '批量添加完成');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 审批通过学生
   * PUT /api/v1/course-classes/:id/students/:studentId/approve
   */
  static async approveStudent(req, res, next) {
    try {
      const { id, studentId } = req.params;

      const courseClass = await CourseClass.findById(id);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 检查学生是否在班级中且状态为 pending
      const studentStatus = await CourseClass.getStudentStatus(id, studentId);
      if (!studentStatus) {
        return Response.error(res, ErrorCodes.STUDENT_NOT_IN_CLASS);
      }
      if (studentStatus !== 'pending') {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '只能审批待审批状态的学生');
      }

      // 检查班级人数是否已满
      if (courseClass.max_students) {
        const studentCount = await CourseClass.getStudentCount(id);
        if (studentCount >= courseClass.max_students) {
          return Response.error(res, ErrorCodes.CLASS_FULL);
        }
      }

      await CourseClass.updateStudentStatus(id, studentId, 'approved', req.user.id);

      return Response.success(res, null, '审批通过');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 审批拒绝学生（直接删除申请记录）
   * PUT /api/v1/course-classes/:id/students/:studentId/reject
   */
  static async rejectStudent(req, res, next) {
    try {
      const { id, studentId } = req.params;

      const courseClass = await CourseClass.findById(id);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 检查学生是否在班级中且状态为 pending
      const studentStatus = await CourseClass.getStudentStatus(id, studentId);
      if (!studentStatus) {
        return Response.error(res, ErrorCodes.STUDENT_NOT_IN_CLASS);
      }
      if (studentStatus !== 'pending') {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '只能拒绝待审批状态的学生');
      }

      // 直接删除申请记录
      await CourseClass.removeStudent(id, studentId);

      return Response.success(res, null, '已拒绝');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 批量审批通过学生
   * POST /api/v1/course-classes/:id/students/batch-approve
   */
  static async batchApproveStudents(req, res, next) {
    try {
      const { id } = req.params;
      const { studentIds } = req.body;

      const courseClass = await CourseClass.findById(id);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      let success = 0;
      let failed = 0;

      for (const studentId of studentIds) {
        try {
          const studentStatus = await CourseClass.getStudentStatus(id, studentId);
          if (!studentStatus || studentStatus !== 'pending') {
            failed++;
            continue;
          }

          // 检查班级人数是否已满
          if (courseClass.max_students) {
            const studentCount = await CourseClass.getStudentCount(id);
            if (studentCount >= courseClass.max_students) {
              failed++;
              continue;
            }
          }

          await CourseClass.updateStudentStatus(id, studentId, 'approved', req.user.id);
          success++;
        } catch {
          failed++;
        }
      }

      return Response.success(res, { success, failed }, '批量审批完成');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 从课程班级移除学生（只能移除已通过的学生）
   * DELETE /api/v1/course-classes/:id/students/:studentId
   */
  static async removeStudent(req, res, next) {
    try {
      const { id, studentId } = req.params;

      const courseClass = await CourseClass.findById(id);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 检查学生是否在班级中
      const studentStatus = await CourseClass.getStudentStatus(id, studentId);
      if (!studentStatus) {
        return Response.error(res, ErrorCodes.STUDENT_NOT_IN_CLASS);
      }

      // 只能移除已通过的学生，待审批的应该用拒绝操作
      if (studentStatus === 'pending') {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '待审批的学生请使用拒绝操作');
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

      const courseClass = await CourseClass.findById(id);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      let success = 0;
      let failed = 0;

      for (const studentId of studentIds) {
        try {
          const studentStatus = await CourseClass.getStudentStatus(id, studentId);
          if (!studentStatus) {
            failed++;
            continue;
          }

          await CourseClass.removeStudent(id, studentId);
          success++;
        } catch {
          failed++;
        }
      }

      return Response.success(res, { success, failed }, '批量移除完成');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CourseClassController;