const { MajorClass, User } = require('../models');
const Response = require('../utils/response');
const { ErrorCodes } = require('../config/errorCodes');
const { Roles } = require('../middlewares/auth');

/**
 * 辅导员专属控制器
 */
class CounselorController {
  /**
   * 获取我负责的专业班级列表
   * GET /api/v1/counselor/my-major-classes
   */
  static async getMyMajorClasses(req, res, next) {
    try {
      const counselorId = req.user.id;

      const majorClasses = await MajorClass.findByCounselor(counselorId);

      const list = majorClasses.map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        description: item.description,
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
   * 获取我负责的专业班级详情
   * GET /api/v1/counselor/my-major-classes/:id
   */
  static async getMyMajorClassDetail(req, res, next) {
    try {
      const counselorId = req.user.id;
      const { id } = req.params;

      const majorClass = await MajorClass.findById(id);
      if (!majorClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 验证是否是自己负责的班级
      if (majorClass.counselor_id !== counselorId) {
        return Response.error(res, ErrorCodes.NO_PERMISSION, '只能查看自己负责的班级');
      }

      const studentsResult = await MajorClass.getStudents(id, { pageSize: 1 });

      const data = {
        id: majorClass.id,
        name: majorClass.name,
        code: majorClass.code,
        description: majorClass.description,
        studentCount: studentsResult.total,
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
   * 获取我负责的专业班级的学生列表
   * GET /api/v1/counselor/my-major-classes/:id/students
   */
  static async getMyMajorClassStudents(req, res, next) {
    try {
      const counselorId = req.user.id;
      const { id } = req.params;
      const { page, pageSize } = req.pagination;
      const { status, keyword } = req.query;

      const majorClass = await MajorClass.findById(id);
      if (!majorClass) {
        return Response.error(res, ErrorCodes.CLASS_NOT_FOUND);
      }

      // 验证是否是自己负责的班级
      if (majorClass.counselor_id !== counselorId) {
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
   * 获取我负责的所有学生列表
   * GET /api/v1/counselor/my-students
   */
  static async getMyStudents(req, res, next) {
    try {
      const counselorId = req.user.id;
      const { page, pageSize } = req.pagination;
      const { keyword } = req.query;

      // 获取辅导员负责的所有专业班级
      const majorClasses = await MajorClass.findByCounselor(counselorId);
      
      if (majorClasses.length === 0) {
        return Response.paginate(res, [], 0, page, pageSize);
      }

      const classIds = majorClasses.map(c => c.id);
      const { query } = require('../config/database');

      let whereClauses = [`smc.major_class_id IN (${classIds.join(',')})`, `smc.status = 'approved'`];
      let params = [];

      if (keyword) {
        whereClauses.push('(u.username LIKE ? OR u.real_name LIKE ?)');
        params.push(`%${keyword}%`, `%${keyword}%`);
      }

      const whereClause = `WHERE ${whereClauses.join(' AND ')}`;

      // 查询总数
      const countSql = `
        SELECT COUNT(DISTINCT u.id) as total 
        FROM student_major_class smc
        JOIN user u ON smc.student_id = u.id
        ${whereClause}
      `;
      const countResult = await query(countSql, params);
      const total = countResult[0].total;

      // 查询列表
      const offset = (page - 1) * pageSize;
      const listSql = `
        SELECT DISTINCT u.id, u.username, u.real_name, u.email, u.phone, u.status,
          mc.name as major_class_name, smc.joined_at
        FROM student_major_class smc
        JOIN user u ON smc.student_id = u.id
        JOIN major_class mc ON smc.major_class_id = mc.id
        ${whereClause}
        ORDER BY smc.joined_at DESC
        LIMIT ? OFFSET ?
      `;
      const list = await query(listSql, [...params, pageSize, offset]);

      const formattedList = list.map(item => ({
        id: item.id,
        username: item.username,
        realName: item.real_name,
        email: item.email,
        phone: item.phone,
        status: item.status,
        majorClassName: item.major_class_name,
        joinedAt: item.joined_at
      }));

      return Response.paginate(res, formattedList, total, page, pageSize);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建学生账号
   * POST /api/v1/counselor/create-student
   */
  static async createStudent(req, res, next) {
    try {
      const { username, password, realName, email, phone, majorClassId } = req.body;
      const counselorId = req.user.id;

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

      // 创建学生账号
      const student = await User.create({
        username,
        password,
        realName,
        role: Roles.STUDENT,
        email,
        phone
      });

      // 如果指定了专业班级，则加入班级
      if (majorClassId) {
        const majorClass = await MajorClass.findById(majorClassId);
        if (majorClass && majorClass.counselor_id === counselorId) {
          await MajorClass.addStudent(majorClassId, student.id);
        }
      }

      return Response.success(res, {
        id: student.id,
        username: student.username,
        realName: student.realName
      }, '创建成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 批量创建学生账号
   * POST /api/v1/counselor/batch-create-students
   */
  static async batchCreateStudents(req, res, next) {
    try {
      const { students, majorClassId } = req.body;
      const counselorId = req.user.id;

      if (!students || !Array.isArray(students) || students.length === 0) {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '请提供学生数据');
      }

      if (students.length > 100) {
        return Response.error(res, ErrorCodes.VALIDATION_ERROR, '单次最多创建100个学生');
      }

      // 验证专业班级
      let majorClass = null;
      if (majorClassId) {
        majorClass = await MajorClass.findById(majorClassId);
        if (!majorClass || majorClass.counselor_id !== counselorId) {
          return Response.error(res, ErrorCodes.NO_PERMISSION, '只能将学生添加到自己负责的班级');
        }
      }

      // 强制设置角色为学生
      students.forEach(s => s.role = Roles.STUDENT);

      const result = await User.batchCreate(students);

      // 如果指定了专业班级，将创建成功的学生加入班级
      if (majorClass && result.success > 0) {
        const successStudentIds = result.results
          .filter(r => r.status === 'success')
          .map(r => r.id);
        
        if (successStudentIds.length > 0) {
          await MajorClass.batchAddStudents(majorClassId, successStudentIds);
        }
      }

      return Response.batch(res, result.success, result.failed, result.results);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CounselorController;