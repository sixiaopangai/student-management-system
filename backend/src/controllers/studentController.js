const { MajorClass, CourseClass, User } = require('../models');
const Response = require('../utils/response');
const { ErrorCodes } = require('../config/errorCodes');
const { query } = require('../config/database');

/**
 * 学生专属控制器
 */
class StudentController {
  /**
   * 获取我的专业班级
   * GET /api/v1/student/my-major-class
   */
  static async getMyMajorClass(req, res, next) {
    try {
      const studentId = req.user.id;

      const sql = `
        SELECT mc.*, u.real_name as counselor_name, smc.status as join_status, smc.joined_at
        FROM student_major_class smc
        JOIN major_class mc ON smc.major_class_id = mc.id
        LEFT JOIN user u ON mc.counselor_id = u.id
        WHERE smc.student_id = ? AND smc.status = 'approved'
        LIMIT 1
      `;
      const results = await query(sql, [studentId]);

      if (results.length === 0) {
        return Response.error(res, ErrorCodes.STUDENT_NO_MAJOR_CLASS);
      }

      const majorClass = results[0];
      const data = {
        id: majorClass.id,
        name: majorClass.name,
        code: majorClass.code,
        counselorName: majorClass.counselor_name,
        description: majorClass.description,
        status: majorClass.join_status,
        joinedAt: majorClass.joined_at
      };

      return Response.success(res, data, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取我的课程班级列表
   * GET /api/v1/student/my-course-classes
   */
  static async getMyCourseClasses(req, res, next) {
    try {
      const studentId = req.user.id;

      const courseClasses = await CourseClass.findByStudent(studentId);

      const list = courseClasses.map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        teacherName: item.teacher_name,
        description: item.description,
        status: item.join_status,
        joinedAt: item.joined_at
      }));

      return Response.success(res, list, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 加入专业班级
   * POST /api/v1/student/join-major-class
   */
  static async joinMajorClass(req, res, next) {
    try {
      const studentId = req.user.id;
      const { majorClassId } = req.body;

      // 检查班级是否存在
      const majorClass = await MajorClass.findById(majorClassId);
      if (!majorClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      if (majorClass.status !== 'active') {
        return Response.error(res, ErrorCodes.CLASS_DELETED, '班级已停用');
      }

      // 检查是否已在班级中
      const existing = await MajorClass.getStudentRelation(majorClassId, studentId);
      if (existing && existing.status === 'approved') {
        return Response.error(res, ErrorCodes.STUDENT_ALREADY_IN_CLASS);
      }

      // 加入班级
      await MajorClass.addStudent(majorClassId, studentId);

      return Response.success(res, null, '加入成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 退出专业班级
   * POST /api/v1/student/leave-major-class
   */
  static async leaveMajorClass(req, res, next) {
    try {
      const studentId = req.user.id;
      const { majorClassId } = req.body;

      // 检查班级是否存在
      const majorClass = await MajorClass.findById(majorClassId);
      if (!majorClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 检查是否在班级中
      const existing = await MajorClass.getStudentRelation(majorClassId, studentId);
      if (!existing || existing.status !== 'approved') {
        return Response.error(res, ErrorCodes.STUDENT_NOT_IN_CLASS);
      }

      // 退出班级
      await MajorClass.removeStudent(majorClassId, studentId);

      return Response.success(res, null, '退出成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 加入课程班级
   * POST /api/v1/student/join-course-class
   */
  static async joinCourseClass(req, res, next) {
    try {
      const studentId = req.user.id;
      const { courseClassId } = req.body;

      // 检查班级是否存在
      const courseClass = await CourseClass.findById(courseClassId);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      if (courseClass.status !== 'active') {
        return Response.error(res, ErrorCodes.CLASS_DELETED, '班级已停用');
      }

      // 检查是否已在班级中
      const existing = await CourseClass.getStudentRelation(courseClassId, studentId);
      if (existing && existing.status === 'approved') {
        return Response.error(res, ErrorCodes.STUDENT_ALREADY_IN_CLASS);
      }

      // 检查班级人数限制
      if (courseClass.max_students) {
        const currentCount = await CourseClass.getStudentCount(courseClassId);
        if (currentCount >= courseClass.max_students) {
          return Response.error(res, ErrorCodes.CLASS_FULL);
        }
      }

      // 加入班级
      await CourseClass.addStudent(courseClassId, studentId);

      return Response.success(res, null, '加入成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 退出课程班级
   * POST /api/v1/student/leave-course-class
   */
  static async leaveCourseClass(req, res, next) {
    try {
      const studentId = req.user.id;
      const { courseClassId } = req.body;

      // 检查班级是否存在
      const courseClass = await CourseClass.findById(courseClassId);
      if (!courseClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 检查是否在班级中
      const existing = await CourseClass.getStudentRelation(courseClassId, studentId);
      if (!existing || existing.status !== 'approved') {
        return Response.error(res, ErrorCodes.STUDENT_NOT_IN_CLASS);
      }

      // 退出班级
      await CourseClass.removeStudent(courseClassId, studentId);

      return Response.success(res, null, '退出成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取可加入的专业班级列表
   * GET /api/v1/student/available-major-classes
   */
  static async getAvailableMajorClasses(req, res, next) {
    try {
      const studentId = req.user.id;

      const sql = `
        SELECT mc.*, u.real_name as counselor_name
        FROM major_class mc
        LEFT JOIN user u ON mc.counselor_id = u.id
        WHERE mc.status = 'active'
        AND mc.id NOT IN (
          SELECT major_class_id FROM student_major_class 
          WHERE student_id = ? AND status = 'approved'
        )
        ORDER BY mc.created_at DESC
      `;
      const results = await query(sql, [studentId]);

      const list = results.map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        counselorName: item.counselor_name,
        description: item.description
      }));

      return Response.success(res, list, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取可加入的课程班级列表
   * GET /api/v1/student/available-course-classes
   */
  static async getAvailableCourseClasses(req, res, next) {
    try {
      const studentId = req.user.id;

      const sql = `
        SELECT cc.*, u.real_name as teacher_name,
          (SELECT COUNT(*) FROM student_course_class scc WHERE scc.course_class_id = cc.id AND scc.status = 'approved') as student_count
        FROM course_class cc
        LEFT JOIN user u ON cc.teacher_id = u.id
        WHERE cc.status = 'active'
        AND cc.id NOT IN (
          SELECT course_class_id FROM student_course_class 
          WHERE student_id = ? AND status = 'approved'
        )
        ORDER BY cc.created_at DESC
      `;
      const results = await query(sql, [studentId]);

      const list = results.map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        teacherName: item.teacher_name,
        description: item.description,
        maxStudents: item.max_students,
        studentCount: item.student_count,
        isFull: item.max_students ? item.student_count >= item.max_students : false
      }));

      return Response.success(res, list, '获取成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StudentController;