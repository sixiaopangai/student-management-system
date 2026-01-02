const { ErrorCodes, ErrorMessages } = require('../../src/config/errorCodes');

describe('ErrorCodes', () => {
  describe('错误码定义', () => {
    it('SUCCESS 应该是 200', () => {
      expect(ErrorCodes.SUCCESS).toBe(200);
    });

    it('用户相关错误码应该在 10000-10999 范围内', () => {
      expect(ErrorCodes.USER_ALREADY_EXISTS).toBe(10001);
      expect(ErrorCodes.USER_NOT_FOUND).toBe(10002);
      expect(ErrorCodes.PASSWORD_ERROR).toBe(10003);
      expect(ErrorCodes.ACCOUNT_DISABLED).toBe(10004);
      expect(ErrorCodes.OLD_PASSWORD_ERROR).toBe(10005);
      expect(ErrorCodes.NEW_PASSWORD_INVALID).toBe(10006);
      expect(ErrorCodes.VERIFY_CODE_ERROR).toBe(10007);
    });

    it('班级相关错误码应该在 20000-20999 范围内', () => {
      expect(ErrorCodes.CLASS_FULL).toBe(20001);
      expect(ErrorCodes.CLASS_NOT_FOUND).toBe(20002);
      expect(ErrorCodes.CLASS_DELETED).toBe(20003);
      expect(ErrorCodes.CLASS_NAME_EXISTS).toBe(20004);
      expect(ErrorCodes.INVALID_CLASS_TYPE).toBe(20005);
    });

    it('学生班级关系错误码应该在 30000-30999 范围内', () => {
      expect(ErrorCodes.STUDENT_ALREADY_IN_CLASS).toBe(30001);
      expect(ErrorCodes.STUDENT_NOT_IN_CLASS).toBe(30002);
      expect(ErrorCodes.STUDENT_NO_MAJOR_CLASS).toBe(30003);
      expect(ErrorCodes.STUDENT_OUT_OF_SCOPE).toBe(30004);
      expect(ErrorCodes.STUDENT_NOT_ELIGIBLE).toBe(30005);
    });

    it('权限认证错误码应该在 40000-40999 范围内', () => {
      expect(ErrorCodes.NO_PERMISSION).toBe(40001);
      expect(ErrorCodes.TOKEN_EXPIRED).toBe(40002);
      expect(ErrorCodes.ROLE_MISMATCH).toBe(40003);
      expect(ErrorCodes.FORBIDDEN_RESOURCE).toBe(40004);
    });

    it('系统错误码应该在 90000-99999 范围内', () => {
      expect(ErrorCodes.VALIDATION_ERROR).toBe(90001);
      expect(ErrorCodes.SYSTEM_ERROR).toBe(90002);
      expect(ErrorCodes.SERVICE_UNAVAILABLE).toBe(90003);
    });
  });

  describe('错误消息定义', () => {
    it('每个错误码都应该有对应的错误消息', () => {
      Object.values(ErrorCodes).forEach(code => {
        expect(ErrorMessages[code]).toBeDefined();
        expect(typeof ErrorMessages[code]).toBe('string');
        expect(ErrorMessages[code].length).toBeGreaterThan(0);
      });
    });

    it('SUCCESS 消息应该是"操作成功"', () => {
      expect(ErrorMessages[ErrorCodes.SUCCESS]).toBe('操作成功');
    });

    it('USER_NOT_FOUND 消息应该是"用户不存在"', () => {
      expect(ErrorMessages[ErrorCodes.USER_NOT_FOUND]).toBe('用户不存在');
    });

    it('TOKEN_EXPIRED 消息应该包含"重新登录"', () => {
      expect(ErrorMessages[ErrorCodes.TOKEN_EXPIRED]).toContain('重新登录');
    });
  });
});