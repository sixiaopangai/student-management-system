import { describe, test, expect } from '@jest/globals';
import { Roles, RoleNames, RoleTagTypes } from '../../constants/roles.js';

describe('角色常量', () => {
  describe('Roles', () => {
    test('应该定义所有角色', () => {
      expect(Roles.STUDENT).toBe('student');
      expect(Roles.TEACHER).toBe('teacher');
      expect(Roles.COUNSELOR).toBe('counselor');
      expect(Roles.ADMIN).toBe('admin');
    });

    test('应该有4种角色', () => {
      expect(Object.keys(Roles).length).toBe(4);
    });
  });

  describe('RoleNames', () => {
    test('每个角色都应该有对应的中文名称', () => {
      expect(RoleNames[Roles.STUDENT]).toBe('学生');
      expect(RoleNames[Roles.TEACHER]).toBe('教师');
      expect(RoleNames[Roles.COUNSELOR]).toBe('辅导员');
      expect(RoleNames[Roles.ADMIN]).toBe('管理员');
    });

    test('所有角色都应该有名称映射', () => {
      Object.values(Roles).forEach(role => {
        expect(RoleNames[role]).toBeDefined();
        expect(typeof RoleNames[role]).toBe('string');
      });
    });
  });

  describe('RoleTagTypes', () => {
    test('每个角色都应该有对应的标签类型', () => {
      expect(RoleTagTypes[Roles.STUDENT]).toBe('info');
      expect(RoleTagTypes[Roles.TEACHER]).toBe('success');
      expect(RoleTagTypes[Roles.COUNSELOR]).toBe('warning');
      expect(RoleTagTypes[Roles.ADMIN]).toBe('danger');
    });

    test('所有角色都应该有标签类型映射', () => {
      Object.values(Roles).forEach(role => {
        expect(RoleTagTypes[role]).toBeDefined();
        expect(typeof RoleTagTypes[role]).toBe('string');
      });
    });
  });
});