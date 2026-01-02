const pool = require('../config/database');

/**
 * 课程班级模型
 */
class CourseClass {
  /**
   * 查询课程班级列表
   * 支持按课程名称、编码、教师姓名搜索
   */
  static async findAll({ page = 1, pageSize = 10, keyword, status }) {
    let whereClauses = ['1=1'];
    const params = [];

    if (keyword) {
      // 支持按课程名称、编码、教师姓名搜索
      whereClauses.push(`(cc.name LIKE ? OR cc.code LIKE ? OR u.real_name LIKE ?)`);
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    if (status) {
      whereClauses.push(`cc.status = ?`);
      params.push(status);
    }

    const whereStr = whereClauses.join(' AND ');

    // 获取总数 - 需要 JOIN user 表以支持按教师姓名搜索
    const countSql = `
      SELECT COUNT(*) as total 
      FROM course_class cc
      LEFT JOIN user u ON cc.teacher_id = u.id
      WHERE ${whereStr}
    `;
    const countResult = await pool.query(countSql, params);
    const total = countResult[0].total;

    // 查询列表 - 确保 LIMIT 和 OFFSET 是整数
    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;
    
    const listSql = `
      SELECT cc.*, u.real_name as teacher_name,
        (SELECT COUNT(*) FROM student_course_class scc WHERE scc.course_class_id = cc.id AND scc.status = 'approved') as student_count,
        (SELECT COUNT(*) FROM student_course_class scc WHERE scc.course_class_id = cc.id AND scc.status = 'pending') as pending_count
      FROM course_class cc
      LEFT JOIN user u ON cc.teacher_id = u.id
      WHERE ${whereStr}
      ORDER BY cc.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const rows = await pool.query(listSql, params);

    return { list: rows, total };
  }

  /**
   * 根据ID查询课程班级
   */
  static async findById(id) {
    const rows = await pool.query(
      'SELECT * FROM course_class WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  /**
   * 根据编码查询课程班级
   */
  static async findByCode(code) {
    const rows = await pool.query(
      'SELECT * FROM course_class WHERE code = ?',
      [code]
    );
    return rows[0];
  }

  /**
   * 根据教师ID查询课程班级
   */
  static async findByTeacher(teacherId) {
    const rows = await pool.query(
      `SELECT cc.*,
        (SELECT COUNT(*) FROM student_course_class scc WHERE scc.course_class_id = cc.id AND scc.status = 'approved') as student_count,
        (SELECT COUNT(*) FROM student_course_class scc WHERE scc.course_class_id = cc.id AND scc.status = 'pending') as pending_count
      FROM course_class cc
      WHERE cc.teacher_id = ?
      ORDER BY cc.created_at DESC`,
      [teacherId]
    );
    return rows;
  }

  /**
   * 创建课程班级
   */
  static async create({ name, code, teacherId, description, maxStudents }) {
    const result = await pool.query(
      `INSERT INTO course_class (name, code, teacher_id, description, max_students)
       VALUES (?, ?, ?, ?, ?)`,
      [name, code, teacherId, description, maxStudents]
    );
    return result.insertId;
  }

  /**
   * 更新课程班级
   */
  static async update(id, { name, code, teacherId, description, maxStudents, status }) {
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (code !== undefined) {
      updates.push('code = ?');
      params.push(code);
    }
    if (teacherId !== undefined) {
      updates.push('teacher_id = ?');
      params.push(teacherId);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (maxStudents !== undefined) {
      updates.push('max_students = ?');
      params.push(maxStudents);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) return;

    params.push(id);
    await pool.query(
      `UPDATE course_class SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  /**
   * 删除课程班级
   */
  static async delete(id) {
    await pool.query('DELETE FROM course_class WHERE id = ?', [id]);
  }

  /**
   * 批量删除课程班级
   */
  static async batchDelete(ids) {
    let success = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        await pool.query('DELETE FROM course_class WHERE id = ?', [id]);
        success++;
      } catch {
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * 获取课程班级学生数量（只统计已通过的）
   */
  static async getStudentCount(classId) {
    const rows = await pool.query(
      `SELECT COUNT(*) as count FROM student_course_class 
       WHERE course_class_id = ? AND status = 'approved'`,
      [classId]
    );
    return rows[0].count;
  }

  /**
   * 获取课程班级学生列表（默认只查询 pending 和 approved）
   */
  static async getStudents(classId, { page = 1, pageSize = 10, status, keyword }) {
    let whereClauses = ['scc.course_class_id = ?'];
    const params = [classId];

    // 如果指定了状态，按指定状态查询；否则默认查询 pending 和 approved
    if (status) {
      whereClauses.push(`scc.status = ?`);
      params.push(status);
    } else {
      whereClauses.push(`scc.status IN ('pending', 'approved')`);
    }

    if (keyword) {
      whereClauses.push(`(u.username LIKE ? OR u.real_name LIKE ?)`);
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const whereStr = whereClauses.join(' AND ');

    // 获取总数
    const countSql = `
      SELECT COUNT(*) as total
      FROM student_course_class scc
      JOIN user u ON scc.student_id = u.id
      WHERE ${whereStr}
    `;
    const countResult = await pool.query(countSql, params);
    const total = countResult[0].total;

    // 查询列表，待审批的排在前面 - 确保 LIMIT 和 OFFSET 是整数
    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;
    
    const listSql = `
      SELECT u.id, u.username, u.real_name, u.email, u.phone, u.status as user_status,
             scc.status, scc.joined_at, scc.approved_at
      FROM student_course_class scc
      JOIN user u ON scc.student_id = u.id
      WHERE ${whereStr}
      ORDER BY FIELD(scc.status, 'pending', 'approved'), scc.joined_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const rows = await pool.query(listSql, params);

    return { list: rows, total };
  }

  /**
   * 检查学生是否在课程班级中（pending 或 approved 状态）
   */
  static async isStudentInClass(classId, studentId) {
    const rows = await pool.query(
      `SELECT id FROM student_course_class 
       WHERE course_class_id = ? AND student_id = ? AND status IN ('pending', 'approved')`,
      [classId, studentId]
    );
    return rows.length > 0;
  }

  /**
   * 获取学生在课程班级中的状态
   */
  static async getStudentStatus(classId, studentId) {
    const rows = await pool.query(
      `SELECT status FROM student_course_class 
       WHERE course_class_id = ? AND student_id = ?`,
      [classId, studentId]
    );
    return rows.length > 0 ? rows[0].status : null;
  }

  /**
   * 添加学生到课程班级
   */
  static async addStudent(classId, studentId, status = 'pending', approvedBy = null) {
    const approvedAt = status === 'approved' ? new Date() : null;
    await pool.query(
      `INSERT INTO student_course_class (course_class_id, student_id, status, approved_at, approved_by)
       VALUES (?, ?, ?, ?, ?)`,
      [classId, studentId, status, approvedAt, approvedBy]
    );
  }

  /**
   * 更新学生在课程班级中的状态
   */
  static async updateStudentStatus(classId, studentId, status, approvedBy = null) {
    const approvedAt = status === 'approved' ? new Date() : null;
    await pool.query(
      `UPDATE student_course_class 
       SET status = ?, approved_at = ?, approved_by = ?
       WHERE course_class_id = ? AND student_id = ?`,
      [status, approvedAt, approvedBy, classId, studentId]
    );
  }

  /**
   * 从课程班级移除学生（删除记录）
   */
  static async removeStudent(classId, studentId) {
    await pool.query(
      `DELETE FROM student_course_class WHERE course_class_id = ? AND student_id = ?`,
      [classId, studentId]
    );
  }

  /**
   * 获取学生加入的课程班级列表
   */
  static async getStudentClasses(studentId) {
    const rows = await pool.query(
      `SELECT cc.*, u.real_name as teacher_name, scc.status as join_status, scc.joined_at
       FROM student_course_class scc
       JOIN course_class cc ON scc.course_class_id = cc.id
       LEFT JOIN user u ON cc.teacher_id = u.id
       WHERE scc.student_id = ? AND scc.status IN ('pending', 'approved')
       ORDER BY scc.joined_at DESC`,
      [studentId]
    );
    return rows;
  }
}

module.exports = CourseClass;
