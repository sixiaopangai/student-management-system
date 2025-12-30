/**
 * 业务错误码定义
 * 
 * 错误码区间划分：
 * 10000-10999: 用户与账号相关
 * 20000-20999: 班级本体相关
 * 30000-30999: 班级成员关系
 * 40000-40999: 权限与认证
 * 90000-99999: 系统通用错误
 */

const ErrorCodes = {
  // 成功
  SUCCESS: 200,

  // 用户与账号相关 (100xx)
  USER_ALREADY_EXISTS: 10001,      // 用户名已存在
  USER_NOT_FOUND: 10002,           // 用户不存在
  PASSWORD_ERROR: 10003,           // 密码错误
  ACCOUNT_DISABLED: 10004,         // 账号已被禁用
  OLD_PASSWORD_ERROR: 10005,       // 原密码错误
  NEW_PASSWORD_INVALID: 10006,     // 新密码不符合规则
  VERIFY_CODE_ERROR: 10007,        // 验证码错误或已过期

  // 班级相关 (200xx)
  CLASS_FULL: 20001,               // 班级人数已满
  CLASS_NOT_FOUND: 20002,          // 班级不存在
  CLASS_DELETED: 20003,            // 班级已被删除
  CLASS_NAME_EXISTS: 20004,        // 班级名称已存在
  INVALID_CLASS_TYPE: 20005,       // 非法的班级类型

  // 学生与班级关系 (300xx)
  STUDENT_ALREADY_IN_CLASS: 30001, // 学生已在该班级中
  STUDENT_NOT_IN_CLASS: 30002,     // 学生不在该班级中
  STUDENT_NO_MAJOR_CLASS: 30003,   // 学生未分配专业班级
  STUDENT_OUT_OF_SCOPE: 30004,     // 学生不属于当前操作范围
  STUDENT_NOT_ELIGIBLE: 30005,     // 学生无资格加入该班级

  // 权限与认证 (400xx)
  NO_PERMISSION: 40001,            // 无权限执行该操作
  TOKEN_EXPIRED: 40002,            // 登录状态已失效
  ROLE_MISMATCH: 40003,            // 角色不匹配
  FORBIDDEN_RESOURCE: 40004,       // 非法访问受限资源

  // 系统通用错误 (900xx)
  VALIDATION_ERROR: 90001,         // 参数校验失败
  SYSTEM_ERROR: 90002,             // 系统内部错误
  SERVICE_UNAVAILABLE: 90003       // 服务暂不可用
};

// 错误码对应的消息
const ErrorMessages = {
  [ErrorCodes.SUCCESS]: '操作成功',
  
  // 用户与账号相关
  [ErrorCodes.USER_ALREADY_EXISTS]: '用户名已存在',
  [ErrorCodes.USER_NOT_FOUND]: '用户不存在',
  [ErrorCodes.PASSWORD_ERROR]: '密码错误',
  [ErrorCodes.ACCOUNT_DISABLED]: '账号已被禁用',
  [ErrorCodes.OLD_PASSWORD_ERROR]: '原密码错误',
  [ErrorCodes.NEW_PASSWORD_INVALID]: '新密码不符合规则',
  [ErrorCodes.VERIFY_CODE_ERROR]: '验证码错误或已过期',

  // 班级相关
  [ErrorCodes.CLASS_FULL]: '班级人数已满',
  [ErrorCodes.CLASS_NOT_FOUND]: '班级不存在',
  [ErrorCodes.CLASS_DELETED]: '班级已被删除',
  [ErrorCodes.CLASS_NAME_EXISTS]: '班级名称已存在',
  [ErrorCodes.INVALID_CLASS_TYPE]: '非法的班级类型',

  // 学生与班级关系
  [ErrorCodes.STUDENT_ALREADY_IN_CLASS]: '学生已在该班级中',
  [ErrorCodes.STUDENT_NOT_IN_CLASS]: '学生不在该班级中',
  [ErrorCodes.STUDENT_NO_MAJOR_CLASS]: '学生未分配专业班级',
  [ErrorCodes.STUDENT_OUT_OF_SCOPE]: '学生不属于当前操作范围',
  [ErrorCodes.STUDENT_NOT_ELIGIBLE]: '学生无资格加入该班级',

  // 权限与认证
  [ErrorCodes.NO_PERMISSION]: '无权限执行该操作',
  [ErrorCodes.TOKEN_EXPIRED]: '登录状态已失效，请重新登录',
  [ErrorCodes.ROLE_MISMATCH]: '角色不匹配',
  [ErrorCodes.FORBIDDEN_RESOURCE]: '非法访问受限资源',

  // 系统通用错误
  [ErrorCodes.VALIDATION_ERROR]: '参数校验失败',
  [ErrorCodes.SYSTEM_ERROR]: '系统内部错误',
  [ErrorCodes.SERVICE_UNAVAILABLE]: '服务暂不可用'
};

module.exports = {
  ErrorCodes,
  ErrorMessages
};