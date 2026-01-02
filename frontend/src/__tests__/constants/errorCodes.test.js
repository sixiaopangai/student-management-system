import { describe, test, expect } from '@jest/globals';
import { ERROR_CODE_MAP, getErrorMessage } from '../../constants/errorCodes.js';

describe('错误码常量', () => {
  describe('ERROR_CODE_MAP', () => {
    test('应该定义用户相关错误码', () => {
      expect(ERROR_CODE_MAP[10001]).toBe('用户名已存在');
      expect(ERROR_CODE_MAP[10002]).toBe('用户不存在');
      expect(ERROR_CODE_MAP[10003]).toBe('密码错误');
      expect(ERROR_CODE_MAP[10004]).toBe('账号已被禁用');
      expect(ERROR_CODE_MAP[10005]).toBe('原密码错误');
      expect(ERROR_CODE_MAP[10006]).toBe('新密码不符合规则');
      expect(ERROR_CODE_MAP[10007]).toBe('验证码错误或已过期');
    });

    test('应该定义班级相关错误码', () => {
      expect(ERROR_CODE_MAP[20001]).toBe('班级人数已满');
      expect(ERROR_CODE_MAP[20002]).toBe('班级不存在');
      expect(ERROR_CODE_MAP[20003]).toBe('班级已被删除');
      expect(ERROR_CODE_MAP[20004]).toBe('班级名称已存在');
      expect(ERROR_CODE_MAP[20005]).toBe('非法的班级类型');
    });

    test('应该定义学生班级关系错误码', () => {
      expect(ERROR_CODE_MAP[30001]).toBe('学生已在该班级中');
      expect(ERROR_CODE_MAP[30002]).toBe('学生不在该班级中');
      expect(ERROR_CODE_MAP[30003]).toBe('学生未分配专业班级');
      expect(ERROR_CODE_MAP[30004]).toBe('学生不属于当前操作范围');
      expect(ERROR_CODE_MAP[30005]).toBe('学生无资格加入该班级');
    });

    test('应该定义权限认证错误码', () => {
      expect(ERROR_CODE_MAP[40001]).toBe('无权限执行该操作');
      expect(ERROR_CODE_MAP[40002]).toContain('重新登录');
      expect(ERROR_CODE_MAP[40003]).toBe('角色不匹配');
      expect(ERROR_CODE_MAP[40004]).toBe('非法访问受限资源');
    });

    test('应该定义系统错误码', () => {
      expect(ERROR_CODE_MAP[90001]).toBe('参数校验失败');
      expect(ERROR_CODE_MAP[90002]).toBe('系统内部错误');
      expect(ERROR_CODE_MAP[90003]).toBe('服务暂不可用');
    });
  });

  describe('getErrorMessage', () => {
    test('应该返回已知错误码的消息', () => {
      expect(getErrorMessage(10001)).toBe('用户名已存在');
      expect(getErrorMessage(20002)).toBe('班级不存在');
      expect(getErrorMessage(40001)).toBe('无权限执行该操作');
    });

    test('未知错误码应该返回"未知错误"', () => {
      expect(getErrorMessage(99999)).toBe('未知错误');
      expect(getErrorMessage(0)).toBe('未知错误');
      expect(getErrorMessage(-1)).toBe('未知错误');
    });

    test('undefined 错误码应该返回"未知错误"', () => {
      expect(getErrorMessage(undefined)).toBe('未知错误');
    });

    test('null 错误码应该返回"未知错误"', () => {
      expect(getErrorMessage(null)).toBe('未知错误');
    });
  });
});