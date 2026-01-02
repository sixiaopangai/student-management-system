// Jest 测试设置文件
// 首先加载 .env 文件
require('dotenv').config();

// 设置测试环境
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// 全局超时设置
jest.setTimeout(30000);