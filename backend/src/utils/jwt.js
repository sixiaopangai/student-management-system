const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * JWT 工具类
 */
class JwtUtil {
  /**
   * 生成 Token
   * @param {Object} payload - Token 载荷
   * @param {boolean} rememberMe - 是否记住登录状态
   * @returns {string} JWT Token
   */
  static generateToken(payload, rememberMe = false) {
    const expiresIn = rememberMe ? '30d' : jwtConfig.expiresIn;
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn,
      algorithm: jwtConfig.algorithm
    });
  }

  /**
   * 验证 Token
   * @param {string} token - JWT Token
   * @returns {Object|null} 解码后的载荷，验证失败返回 null
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
      return null;
    }
  }

  /**
   * 解码 Token（不验证签名）
   * @param {string} token - JWT Token
   * @returns {Object|null} 解码后的载荷
   */
  static decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * 从请求头中提取 Token
   * @param {Object} req - Express request 对象
   * @returns {string|null} Token 字符串
   */
  static extractToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}

module.exports = JwtUtil;