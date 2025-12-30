const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const majorClassRoutes = require('./majorClasses');
const courseClassRoutes = require('./courseClasses');
const studentRoutes = require('./student');
const teacherRoutes = require('./teacher');
const counselorRoutes = require('./counselor');

const router = express.Router();

// API 版本前缀
const API_PREFIX = '/api/v1';

/**
 * 注册所有路由
 * @param {Express} app - Express 应用实例
 */
function registerRoutes(app) {
  // 认证路由
  router.use('/auth', authRoutes);
  
  // 用户管理路由
  router.use('/users', userRoutes);
  
  // 专业班级路由
  router.use('/major-classes', majorClassRoutes);
  
  // 课程班级路由
  router.use('/course-classes', courseClassRoutes);
  
  // 学生专属路由
  router.use('/student', studentRoutes);
  
  // 教师专属路由
  router.use('/teacher', teacherRoutes);
  
  // 辅导员专属路由
  router.use('/counselor', counselorRoutes);

  // 注册到应用
  app.use(API_PREFIX, router);

  // API 健康检查
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });
}

module.exports = registerRoutes;