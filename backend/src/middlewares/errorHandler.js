const Response = require('../utils/response');
const { ErrorCodes } = require('../config/errorCodes');

/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // 处理 JSON 解析错误
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return Response.error(res, ErrorCodes.VALIDATION_ERROR, '请求体格式错误');
  }

  // 处理数据库错误
  if (err.code && err.code.startsWith('ER_')) {
    console.error('Database Error:', err.message);
    return Response.error(res, ErrorCodes.SYSTEM_ERROR, '数据库操作失败');
  }

  // 处理自定义业务错误
  if (err.businessCode) {
    return Response.error(res, err.businessCode, err.message);
  }

  // 默认服务器错误
  return Response.error(res, ErrorCodes.SYSTEM_ERROR, 
    process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误'
  );
};

/**
 * 404 处理中间件
 */
const notFoundHandler = (req, res) => {
  return res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null
  });
};

/**
 * 创建业务错误
 * @param {number} code - 业务错误码
 * @param {string} message - 错误消息
 */
const createBusinessError = (code, message) => {
  const error = new Error(message);
  error.businessCode = code;
  return error;
};

module.exports = {
  errorHandler,
  notFoundHandler,
  createBusinessError
};