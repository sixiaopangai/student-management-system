/**
 * 测试数据库初始化脚本
 * 用于创建和初始化独立的测试数据库
 * 
 * 使用方法:
 *   node scripts/init-test-db.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.test') });

const DB_NAME = process.env.DB_NAME || 'student_management_test';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';

async function initTestDatabase() {
  let connection;
  
  try {
    console.log('🔧 开始初始化测试数据库...');
    console.log(`   数据库名称: ${DB_NAME}`);
    console.log(`   主机: ${DB_HOST}:${DB_PORT}`);
    
    // 首先连接到 MySQL（不指定数据库）
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true
    });
    
    // 创建测试数据库（如果不存在）
    console.log('\n📦 创建测试数据库...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
    console.log(`   ✅ 数据库 ${DB_NAME} 已创建/已存在`);
    
    // 切换到测试数据库
    await connection.query(`USE \`${DB_NAME}\``);
    
    // 读取 init.sql 文件
    const initSqlPath = path.resolve(__dirname, '../database/init.sql');
    let initSql = fs.readFileSync(initSqlPath, 'utf8');
    
    // 移除 CREATE DATABASE 和 USE 语句（因为我们已经处理了）
    initSql = initSql
      .replace(/CREATE DATABASE IF NOT EXISTS.*?;/gi, '')
      .replace(/USE `student_management`;/gi, `USE \`${DB_NAME}\`;`);
    
    // 执行初始化 SQL
    console.log('\n📝 执行数据库初始化脚本...');
    await connection.query(initSql);
    console.log('   ✅ 表结构和初始数据已创建');
    
    // 验证数据
    console.log('\n📊 验证数据...');
    const [users] = await connection.query('SELECT COUNT(*) as count FROM user');
    const [majorClasses] = await connection.query('SELECT COUNT(*) as count FROM major_class');
    const [courseClasses] = await connection.query('SELECT COUNT(*) as count FROM course_class');
    
    console.log(`   用户数量: ${users[0].count}`);
    console.log(`   专业班级数量: ${majorClasses[0].count}`);
    console.log(`   课程班级数量: ${courseClasses[0].count}`);
    
    console.log('\n✅ 测试数据库初始化完成！');
    console.log(`\n💡 提示: 运行测试前请确保 .env.test 中的数据库密码配置正确`);
    
  } catch (error) {
    console.error('\n❌ 初始化失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 清理测试数据库（可选功能）
async function cleanTestDatabase() {
  let connection;
  
  try {
    console.log('🧹 清理测试数据库...');
    
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });
    
    await connection.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
    console.log(`   ✅ 数据库 ${DB_NAME} 已删除`);
    
  } catch (error) {
    console.error('❌ 清理失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 重置测试数据库（删除后重新创建）
async function resetTestDatabase() {
  await cleanTestDatabase();
  await initTestDatabase();
}

// 命令行参数处理
const command = process.argv[2];

switch (command) {
  case 'clean':
    cleanTestDatabase();
    break;
  case 'reset':
    resetTestDatabase();
    break;
  default:
    initTestDatabase();
}