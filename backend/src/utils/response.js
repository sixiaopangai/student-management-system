const { ErrorCodes, ErrorMessages } = require('../config/errorCodes');

/**
 * 统一响应格式工具类
 */
class Response {
  /**
   * 成功响应
   * @param {Object} res - Express response 对象
   * @param {*} data - 响应数据
   * @param {string} message - 响应消息
   */
  static success(res, data = null, message = '操作成功') {
    return res.json({
      code: ErrorCodes.SUCCESS,
      message,
      data
    });
  }

  /**
   * 错误响应
   * @param {Object} res - Express response 对象
   * @param {number} code - 业务错误码
   * @param {string} message - 错误消息（可选，默认使用错误码对应的消息）
   * @param {*} data - 附加数据（可选）
   */
  static error(res, code, message = null, data = null) {
    const errorMessage = message || ErrorMessages[code] || '未知错误';
    
    // 根据错误码确定HTTP状态码
    let httpStatus = 200;
    if (code >= 40001 && code <= 40002) {
      httpStatus = 401;
    } else if (code >= 40003 && code <= 40004) {
      httpStatus = 403;
    } else if (code === ErrorCodes.USER_NOT_FOUND || code === ErrorCodes.CLASS_NOT_FOUND) {
      httpStatus = 404;
    } else if (code === ErrorCodes.VALIDATION_ERROR) {
      httpStatus = 400;
    } else if (code >= 90002) {
      httpStatus = 500;
    }

    return res.status(httpStatus).json({
      code,
      message: errorMessage,
      data
    });
  }

  /**
   * 分页数据响应
   * @param {Object} res - Express response 对象
   * @param {Array} list - 数据列表
   * @param {number} total - 总数
   * @param {number} page - 当前页
   * @param {number} pageSize - 每页数量
   */
  static paginate(res, list, total, page, pageSize) {
    return res.json({
      code: ErrorCodes.SUCCESS,
      message: '获取成功',
      data: {
        list,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    });
  }

  /**
   * 批量操作响应
   * @param {Object} res - Express response 对象
   * @param {number} success - 成功数量
   * @param {number} failed - 失败数量
   * @param {Array} results - 详细结果
   */
  static batch(res, success, failed, results) {
    const message = failed > 0 
      ? `批量操作部分完成：成功 ${success} 条，失败 ${failed} 条`
      : `批量操作完成：共 ${success} 条`;
    
    return res.json({
      code: ErrorCodes.SUCCESS,
      message,
      data: {
        success,
        failed,
        results
      }
    });
  }
}

module.exports = Response;