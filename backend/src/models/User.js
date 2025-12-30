const { query, transaction } = require('../config/database');
const PasswordUtil = require('../utils/password');

/**
 * 用户模型
 */
class User {
  /**
   * 根据ID查找用户
   * @param {number} id - 用户ID
   * @returns {Promise<Object|null>} 用户对象
   */
  static async findById(id) {
    const sql = `
      SELECT id, username, real_name, role, email, phone, avatar, status, created_at, updated_at
      FROM user
      WHERE id = ?
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  /**
   * 根据用户名查找用户
   * @param {string} username - 用户名
   * @returns {Promise<Object|null>} 用户对象（包含密码）
   */
  static async findByUsername(username) {
    const sql = `
      SELECT id, username, password, real_name, role, email, phone, avatar, status, created_at, updated_at
      FROM user
      WHERE username = ?
    `;
    const results = await query(sql, [username]);
    return results[0] || null;
  }

  /**
   * 根据邮箱查找用户
   * @param {string} email - 邮箱
   * @returns {Promise<Object|null>} 用户对象
   */
  static async findByEmail(email) {
    const sql = `
      SELECT id, username, real_name, role, email, phone, avatar, status, created_at, updated_at
      FROM user
      WHERE email = ?
    `;
    const results = await query(sql, [email]);
    return results[0] || null;
  }

  /**
   * 创建用户
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>} 创建的用户
   */
  static async create(userData) {
    const { username, password, realName, role = 'student', email, phone } = userData;
    
    // 加密密码
    const hashedPassword = await PasswordUtil.hash(password);
    
    const sql = `
      INSERT INTO user (username, password, real_name, role, email, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [username, hashedPassword, realName, role, email || null, phone || null]);
    
    return {
      id: result.insertId,
      username,
      realName,
      role,
      email,
      phone
    };
  }

  /**
   * 批量创建用户
   * @param {Array} usersData - 用户数据数组
   * @returns {Promise<Object>} 创建结果
   */
  static async batchCreate(usersData) {
    const results = [];
    let success = 0;
    let failed = 0;

    for (const userData of usersData) {
      try {
        // 检查用户名是否存在
        const existing = await User.findByUsername(userData.username);
        if (existing) {
          results.push({
            username: userData.username,
            status: 'failed',
            error: { code: 10001, message: '用户名已存在' }
          });
          failed++;
          continue;
        }

        const user = await User.create(userData);
        results.push({
          username: userData.username,
          id: user.id,
          status: 'success'
        });
        success++;
      } catch (error) {
        results.push({
          username: userData.username,
          status: 'failed',
          error: { code: 90002, message: error.message }
        });
        failed++;
      }
    }

    return { success, failed, results };
  }

  /**
   * 更新用户信息
   * @param {number} id - 用户ID
   * @param {Object} userData - 更新的数据
   * @returns {Promise<boolean>} 是否更新成功
   */
  static async update(id, userData) {
    const allowedFields = ['real_name', 'email', 'phone', 'avatar', 'status'];
    const updates = [];
    const values = [];

    // 字段名映射
    const fieldMap = {
      realName: 'real_name'
    };

    for (const [key, value] of Object.entries(userData)) {
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
    const sql = `UPDATE user SET ${updates.join(', ')} WHERE id = ?`;
    const result = await query(sql, values);
    return result.affectedRows > 0;
  }

  /**
   * 更新密码
   * @param {number} id - 用户ID
   * @param {string} newPassword - 新密码
   * @returns {Promise<boolean>} 是否更新成功
   */
  static async updatePassword(id, newPassword) {
    const hashedPassword = await PasswordUtil.hash(newPassword);
    const sql = `UPDATE user SET password = ? WHERE id = ?`;
    const result = await query(sql, [hashedPassword, id]);
    return result.affectedRows > 0;
  }

  /**
   * 删除用户
   * @param {number} id - 用户ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  static async delete(id) {
    const sql = `DELETE FROM user WHERE id = ?`;
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * 批量删除用户
   * @param {Array<number>} ids - 用户ID数组
   * @returns {Promise<Object>} 删除结果
   */
  static async batchDelete(ids) {
    const results = [];
    let success = 0;
    let failed = 0;
    const failedIds = [];
    const failedReasons = [];

    for (const id of ids) {
      try {
        const user = await User.findById(id);
        if (!user) {
          failedIds.push(id);
          failedReasons.push({ id, code: 10002, message: '用户不存在' });
          failed++;
          continue;
        }

        await User.delete(id);
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
   * 获取用户列表
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 用户列表和总数
   */
  static async findAll(options = {}) {
    const { page = 1, pageSize = 10, role, keyword, status } = options;
    const offset = (page - 1) * pageSize;
    
    let whereClauses = [];
    let params = [];

    if (role) {
      whereClauses.push('role = ?');
      params.push(role);
    }

    if (status) {
      whereClauses.push('status = ?');
      params.push(status);
    }

    if (keyword) {
      whereClauses.push('(username LIKE ? OR real_name LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM user ${whereClause}`;
    const countResult = await query(countSql, params);
    const total = countResult[0].total;

    // 查询列表
    const listSql = `
      SELECT id, username, real_name, role, email, phone, avatar, status, created_at, updated_at
      FROM user
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const list = await query(listSql, [...params, pageSize, offset]);

    return { list, total };
  }

  /**
   * 批量获取用户
   * @param {Array<number>} ids - 用户ID数组
   * @returns {Promise<Object>} 用户列表和未找到的ID
   */
  static async batchGet(ids) {
    if (!ids || ids.length === 0) {
      return { list: [], notFound: [] };
    }

    const placeholders = ids.map(() => '?').join(',');
    const sql = `
      SELECT id, username, real_name, role, email, phone, avatar, status, created_at, updated_at
      FROM user
      WHERE id IN (${placeholders})
    `;
    const list = await query(sql, ids);
    
    const foundIds = list.map(u => u.id);
    const notFound = ids.filter(id => !foundIds.includes(id));

    return { list, notFound };
  }

  /**
   * 验证密码
   * @param {string} password - 明文密码
   * @param {string} hashedPassword - 加密后的密码
   * @returns {Promise<boolean>} 是否匹配
   */
  static async verifyPassword(password, hashedPassword) {
    return PasswordUtil.compare(password, hashedPassword);
  }
}

module.exports = User;