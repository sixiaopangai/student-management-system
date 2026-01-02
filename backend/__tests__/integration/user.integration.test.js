/**
 * 用户管理集成测试
 * 测试用户CRUD、批量操作等功能
 */

const request = require('supertest');
const { app, closeDatabase } = require('../../src/app');

const API_PREFIX = '/api/v1';
const DEFAULT_PASSWORD = '123456';

describe('用户管理集成测试', () => {
  let adminToken;
  let teacherToken;
  let studentToken;
  
  beforeAll(async () => {
    // 获取各角色的Token
    const adminRes = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ username: 'admin', password: DEFAULT_PASSWORD });
    adminToken = adminRes.body.data?.token;
    
    const teacherRes = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ username: 'T202401', password: DEFAULT_PASSWORD });
    teacherToken = teacherRes.body.data?.token;
    
    const studentRes = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ username: '23010001', password: DEFAULT_PASSWORD });
    studentToken = studentRes.body.data?.token;
  });
  
  afterAll(async () => {
    await closeDatabase();
  });
  
  describe('GET /users - 获取用户列表', () => {
    
    test('管理员获取用户列表成功', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/users`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(Array.isArray(res.body.data.list)).toBe(true);
      expect(res.body.data.total).toBeGreaterThan(0);
    });
    
    test('管理员按角色筛选用户', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/users?role=student`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.list.every(u => u.role === 'student')).toBe(true);
    });
    
    test('管理员按关键字搜索用户', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/users?keyword=张`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('非管理员无权获取用户列表', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/users`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.body.code).toBe(40003); // 无权限访问
    });
  });
  
  describe('POST /users - 创建用户', () => {
    
    test('管理员创建教师成功', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'T202499',
          password: DEFAULT_PASSWORD,
          realName: '新教师',
          role: 'teacher'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(res.body.data.username).toBe('T202499');
    });
    
    test('管理员创建辅导员成功', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'C202499',
          password: DEFAULT_PASSWORD,
          realName: '新辅导员',
          role: 'counselor'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('创建重复用户名失败', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'admin',
          password: DEFAULT_PASSWORD,
          realName: '重复管理员',
          role: 'admin'
        });
      
      expect(res.body.code).toBe(10001); // 用户名已存在
    });
    
    test('非管理员无权创建用户', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/users`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          username: 'newuser',
          password: DEFAULT_PASSWORD,
          realName: '新用户',
          role: 'student'
        });
      
      expect(res.body.code).toBe(40003); // 无权限访问
    });
  });
  
  describe('PUT /users/:id - 更新用户', () => {
    
    test('管理员更新用户信息成功', async () => {
      // 先获取一个学生的ID
      const listRes = await request(app)
        .get(`${API_PREFIX}/users?role=student`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const studentId = listRes.body.data.list[0]?.id;
      if (!studentId) return;
      
      const res = await request(app)
        .put(`${API_PREFIX}/users/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          realName: '更新后的名字'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('更新不存在的用户失败', async () => {
      const res = await request(app)
        .put(`${API_PREFIX}/users/99999`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          realName: '测试'
        });
      
      expect(res.body.code).toBe(10002); // 用户不存在
    });
  });
  
  describe('PUT /users/:id/status - 启用/禁用用户', () => {
    
    test('管理员禁用用户成功', async () => {
      // 获取一个可以禁用的用户
      const listRes = await request(app)
        .get(`${API_PREFIX}/users?role=student`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const student = listRes.body.data.list.find(u => u.status === 'active');
      if (!student) return;
      
      const res = await request(app)
        .put(`${API_PREFIX}/users/${student.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'inactive'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('管理员启用用户成功', async () => {
      // 获取一个禁用的用户
      const listRes = await request(app)
        .get(`${API_PREFIX}/users?status=inactive`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const user = listRes.body.data.list[0];
      if (!user) return;
      
      const res = await request(app)
        .put(`${API_PREFIX}/users/${user.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'active'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });
  
  describe('POST /users/:id/reset-password - 重置密码', () => {
    
    test('管理员重置用户密码成功', async () => {
      const listRes = await request(app)
        .get(`${API_PREFIX}/users?role=student`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const student = listRes.body.data.list[0];
      if (!student) return;
      
      const res = await request(app)
        .post(`${API_PREFIX}/users/${student.id}/reset-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newPassword: 'Reset@123'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });
  
  describe('POST /users/batch - 批量操作', () => {
    
    test('管理员批量禁用用户', async () => {
      const listRes = await request(app)
        .get(`${API_PREFIX}/users?role=student&status=active`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const ids = listRes.body.data.list.slice(0, 2).map(u => u.id);
      if (ids.length === 0) return;
      
      const res = await request(app)
        .post(`${API_PREFIX}/users/batch`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          action: 'disable',
          ids: ids
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('管理员批量启用用户', async () => {
      const listRes = await request(app)
        .get(`${API_PREFIX}/users?status=inactive`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const ids = listRes.body.data.list.slice(0, 2).map(u => u.id);
      if (ids.length === 0) return;
      
      const res = await request(app)
        .post(`${API_PREFIX}/users/batch`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          action: 'enable',
          ids: ids
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });
});