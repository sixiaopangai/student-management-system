const { query } = require('../config/database');

/**
 * 密码重置模型
 */
class PasswordReset {
  /**
   * 创建密码重置记录
   * @param {number} userId - 用户ID
   * @param {string} email - 邮箱
   * @param {string} code - 验证码
   * @param {number} expiresInMinutes - 过期时间（分钟）
   * @returns {Promise<Object>} 创建的记录
   */
  static async create(userId, email, code, expiresInMinutes = 15) {
    const sql = `
      INSERT INTO password_reset (user_id, email, code, expired_at)
      VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))
    `;
    const result = await query(sql, [userId, email, code, expiresInMinutes]);
    
    return {
      id: result.insertId,
      userId,
      email,
      code
    };
  }

  /**
   * 验证重置码
   * @param {string} email - 邮箱
   * @param {string} code - 验证码
   * @returns {Promise<Object|null>} 验证结果
   */
  static async verify(email, code) {
    const sql = `
      SELECT pr.*, u.id as user_id
      FROM password_reset pr
      JOIN user u ON pr.user_id = u.id
      WHERE pr.email = ? AND pr.code = ? AND pr.used = 0 AND pr.expired_at > NOW()
      ORDER BY pr.created_at DESC
      LIMIT 1
    `;
    const results = await query(sql, [email, code]);
    return results[0] || null;
  }

  /**
   * 标记验证码为已使用
   * @param {number} id - 记录ID
   * @returns {Promise<boolean>} 是否更新成功
   */
  static async markAsUsed(id) {
    const sql = `UPDATE password_reset SET used = 1 WHERE id = ?`;
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * 生成6位数字验证码
   * @returns {string} 验证码
   */
  static generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 清理过期的验证码记录
   * @returns {Promise<number>} 清理的记录数
   */
  static async cleanExpired() {
    const sql = `DELETE FROM password_reset WHERE expired_at < NOW() OR used = 1`;
    const result = await query(sql);
    return result.affectedRows;
  }
}

module.exports = PasswordReset;