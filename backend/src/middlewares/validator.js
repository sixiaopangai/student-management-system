const { validationResult } = require('express-validator');
const Response = require('../utils/response');
const { ErrorCodes } = require('../config/errorCodes');

/**
 * 验证结果处理中间件
 * 用于处理 express-validator 的验证结果
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    return Response.error(res, ErrorCodes.VALIDATION_ERROR, '参数校验失败', {
      errors: errorDetails
    });
  }

  next();
};

/**
 * 分页参数处理中间件
 * 将分页参数标准化
 */
const paginationHandler = (req, res, next) => {
  let { page, pageSize } = req.query;
  
  page = parseInt(page) || 1;
  pageSize = parseInt(pageSize) || 10;
  
  // 限制分页范围
  page = Math.max(1, page);
  pageSize = Math.min(Math.max(1, pageSize), 100);
  
  req.pagination = {
    page,
    pageSize,
    offset: (page - 1) * pageSize
  };

  next();
};

module.exports = {
  handleValidation,
  paginationHandler
};