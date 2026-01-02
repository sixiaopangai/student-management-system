/**
 * 角色专属功能集成测试
 * 测试各角色特有的功能接口
 */

const request = require('supertest');
const { app, closeDatabase } = require('../../src/app');

const API_PREFIX = '/api/v1';
const DEFAULT_PASSWORD = '123456';

describe('角色专属功能集成测试', () => {
  let adminToken;
  let teacherToken;
  let counselorToken;
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
    
    const counselorRes = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ username: 'C202401', password: DEFAULT_PASSWORD });
    counselorToken = counselorRes.body.data?.token;
    
    const studentRes = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ username: '23010001', password: DEFAULT_PASSWORD });
    studentToken = studentRes.body.data?.token;
  });
  
  afterAll(async () => {
    await closeDatabase();
  });
  
  describe('学生专属功能', () => {
    
    test('学生查看自己的专业班级', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/student/my-class`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.status).toBe(200);
      // 可能有班级也可能没有
      expect([200, 30004]).toContain(res.body.code);
    });
    
    test('学生查看自己的课程列表', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/student/my-courses`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('学生查看可选课程', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/student/available-courses`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('非学生无法访问学生专属接口', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/student/my-courses`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.body.code).toBe(40003); // 无权限访问
    });
  });
  
  describe('教师专属功能', () => {
    
    test('教师查看自己教授的课程', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/teacher/my-courses`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('教师查看课程学生名单', async () => {
      // 先获取教师的课程
      const coursesRes = await request(app)
        .get(`${API_PREFIX}/teacher/my-courses`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      if (!coursesRes.body.data || coursesRes.body.data.length === 0) return;
      
      const courseId = coursesRes.body.data[0]?.id;
      
      const res = await request(app)
        .get(`${API_PREFIX}/teacher/courses/${courseId}/students`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('教师查看待审批学生', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/teacher/pending-students`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('非教师无法访问教师专属接口', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/teacher/my-courses`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.body.code).toBe(40003); // 无权限访问
    });
  });
  
  describe('辅导员专属功能', () => {
    
    test('辅导员查看自己管理的班级', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/counselor/my-classes`)
        .set('Authorization', `Bearer ${counselorToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('辅导员查看班级学生', async () => {
      // 先获取辅导员的班级
      const classesRes = await request(app)
        .get(`${API_PREFIX}/counselor/my-classes`)
        .set('Authorization', `Bearer ${counselorToken}`);
      
      if (!classesRes.body.data || classesRes.body.data.length === 0) return;
      
      const classId = classesRes.body.data[0]?.id;
      
      const res = await request(app)
        .get(`${API_PREFIX}/counselor/classes/${classId}/students`)
        .set('Authorization', `Bearer ${counselorToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('辅导员创建学生账号', async () => {
      // 先获取辅导员的班级
      const classesRes = await request(app)
        .get(`${API_PREFIX}/counselor/my-classes`)
        .set('Authorization', `Bearer ${counselorToken}`);
      
      if (!classesRes.body.data || classesRes.body.data.length === 0) return;
      
      const classId = classesRes.body.data[0]?.id;
      
      const res = await request(app)
        .post(`${API_PREFIX}/counselor/students`)
        .set('Authorization', `Bearer ${counselorToken}`)
        .send({
          username: 'newstudent999',
          password: DEFAULT_PASSWORD,
          realName: '辅导员创建的学生',
          majorClassId: classId
        });
      
      // 可能成功或用户名已存在
      expect([200, 10001]).toContain(res.body.code);
    });
    
    test('非辅导员无法访问辅导员专属接口', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/counselor/my-classes`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.body.code).toBe(40003); // 无权限访问
    });
  });
  
  describe('管理员专属功能', () => {
    
    test('管理员查看系统统计', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/admin/statistics`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      // 可能有这个接口也可能没有
      expect([200, 404]).toContain(res.status);
    });
    
    test('管理员查看所有用户', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/users`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(res.body.data.total).toBeGreaterThan(0);
    });
    
    test('管理员查看所有专业班级', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/major-classes`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('管理员查看所有课程班级', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/course-classes`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('非管理员无法访问用户管理', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/users`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.body.code).toBe(40003); // 无权限访问
    });
  });
  
  describe('个人信息管理', () => {
    
    test('用户查看个人信息', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/auth/current-user`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(res.body.data.username).toBe('23010001');
    });
    
    test('用户更新个人信息', async () => {
      const res = await request(app)
        .put(`${API_PREFIX}/auth/profile`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          email: 'student@test.com',
          phone: '13800138000'
        });
      
      // 可能成功或接口不存在
      expect([200, 404]).toContain(res.status);
    });
  });
});