const { query, transaction } = require('../config/database');

/**
 * 专业班级模型
 */
class MajorClass {
  /**
   * 根据ID查找专业班级
   * @param {number} id - 班级ID
   * @returns {Promise<Object|null>} 班级对象
   */
  static async findById(id) {
    const sql = `
      SELECT mc.*, u.real_name as counselor_name
      FROM major_class mc
      LEFT JOIN user u ON mc.counselor_id = u.id
      WHERE mc.id = ?
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  /**
   * 根据编码查找专业班级
   * @param {string} code - 班级编码
   * @returns {Promise<Object|null>} 班级对象
   */
  static async findByCode(code) {
    const sql = `SELECT * FROM major_class WHERE code = ?`;
    const results = await query(sql, [code]);
    return results[0] || null;
  }

  /**
   * 创建专业班级
   * @param {Object} classData - 班级数据
   * @returns {Promise<Object>} 创建的班级
   */
  static async create(classData) {
    const { name, code, counselorId, description } = classData;
    
    const sql = `
      INSERT INTO major_class (name, code, counselor_id, description)
      VALUES (?, ?, ?, ?)
    `;
    const result = await query(sql, [name, code, counselorId || null, description || null]);
    
    return {
      id: result.insertId,
      name,
      code,
      counselorId,
      description
    };
  }

  /**
   * 更新专业班级
   * @param {number} id - 班级ID
   * @param {Object} classData - 更新的数据
   * @returns {Promise<boolean>} 是否更新成功
   */
  static async update(id, classData) {
    const allowedFields = ['name', 'code', 'counselor_id', 'description', 'status'];
    const updates = [];
    const values = [];

    const fieldMap = {
      counselorId: 'counselor_id'
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
    const sql = `UPDATE major_class SET ${updates.join(', ')} WHERE id = ?`;
    const result = await query(sql, values);
    return result.affectedRows > 0;
  }

  /**
   * 删除专业班级
   * @param {number} id - 班级ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  static async delete(id) {
    const sql = `DELETE FROM major_class WHERE id = ?`;
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * 批量删除专业班级
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
        const majorClass = await MajorClass.findById(id);
        if (!majorClass) {
          failedIds.push(id);
          failedReasons.push({ id, code: 20002, message: '班级不存在' });
          failed++;
          continue;
        }

        await MajorClass.delete(id);
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
   * 获取专业班级列表
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 班级列表和总数
   */
  static async findAll(options = {}) {
    const { page = 1, pageSize = 10, keyword, status, counselorId } = options;
    const offset = (page - 1) * pageSize;
    
    let whereClauses = [];
    let params = [];

    if (status) {
      whereClauses.push('mc.status = ?');
      params.push(status);
    }

    if (counselorId) {
      whereClauses.push('mc.counselor_id = ?');
      params.push(counselorId);
    }

    if (keyword) {
      whereClauses.push('(mc.name LIKE ? OR mc.code LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM major_class mc ${whereClause}`;
    const countResult = await query(countSql, params);
    const total = countResult[0].total;

    // 查询列表
    const listSql = `
      SELECT mc.*, u.real_name as counselor_name,
        (SELECT COUNT(*) FROM student_major_class smc WHERE smc.major_class_id = mc.id AND smc.status = 'approved') as student_count
      FROM major_class mc
      LEFT JOIN user u ON mc.counselor_id = u.id
      ${whereClause}
      ORDER BY mc.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const list = await query(listSql, [...params, pageSize, offset]);

    return { list, total };
  }

  /**
   * 获取辅导员负责的专业班级
   * @param {number} counselorId - 辅导员ID
   * @returns {Promise<Array>} 班级列表
   */
  static async findByCounselor(counselorId) {
    const sql = `
      SELECT mc.*,
        (SELECT COUNT(*) FROM student_major_class smc WHERE smc.major_class_id = mc.id AND smc.status = 'approved') as student_count,
        (SELECT COUNT(*) FROM student_major_class smc WHERE smc.major_class_id = mc.id AND smc.status = 'pending') as pending_count
      FROM major_class mc
      WHERE mc.counselor_id = ? AND mc.status = 'active'
      ORDER BY mc.created_at DESC
    `;
    return query(sql, [counselorId]);
  }

  /**
   * 添加学生到专业班级
   * @param {number} majorClassId - 班级ID
   * @param {number} studentId - 学生ID
   * @param {string} status - 状态
   * @returns {Promise<Object>} 添加结果
   */
  static async addStudent(majorClassId, studentId, status = 'approved') {
    const sql = `
      INSERT INTO student_major_class (student_id, major_class_id, status, joined_at)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE status = ?, joined_at = NOW()
    `;
    const result = await query(sql, [studentId, majorClassId, status, status]);
    return { success: true, id: result.insertId };
  }

  /**
   * 批量添加学生到专业班级
   * @param {number} majorClassId - 班级ID
   * @param {Array<number>} studentIds - 学生ID数组
   * @returns {Promise<Object>} 添加结果
   */
  static async batchAddStudents(majorClassId, studentIds) {
    const results = [];
    let success = 0;
    let failed = 0;

    for (const studentId of studentIds) {
      try {
        // 检查学生是否已在班级中
        const existing = await MajorClass.getStudentRelation(majorClassId, studentId);
        if (existing && existing.status === 'approved') {
          results.push({
            studentId,
            status: 'failed',
            error: { code: 30001, message: '学生已在该班级中' }
          });
          failed++;
          continue;
        }

        await MajorClass.addStudent(majorClassId, studentId);
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
   * 从专业班级移除学生
   * @param {number} majorClassId - 班级ID
   * @param {number} studentId - 学生ID
   * @returns {Promise<boolean>} 是否移除成功
   */
  static async removeStudent(majorClassId, studentId) {
    const sql = `
      UPDATE student_major_class 
      SET status = 'removed' 
      WHERE major_class_id = ? AND student_id = ?
    `;
    const result = await query(sql, [majorClassId, studentId]);
    return result.affectedRows > 0;
  }

  /**
   * 批量从专业班级移除学生
   * @param {number} majorClassId - 班级ID
   * @param {Array<number>} studentIds - 学生ID数组
   * @returns {Promise<Object>} 移除结果
   */
  static async batchRemoveStudents(majorClassId, studentIds) {
    const results = [];
    let success = 0;
    let failed = 0;

    for (const studentId of studentIds) {
      try {
        const existing = await MajorClass.getStudentRelation(majorClassId, studentId);
        if (!existing || existing.status !== 'approved') {
          results.push({
            studentId,
            status: 'failed',
            error: { code: 30002, message: '学生不在该班级中' }
          });
          failed++;
          continue;
        }

        await MajorClass.removeStudent(majorClassId, studentId);
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
   * @param {number} majorClassId - 班级ID
   * @param {number} studentId - 学生ID
   * @returns {Promise<Object|null>} 关联关系
   */
  static async getStudentRelation(majorClassId, studentId) {
    const sql = `
      SELECT * FROM student_major_class 
      WHERE major_class_id = ? AND student_id = ?
    `;
    const results = await query(sql, [majorClassId, studentId]);
    return results[0] || null;
  }

  /**
   * 获取专业班级的学生列表
   * @param {number} majorClassId - 班级ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 学生列表和总数
   */
  static async getStudents(majorClassId, options = {}) {
    const { page = 1, pageSize = 10, status = 'approved', keyword } = options;
    const offset = (page - 1) * pageSize;
    
    let whereClauses = ['smc.major_class_id = ?'];
    let params = [majorClassId];

    if (status) {
      whereClauses.push('smc.status = ?');
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
      FROM student_major_class smc
      JOIN user u ON smc.student_id = u.id
      ${whereClause}
    `;
    const countResult = await query(countSql, params);
    const total = countResult[0].total;

    // 查询列表
    const listSql = `
      SELECT u.id, u.username, u.real_name, u.email, u.phone, u.status as user_status,
        smc.status, smc.joined_at, smc.approved_at
      FROM student_major_class smc
      JOIN user u ON smc.student_id = u.id
      ${whereClause}
      ORDER BY smc.joined_at DESC
      LIMIT ? OFFSET ?
    `;
    const list = await query(listSql, [...params, pageSize, offset]);

    return { list, total };
  }
}

module.exports = MajorClass;