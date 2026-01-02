/**
 * 课程班级管理集成测试
 * 测试课程班级CRUD、学生关系管理、人数限制等功能
 */

const request = require('supertest');
const { app, closeDatabase } = require('../../src/app');

const API_PREFIX = '/api/v1';
const DEFAULT_PASSWORD = '123456';

describe('课程班级管理集成测试', () => {
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
  
  describe('GET /course-classes - 获取课程班级列表', () => {
    
    test('管理员获取所有课程班级', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/course-classes`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(Array.isArray(res.body.data.list)).toBe(true);
    });
    
    test('教师获取自己教授的课程班级', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/course-classes`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('学生获取可选课程列表', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/course-classes?available=true`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('按学期筛选课程班级', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/course-classes?semester=2024-2025-1`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
    });
  });
  
  describe('POST /course-classes - 创建课程班级', () => {
    
    test('管理员创建课程班级成功', async () => {
      // 先获取一个教师ID
      const usersRes = await request(app)
        .get(`${API_PREFIX}/users?role=teacher`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const teacher = usersRes.body.data.list[0];
      if (!teacher) return;
      
      const res = await request(app)
        .post(`${API_PREFIX}/course-classes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试课程2024',
          code: 'TEST-2024-01',
          teacherId: teacher.id,
          maxStudents: 50,
          description: '测试课程'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('教师无权创建课程班级', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/course-classes`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          name: '教师创建课程',
          code: 'TEACHER-01',
          maxStudents: 30
        });
      
      expect(res.body.code).toBe(40003); // 无权限访问
    });
  });
  
  describe('PUT /course-classes/:id - 更新课程班级', () => {
    
    test('管理员更新课程班级成功', async () => {
      const listRes = await request(app)
        .get(`${API_PREFIX}/course-classes`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const classId = listRes.body.data.list[0]?.id;
      if (!classId) return;
      
      const res = await request(app)
        .put(`${API_PREFIX}/course-classes/${classId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: '更新后的课程描述'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });
  
  describe('GET /course-classes/:id/students - 获取课程学生', () => {
    
    test('教师获取自己课程的学生列表', async () => {
      const listRes = await request(app)
        .get(`${API_PREFIX}/course-classes`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      if (listRes.body.data.list.length === 0) return;
      
      const classId = listRes.body.data.list[0]?.id;
      
      const res = await request(app)
        .get(`${API_PREFIX}/course-classes/${classId}/students`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
    
    test('管理员获取任意课程的学生列表', async () => {
      const listRes = await request(app)
        .get(`${API_PREFIX}/course-classes`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const classId = listRes.body.data.list[0]?.id;
      if (!classId) return;
      
      const res = await request(app)
        .get(`${API_PREFIX}/course-classes/${classId}/students`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });
  
  describe('POST /course-classes/:id/join - 学生加入课程', () => {
    
    test('学生申请加入课程', async () => {
      // 获取可选课程
      const listRes = await request(app)
        .get(`${API_PREFIX}/course-classes?available=true`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      if (listRes.body.data.list.length === 0) return;
      
      // 找一个未满的课程
      const course = listRes.body.data.list.find(c => c.currentStudents < c.maxStudents);
      if (!course) return;
      
      const res = await request(app)
        .post(`${API_PREFIX}/course-classes/${course.id}/join`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      // 可能成功或已经加入
      expect([200, 20003]).toContain(res.body.code);
    });
    
    test('学生加入已满课程失败', async () => {
      // 获取课程列表，找一个已满的课程
      const listRes = await request(app)
        .get(`${API_PREFIX}/course-classes`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const fullCourse = listRes.body.data.list.find(c => c.currentStudents >= c.maxStudents);
      if (!fullCourse) return;
      
      const res = await request(app)
        .post(`${API_PREFIX}/course-classes/${fullCourse.id}/join`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.body.code).toBe(20002); // 课程人数已满
    });
  });
  
  describe('POST /course-classes/:id/quit - 学生退出课程', () => {
    
    test('学生退出已加入的课程', async () => {
      // 获取学生已加入的课程
      const myCoursesRes = await request(app)
        .get(`${API_PREFIX}/student/my-courses`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      if (!myCoursesRes.body.data || myCoursesRes.body.data.length === 0) return;
      
      const courseId = myCoursesRes.body.data[0]?.id;
      
      const res = await request(app)
        .post(`${API_PREFIX}/course-classes/${courseId}/quit`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect([200, 20004]).toContain(res.body.code);
    });
  });
  
  describe('PUT /course-classes/:id/students/:studentId/status - 审批学生', () => {
    
    test('教师批准学生加入课程', async () => {
      // 获取教师的课程
      const listRes = await request(app)
        .get(`${API_PREFIX}/course-classes`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      if (listRes.body.data.list.length === 0) return;
      
      const classId = listRes.body.data.list[0]?.id;
      
      // 获取待审批的学生
      const studentsRes = await request(app)
        .get(`${API_PREFIX}/course-classes/${classId}/students?status=pending`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      if (!studentsRes.body.data || studentsRes.body.data.list.length === 0) return;
      
      const studentId = studentsRes.body.data.list[0]?.id;
      
      const res = await request(app)
        .put(`${API_PREFIX}/course-classes/${classId}/students/${studentId}/status`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          status: 'approved'
        });
      
      expect([200, 20004]).toContain(res.body.code);
    });
    
    test('教师拒绝学生加入课程', async () => {
      const listRes = await request(app)
        .get(`${API_PREFIX}/course-classes`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      if (listRes.body.data.list.length === 0) return;
      
      const classId = listRes.body.data.list[0]?.id;
      
      const studentsRes = await request(app)
        .get(`${API_PREFIX}/course-classes/${classId}/students?status=pending`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      if (!studentsRes.body.data || studentsRes.body.data.list.length === 0) return;
      
      const studentId = studentsRes.body.data.list[0]?.id;
      
      const res = await request(app)
        .put(`${API_PREFIX}/course-classes/${classId}/students/${studentId}/status`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          status: 'rejected'
        });
      
      expect([200, 20004]).toContain(res.body.code);
    });
  });
  
  describe('PUT /course-classes/:id/teacher - 分配教师', () => {
    
    test('管理员分配教师到课程', async () => {
      const listRes = await request(app)
        .get(`${API_PREFIX}/course-classes`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const classId = listRes.body.data.list[0]?.id;
      if (!classId) return;
      
      const usersRes = await request(app)
        .get(`${API_PREFIX}/users?role=teacher`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const teacher = usersRes.body.data.list[0];
      if (!teacher) return;
      
      const res = await request(app)
        .put(`${API_PREFIX}/course-classes/${classId}/teacher`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          teacherId: teacher.id
        });
      
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });
});