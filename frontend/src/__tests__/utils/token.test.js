import { describe, test, expect, beforeEach } from '@jest/globals';
import { getToken, setToken, removeToken, hasToken } from '../../utils/token.js';

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: function(key) {
    return this.store[key] || null;
  },
  setItem: function(key, value) {
    this.store[key] = value;
  },
  removeItem: function(key) {
    delete this.store[key];
  },
  clear: function() {
    this.store = {};
  }
};

global.localStorage = localStorageMock;

describe('Token 工具函数', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('setToken', () => {
    test('应该成功设置 Token', () => {
      const token = 'test-token-123';
      setToken(token);
      expect(localStorage.getItem('sms_token')).toBe(token);
    });
  });

  describe('getToken', () => {
    test('应该成功获取 Token', () => {
      const token = 'test-token-456';
      localStorage.setItem('sms_token', token);
      expect(getToken()).toBe(token);
    });

    test('Token 不存在时应该返回 null', () => {
      expect(getToken()).toBeNull();
    });
  });

  describe('removeToken', () => {
    test('应该成功移除 Token', () => {
      localStorage.setItem('sms_token', 'test-token');
      removeToken();
      expect(localStorage.getItem('sms_token')).toBeNull();
    });
  });

  describe('hasToken', () => {
    test('有 Token 时应该返回 true', () => {
      localStorage.setItem('sms_token', 'test-token');
      expect(hasToken()).toBe(true);
    });

    test('没有 Token 时应该返回 false', () => {
      expect(hasToken()).toBe(false);
    });

    test('Token 为空字符串时应该返回 false', () => {
      localStorage.setItem('sms_token', '');
      expect(hasToken()).toBe(false);
    });
  });
});