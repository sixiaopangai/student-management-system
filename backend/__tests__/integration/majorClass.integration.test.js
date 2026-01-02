/**
 * 专业班级管理集成测试
 * 测试专业班级CRUD、学生关系管理等功能
 */

const request = require('supertest');
const { app, closeDatabase } = require('../../src/app');

const API_PREFIX = '/api/v1';
const DEFAULT_PASSWORD = '123456';

describe('专业班级管理集成测试', () => {
  let adminToken;
  let counselorToken;
  let studentToken;
  
  beforeAll(async () => {
    // 获取各角色的Token
    const adminRes = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ username: 'admin', password: DEFAULT_PASSWORD });
    adminToken = adminRes.body.data?.token;
    
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
  
  describe('GET /major-classes - 获取专业班级列表', () => {
    
    test('管理员获取所有专业班级', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/major-classes`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(Array.isArray(res.body.data.list)).toBe(true);
    });
    
    test('辅导员获取自己管理的专业班级', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/major-classes`)
        .set('Authorization', `Bearer ${counselorToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('按年级筛选专业班级', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/major-classes?grade=2023`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      if (res.body.data.list.length > 0) {
        expect(res.body.data.list.every(c => c.grade === 2023)).toBe(true);
      }
    });
    
    test('按专业筛选专业班级', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/major-classes?major=计算机科学与技术`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
    });
  });
  
  describe('POST /major-classes - 创建专业班级', () => {
    
    test('管理员创建专业班级成功', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/major-classes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试班级2024',
          code: 'TEST-2024-01',
          description: '测试班级'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(res.body.data.name).toBe('测试班级2024');
    });
    
    test('辅导员无权创建专业班级', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/major-classes`)
        .set('Authorization', `Bearer ${counselorToken}`)
        .send({
          name: '辅导员创建班级',
          code: 'COUNSELOR-01',
          description: '测试'
        });
      
      expect(res.body.code).toBe(40003); // 无权限访问
    });
    
    test('学生无权创建专业班级', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/major-classes`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: '学生创建班级',
          code: 'STUDENT-01',
          description: '测试'
        });
      
      expect(res.body.code).toBe(40003); // 无权限访问
    });
  });
  
  describe('PUT /major-classes/:id - 更新专业班级', () => {
    
    test('管理员更新专业班级成功', async () => {
      // 先获取一个班级
      const listRes = await request(app)
        .get(`${API_PREFIX}/major-classes`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const classId = listRes.body.data.list[0]?.id;
      if (!classId) return;
      
      const res = await request(app)
        .put(`${API_PREFIX}/major-classes/${classId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: '更新后的描述'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });
  
  describe('GET /major-classes/:id/students - 获取班级学生', () => {
    
    test('管理员获取班级学生列表', async () => {
      const listRes = await request(app)
        .get(`${API_PREFIX}/major-classes`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const classId = listRes.body.data.list[0]?.id;
      if (!classId) return;
      
      const res = await request(app)
        .get(`${API_PREFIX}/major-classes/${classId}/students`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(Array.isArray(res.body.data.list)).toBe(true);
    });
    
    test('辅导员获取自己班级的学生列表', async () => {
      // 辅导员只能看到自己管理的班级
      const listRes = await request(app)
        .get(`${API_PREFIX}/major-classes`)
        .set('Authorization', `Bearer ${counselorToken}`);
      
      if (listRes.body.data.list.length === 0) return;
      
      const classId = listRes.body.data.list[0]?.id;
      
      const res = await request(app)
        .get(`${API_PREFIX}/major-classes/${classId}/students`)
        .set('Authorization', `Bearer ${counselorToken}`);
      
      expect(res.status).toBe(200);
    });
  });
  
  describe('POST /major-classes/:id/students - 添加学生到班级', () => {
    
    test('辅导员添加学生到自己管理的班级', async () => {
      // 获取辅导员管理的班级
      const listRes = await request(app)
        .get(`${API_PREFIX}/major-classes`)
        .set('Authorization', `Bearer ${counselorToken}`);
      
      if (listRes.body.data.list.length === 0) return;
      
      const classId = listRes.body.data.list[0]?.id;
      
      // 获取未分配班级的学生
      const usersRes = await request(app)
        .get(`${API_PREFIX}/users?role=student`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const student = usersRes.body.data.list.find(u => u.username === '23030001');
      if (!student) return;
      
      const res = await request(app)
        .post(`${API_PREFIX}/major-classes/${classId}/students`)
        .set('Authorization', `Bearer ${counselorToken}`)
        .send({
          studentId: student.id
        });
      
      // 可能成功或失败（取决于学生是否已在班级中）
      expect([200, 30003]).toContain(res.body.code);
    });
  });
  
  describe('DELETE /major-classes/:id/students/:studentId - 移除学生', () => {
    
    test('辅导员从班级移除学生', async () => {
      // 获取辅导员管理的班级
      const listRes = await request(app)
        .get(`${API_PREFIX}/major-classes`)
        .set('Authorization', `Bearer ${counselorToken}`);
      
      if (listRes.body.data.list.length === 0) return;
      
      const classId = listRes.body.data.list[0]?.id;
      
      // 获取班级中的学生
      const studentsRes = await request(app)
        .get(`${API_PREFIX}/major-classes/${classId}/students`)
        .set('Authorization', `Bearer ${counselorToken}`);
      
      if (studentsRes.body.data.list.length === 0) return;
      
      const studentId = studentsRes.body.data.list[0]?.id;
      
      const res = await request(app)
        .delete(`${API_PREFIX}/major-classes/${classId}/students/${studentId}`)
        .set('Authorization', `Bearer ${counselorToken}`);
      
      expect([200, 30004]).toContain(res.body.code);
    });
  });
  
  describe('PUT /major-classes/:id/counselor - 分配辅导员', () => {
    
    test('管理员分配辅导员到班级', async () => {
      // 获取一个班级
      const listRes = await request(app)
        .get(`${API_PREFIX}/major-classes`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const classId = listRes.body.data.list[0]?.id;
      if (!classId) return;
      
      // 获取一个辅导员
      const usersRes = await request(app)
        .get(`${API_PREFIX}/users?role=counselor`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const counselor = usersRes.body.data.list[0];
      if (!counselor) return;
      
      const res = await request(app)
        .put(`${API_PREFIX}/major-classes/${classId}/counselor`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          counselorId: counselor.id
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('辅导员无权分配辅导员', async () => {
      const listRes = await request(app)
        .get(`${API_PREFIX}/major-classes`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const classId = listRes.body.data.list[0]?.id;
      if (!classId) return;
      
      const res = await request(app)
        .put(`${API_PREFIX}/major-classes/${classId}/counselor`)
        .set('Authorization', `Bearer ${counselorToken}`)
        .send({
          counselorId: 1
        });
      
      expect(res.body.code).toBe(40003); // 无权限访问
    });
  });
});