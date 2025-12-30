const { CourseClass } = require('../models');
const Response = require('../utils/response');
const { ErrorCodes } = require('../config/errorCodes');

/**
 * 教师专属控制器
 */
class TeacherController {
  /**
   * 获取我负责的课程班级列表
   * GET /api/v1/teacher/my-course-classes
   */
  static async getMyCourseClasses(req, res, next) {
    try {
      const teacherId = req.user.id;

      const courseClasses = await CourseClass.findByTeacher(teacherId);

      const list = courseClasses.map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        description: item.description,
        maxStudents: item.max_students,
        studentCount: item.student_count,
        pendingCount: item.pending_count,
        status: item.status,
        createdAt: item.created_at
      }));

      return Response.success(res, list, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取我负责的课程班级详情
   * GET /api/v1/teacher/my-course-classes/:id
   */
  static async getMyCourseClassDetail(req, res, next) {
    try {
      const teacherId = req.user.id;
      const { id } = req.params;

      const courseClass = await CourseClass.findById(id);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 验证是否是自己负责的班级
      if (courseClass.teacher_id !== teacherId) {
        return Response.error(res, ErrorCodes.NO_PERMISSION, '只能查看自己负责的班级');
      }

      const studentCount = await CourseClass.getStudentCount(id);

      const data = {
        id: courseClass.id,
        name: courseClass.name,
        code: courseClass.code,
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
   * 获取我负责的课程班级的学生列表
   * GET /api/v1/teacher/my-course-classes/:id/students
   */
  static async getMyCourseClassStudents(req, res, next) {
    try {
      const teacherId = req.user.id;
      const { id } = req.params;
      const { page, pageSize } = req.pagination;
      const { status, keyword } = req.query;

      const courseClass = await CourseClass.findById(id);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 验证是否是自己负责的班级
      if (courseClass.teacher_id !== teacherId) {
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
}

module.exports = TeacherController;