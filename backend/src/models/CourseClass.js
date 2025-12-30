const { query, transaction } = require('../config/database');

/**
 * 课程班级模型
 */
class CourseClass {
  /**
   * 根据ID查找课程班级
   * @param {number} id - 班级ID
   * @returns {Promise<Object|null>} 班级对象
   */
  static async findById(id) {
    const sql = `
      SELECT cc.*, u.real_name as teacher_name
      FROM course_class cc
      LEFT JOIN user u ON cc.teacher_id = u.id
      WHERE cc.id = ?
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  /**
   * 根据编码查找课程班级
   * @param {string} code - 班级编码
   * @returns {Promise<Object|null>} 班级对象
   */
  static async findByCode(code) {
    const sql = `SELECT * FROM course_class WHERE code = ?`;
    const results = await query(sql, [code]);
    return results[0] || null;
  }

  /**
   * 创建课程班级
   * @param {Object} classData - 班级数据
   * @returns {Promise<Object>} 创建的班级
   */
  static async create(classData) {
    const { name, code, teacherId, description, maxStudents } = classData;
    
    const sql = `
      INSERT INTO course_class (name, code, teacher_id, description, max_students)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [name, code, teacherId, description || null, maxStudents || null]);
    
    return {
      id: result.insertId,
      name,
      code,
      teacherId,
      description,
      maxStudents
    };
  }

  /**
   * 更新课程班级
   * @param {number} id - 班级ID
   * @param {Object} classData - 更新的数据
   * @returns {Promise<boolean>} 是否更新成功
   */
  static async update(id, classData) {
    const allowedFields = ['name', 'code', 'teacher_id', 'description', 'max_students', 'status'];
    const updates = [];
    const values = [];

    const fieldMap = {
      teacherId: 'teacher_id',
      maxStudents: 'max_students'
    };

    for (const [key, value] of Object.entries(classData)) {
      const dbField = fieldMap[key] || key;
      if (allowedFields.includes(dbField) && value !== undefined) {
        updates.push(`${dbField} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return false;
    }

    values.push(id);
    const sql = `UPDATE course_class SET ${updates.join(', ')} WHERE id = ?`;
    const result = await query(sql, values);
    return result.affectedRows > 0;
  }

  /**
   * 删除课程班级
   * @param {number} id - 班级ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  static async delete(id) {
    const sql = `DELETE FROM course_class WHERE id = ?`;
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * 批量删除课程班级
   * @param {Array<number>} ids - 班级ID数组
   * @returns {Promise<Object>} 删除结果
   */
  static async batchDelete(ids) {
    let success = 0;
    let failed = 0;
    const failedIds = [];
    const failedReasons = [];

    for (const id of ids) {
      try {
        const courseClass = await CourseClass.findById(id);
        if (!courseClass) {
          failedIds.push(id);
          failedReasons.push({ id, code: 20002, message: '班级不存在' });
          failed++;
          continue;
        }

        await CourseClass.delete(id);
        success++;
      } catch (error) {
        failedIds.push(id);
        failedReasons.push({ id, code: 90002, message: error.message });
        failed++;
      }
    }

    return { success, failed, failedIds, failedReasons };
  }

  /**
   * 获取课程班级列表
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 班级列表和总数
   */
  static async findAll(options = {}) {
    const { page = 1, pageSize = 10, keyword, status, teacherId } = options;
    const offset = (page - 1) * pageSize;
    
    let whereClauses = [];
    let params = [];

    if (status) {
      whereClauses.push('cc.status = ?');
      params.push(status);
    }

    if (teacherId) {
      whereClauses.push('cc.teacher_id = ?');
      params.push(teacherId);
    }

    if (keyword) {
      whereClauses.push('(cc.name LIKE ? OR cc.code LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM course_class cc ${whereClause}`;
    const countResult = await query(countSql, params);
    const total = countResult[0].total;

    // 查询列表
    const listSql = `
      SELECT cc.*, u.real_name as teacher_name,
        (SELECT COUNT(*) FROM student_course_class scc WHERE scc.course_class_id = cc.id AND scc.status = 'approved') as student_count
      FROM course_class cc
      LEFT JOIN user u ON cc.teacher_id = u.id
      ${whereClause}
      ORDER BY cc.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const list = await query(listSql, [...params, pageSize, offset]);

    return { list, total };
  }

  /**
   * 获取教师负责的课程班级
   * @param {number} teacherId - 教师ID
   * @returns {Promise<Array>} 班级列表
   */
  static async findByTeacher(teacherId) {
    const sql = `
      SELECT cc.*,
        (SELECT COUNT(*) FROM student_course_class scc WHERE scc.course_class_id = cc.id AND scc.status = 'approved') as student_count,
        (SELECT COUNT(*) FROM student_course_class scc WHERE scc.course_class_id = cc.id AND scc.status = 'pending') as pending_count
      FROM course_class cc
      WHERE cc.teacher_id = ? AND cc.status = 'active'
      ORDER BY cc.created_at DESC
    `;
    return query(sql, [teacherId]);
  }

  /**
   * 添加学生到课程班级
   * @param {number} courseClassId - 班级ID
   * @param {number} studentId - 学生ID
   * @param {string} status - 状态
   * @returns {Promise<Object>} 添加结果
   */
  static async addStudent(courseClassId, studentId, status = 'approved') {
    // 检查班级人数限制
    const courseClass = await CourseClass.findById(courseClassId);
    if (courseClass && courseClass.max_students) {
      const currentCount = await CourseClass.getStudentCount(courseClassId);
      if (currentCount >= courseClass.max_students) {
        throw new Error('班级人数已满');
      }
    }

    const sql = `
      INSERT INTO student_course_class (student_id, course_class_id, status, joined_at)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE status = ?, joined_at = NOW()
    `;
    const result = await query(sql, [studentId, courseClassId, status, status]);
    return { success: true, id: result.insertId };
  }

  /**
   * 批量添加学生到课程班级
   * @param {number} courseClassId - 班级ID
   * @param {Array<number>} studentIds - 学生ID数组
   * @returns {Promise<Object>} 添加结果
   */
  static async batchAddStudents(courseClassId, studentIds) {
    const results = [];
    let success = 0;
    let failed = 0;

    // 检查班级人数限制
    const courseClass = await CourseClass.findById(courseClassId);
    const currentCount = await CourseClass.getStudentCount(courseClassId);
    const maxStudents = courseClass?.max_students;

    for (const studentId of studentIds) {
      try {
        // 检查学生是否已在班级中
        const existing = await CourseClass.getStudentRelation(courseClassId, studentId);
        if (existing && existing.status === 'approved') {
          results.push({
            studentId,
            status: 'failed',
            error: { code: 30001, message: '学生已在该班级中' }
          });
          failed++;
          continue;
        }

        // 检查人数限制
        if (maxStudents && (currentCount + success) >= maxStudents) {
          results.push({
            studentId,
            status: 'failed',
            error: { code: 20001, message: '班级人数已满' }
          });
          failed++;
          continue;
        }

        await CourseClass.addStudent(courseClassId, studentId);
        results.push({ studentId, status: 'success' });
        success++;
      } catch (error) {
        results.push({
          studentId,
          status: 'failed',
          error: { code: 90002, message: error.message }
        });
        failed++;
      }
    }

    return { success, failed, results };
  }

  /**
   * 从课程班级移除学生
   * @param {number} courseClassId - 班级ID
   * @param {number} studentId - 学生ID
   * @returns {Promise<boolean>} 是否移除成功
   */
  static async removeStudent(courseClassId, studentId) {
    const sql = `
      UPDATE student_course_class 
      SET status = 'removed' 
      WHERE course_class_id = ? AND student_id = ?
    `;
    const result = await query(sql, [courseClassId, studentId]);
    return result.affectedRows > 0;
  }

  /**
   * 批量从课程班级移除学生
   * @param {number} courseClassId - 班级ID
   * @param {Array<number>} studentIds - 学生ID数组
   * @returns {Promise<Object>} 移除结果
   */
  static async batchRemoveStudents(courseClassId, studentIds) {
    const results = [];
    let success = 0;
    let failed = 0;

    for (const studentId of studentIds) {
      try {
        const existing = await CourseClass.getStudentRelation(courseClassId, studentId);
        if (!existing || existing.status !== 'approved') {
          results.push({
            studentId,
            status: 'failed',
            error: { code: 30002, message: '学生不在该班级中' }
          });
          failed++;
          continue;
        }

        await CourseClass.removeStudent(courseClassId, studentId);
        results.push({ studentId, status: 'success' });
        success++;
      } catch (error) {
        results.push({
          studentId,
          status: 'failed',
          error: { code: 90002, message: error.message }
        });
        failed++;
      }
    }

    return { success, failed, results };
  }

  /**
   * 获取学生与班级的关联关系
   * @param {number} courseClassId - 班级ID
   * @param {number} studentId - 学生ID
   * @returns {Promise<Object|null>} 关联关系
   */
  static async getStudentRelation(courseClassId, studentId) {
    const sql = `
      SELECT * FROM student_course_class 
      WHERE course_class_id = ? AND student_id = ?
    `;
    const results = await query(sql, [courseClassId, studentId]);
    return results[0] || null;
  }

  /**
   * 获取课程班级的学生数量
   * @param {number} courseClassId - 班级ID
   * @returns {Promise<number>} 学生数量
   */
  static async getStudentCount(courseClassId) {
    const sql = `
      SELECT COUNT(*) as count 
      FROM student_course_class 
      WHERE course_class_id = ? AND status = 'approved'
    `;
    const results = await query(sql, [courseClassId]);
    return results[0].count;
  }

  /**
   * 获取课程班级的学生列表
   * @param {number} courseClassId - 班级ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 学生列表和总数
   */
  static async getStudents(courseClassId, options = {}) {
    const { page = 1, pageSize = 10, status = 'approved', keyword } = options;
    const offset = (page - 1) * pageSize;
    
    let whereClauses = ['scc.course_class_id = ?'];
    let params = [courseClassId];

    if (status) {
      whereClauses.push('scc.status = ?');
      params.push(status);
    }

    if (keyword) {
      whereClauses.push('(u.username LIKE ? OR u.real_name LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const whereClause = `WHERE ${whereClauses.join(' AND ')}`;

    // 查询总数
    const countSql = `
      SELECT COUNT(*) as total 
      FROM student_course_class scc
      JOIN user u ON scc.student_id = u.id
      ${whereClause}
    `;
    const countResult = await query(countSql, params);
    const total = countResult[0].total;

    // 查询列表
    const listSql = `
      SELECT u.id, u.username, u.real_name, u.email, u.phone, u.status as user_status,
        scc.status, scc.joined_at, scc.approved_at
      FROM student_course_class scc
      JOIN user u ON scc.student_id = u.id
      ${whereClause}
      ORDER BY scc.joined_at DESC
      LIMIT ? OFFSET ?
    `;
    const list = await query(listSql, [...params, pageSize, offset]);

    return { list, total };
  }

  /**
   * 获取学生加入的课程班级列表
   * @param {number} studentId - 学生ID
   * @returns {Promise<Array>} 课程班级列表
   */
  static async findByStudent(studentId) {
    const sql = `
      SELECT cc.*, u.real_name as teacher_name, scc.status as join_status, scc.joined_at
      FROM student_course_class scc
      JOIN course_class cc ON scc.course_class_id = cc.id
      LEFT JOIN user u ON cc.teacher_id = u.id
      WHERE scc.student_id = ? AND scc.status = 'approved'
      ORDER BY scc.joined_at DESC
    `;
    return query(sql, [studentId]);
  }
}

module.exports = CourseClass;