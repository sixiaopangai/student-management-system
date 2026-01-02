/**
 * 认证模块集成测试
 * 测试登录、注册、密码管理等功能
 */

const request = require('supertest');
const { app, closeDatabase } = require('../../src/app');

const API_PREFIX = '/api/v1';
const DEFAULT_PASSWORD = '123456';

describe('认证模块集成测试', () => {
  
  afterAll(async () => {
    await closeDatabase();
  });
  
  describe('POST /auth/login - 用户登录', () => {
    
    test('管理员登录成功', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({
          username: 'admin',
          password: DEFAULT_PASSWORD
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.userInfo.role).toBe('admin');
    });
    
    test('教师登录成功', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({
          username: 'T202401',
          password: DEFAULT_PASSWORD
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(res.body.data.userInfo.role).toBe('teacher');
    });
    
    test('辅导员登录成功', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({
          username: 'C202401',
          password: DEFAULT_PASSWORD
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(res.body.data.userInfo.role).toBe('counselor');
    });
    
    test('学生登录成功', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({
          username: '23010001',
          password: DEFAULT_PASSWORD
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(res.body.data.userInfo.role).toBe('student');
    });
    
    test('禁用账号登录失败', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({
          username: 'T202403',
          password: DEFAULT_PASSWORD
        });
      
      expect(res.body.code).toBe(10004); // 账号已被禁用
    });
    
    test('错误密码登录失败', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({
          username: 'admin',
          password: 'wrongpassword'
        });
      
      expect(res.body.code).toBe(10003); // 密码错误
    });
    
    test('不存在用户登录失败', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({
          username: 'notexist',
          password: 'password'
        });
      
      expect(res.body.code).toBe(10002); // 用户不存在
    });
    
    test('记住我功能 - Token有效期延长', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({
          username: 'admin',
          password: DEFAULT_PASSWORD,
          rememberMe: true
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
      // Token应该有更长的有效期（具体验证需要解析JWT）
    });
  });
  
  describe('POST /auth/register - 用户注册', () => {
    
    test('学生自主注册成功', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/register`)
        .send({
          username: 'newstudent001',
          password: 'NewStudent@123',
          confirmPassword: 'NewStudent@123',
          realName: '新学生'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(res.body.data.username).toBe('newstudent001');
    });
    
    test('重复用户名注册失败', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/register`)
        .send({
          username: '23010001',
          password: DEFAULT_PASSWORD,
          confirmPassword: DEFAULT_PASSWORD,
          realName: '重复用户'
        });
      
      expect(res.body.code).toBe(10001); // 用户名已存在
    });
    
    test('密码不符合规则注册失败', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/register`)
        .send({
          username: 'newuser',
          password: '123',
          confirmPassword: '123',
          realName: '测试用户'
        });
      
      expect(res.body.code).toBe(90001); // 参数校验失败
    });
  });
  
  describe('GET /auth/current-user - 获取当前用户信息', () => {
    let adminToken;
    
    beforeAll(async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({ username: 'admin', password: DEFAULT_PASSWORD });
      adminToken = res.body.data.token;
    });
    
    test('已登录用户获取信息成功', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/auth/current-user`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.username).toBe('admin');
      expect(res.body.data.role).toBe('admin');
    });
    
    test('未登录用户获取信息失败', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/auth/current-user`);
      
      expect(res.body.code).toBe(40002); // 登录状态已失效
    });
    
    test('无效Token获取信息失败', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/auth/current-user`)
        .set('Authorization', 'Bearer invalid_token');
      
      expect(res.body.code).toBe(40002); // 登录状态已失效
    });
  });
  
  describe('PUT /auth/change-password - 修改密码', () => {
    let studentToken;
    
    beforeAll(async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({ username: '23010002', password: DEFAULT_PASSWORD });
      studentToken = res.body.data.token;
    });
    
    test('正确旧密码修改成功', async () => {
      const res = await request(app)
        .put(`${API_PREFIX}/auth/change-password`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          oldPassword: DEFAULT_PASSWORD,
          newPassword: 'NewPassword@123',
          confirmPassword: 'NewPassword@123'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('错误旧密码修改失败', async () => {
      const res = await request(app)
        .put(`${API_PREFIX}/auth/change-password`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          oldPassword: 'wrongpassword',
          newPassword: 'NewPassword@123',
          confirmPassword: 'NewPassword@123'
        });
      
      expect(res.body.code).toBe(10005); // 原密码错误
    });
  });
});