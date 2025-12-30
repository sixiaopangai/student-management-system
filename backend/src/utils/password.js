const bcrypt = require('bcryptjs');

/**
 * 密码工具类
 */
class PasswordUtil {
  /**
   * 加密密码
   * @param {string} password - 明文密码
   * @returns {Promise<string>} 加密后的密码
   */
  static async hash(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * 验证密码
   * @param {string} password - 明文密码
   * @param {string} hashedPassword - 加密后的密码
   * @returns {Promise<boolean>} 是否匹配
   */
  static async compare(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * 验证密码强度
   * @param {string} password - 密码
   * @returns {Object} 验证结果 { valid: boolean, message: string }
   */
  static validateStrength(password) {
    if (!password || password.length < 6) {
      return { valid: false, message: '密码长度不能少于6位' };
    }
    if (password.length > 20) {
      return { valid: false, message: '密码长度不能超过20位' };
    }
    return { valid: true, message: '密码格式正确' };
  }

  /**
   * 生成随机密码
   * @param {number} length - 密码长度
   * @returns {string} 随机密码
   */
  static generateRandom(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

module.exports = PasswordUtil;