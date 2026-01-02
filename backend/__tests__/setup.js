// Jest 测试设置文件
const path = require('path');

// 加载测试环境配置文件 .env.test
require('dotenv').config({ path: path.resolve(__dirname, '../.env.test') });

// 确保使用测试环境
process.env.NODE_ENV = 'test';

// 设置默认值（如果 .env.test 中未配置）
process.env.DB_NAME = process.env.DB_NAME || 'student_management_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// 全局超时设置
jest.setTimeout(30000);

// 输出测试环境信息（仅在调试时有用）
if (process.env.DEBUG_TEST) {
  console.log('测试环境配置:');
  console.log(`  数据库: ${process.env.DB_NAME}`);
  console.log(`  主机: ${process.env.DB_HOST}`);
}