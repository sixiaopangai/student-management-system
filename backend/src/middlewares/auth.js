const JwtUtil = require('../utils/jwt');
const Response = require('../utils/response');
const { ErrorCodes } = require('../config/errorCodes');

/**
 * 认证中间件 - 验证用户登录状态
 */
const authenticate = (req, res, next) => {
  const token = JwtUtil.extractToken(req);
  
  if (!token) {
    return Response.error(res, ErrorCodes.TOKEN_EXPIRED, '请先登录');
  }

  const decoded = JwtUtil.verifyToken(token);
  
  if (!decoded) {
    return Response.error(res, ErrorCodes.TOKEN_EXPIRED);
  }

  // 将用户信息挂载到请求对象上
  req.user = {
    id: decoded.id,
    username: decoded.username,
    role: decoded.role
  };

  next();
};

/**
 * 角色授权中间件 - 验证用户角色权限
 * @param  {...string} allowedRoles - 允许的角色列表
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return Response.error(res, ErrorCodes.TOKEN_EXPIRED, '请先登录');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return Response.error(res, ErrorCodes.NO_PERMISSION);
    }

    next();
  };
};

/**
 * 可选认证中间件 - 如果有 Token 则验证，没有则跳过
 */
const optionalAuth = (req, res, next) => {
  const token = JwtUtil.extractToken(req);
  
  if (token) {
    const decoded = JwtUtil.verifyToken(token);
    if (decoded) {
      req.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      };
    }
  }

  next();
};

// 角色常量
const Roles = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  COUNSELOR: 'counselor',
  ADMIN: 'admin'
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  Roles
};