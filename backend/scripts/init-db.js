/**
 * 数据库初始化脚本
 * 用于重新创建数据库表和初始化测试数据
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  multipleStatements: true
};

async function initDatabase() {
  let connection;
  
  try {
    console.log('🔄 正在连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 读取SQL文件
    const sqlPath = path.join(__dirname, '../database/init.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🔄 正在执行初始化脚本...');
    
    // 执行SQL语句
    await connection.query(sqlContent);
    
    console.log('✅ 数据库初始化完成！');
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    测试账号 (密码均为: 123456)                    ║');
    console.log('╠════════════════════════════════════════════════════════════════╣');
    console.log('║ 管理员:                                                         ║');
    console.log('║   admin (系统管理员)                                            ║');
    console.log('╠════════════════════════════════════════════════════════════════╣');
    console.log('║ 教师 (5人):                                                     ║');
    console.log('║   T202401 (王建国)  T202402 (李明华)  T202403 (张秀英)          ║');
    console.log('║   T202404 (刘德华)  T202405 (陈志强)                            ║');
    console.log('╠════════════════════════════════════════════════════════════════╣');
    console.log('║ 辅导员 (3人):                                                   ║');
    console.log('║   C202401 (张晓红)  C202402 (王丽娟)  C202403 (李国强)          ║');
    console.log('╠════════════════════════════════════════════════════════════════╣');
    console.log('║ 学生 (42人):                                                    ║');
    console.log('║   计算机科学与技术2023级1班: 23010001-23010010 (10人)           ║');
    console.log('║   软件工程2023级1班: 23020001-23020010 (10人)                   ║');
    console.log('║   人工智能2023级1班: 23030001-23030008 (8人)                    ║');
    console.log('║   数据科学2023级1班: 23040001-23040008 (8人)                    ║');
    console.log('║   计算机科学与技术2024级1班: 24010001-24010006 (6人)            ║');
    console.log('╠════════════════════════════════════════════════════════════════╣');
    console.log('║ 专业班级 (6个):                                                 ║');
    console.log('║   计算机科学与技术2023级1班、软件工程2023级1班                  ║');
    console.log('║   人工智能2023级1班、数据科学2023级1班                          ║');
    console.log('║   计算机科学与技术2024级1班、网络工程2023级1班                  ║');
    console.log('╠════════════════════════════════════════════════════════════════╣');
    console.log('║ 课程班级 (8门):                                                 ║');
    console.log('║   数据结构与算法、操作系统原理、计算机网络、数据库系统          ║');
    console.log('║   软件工程导论、机器学习基础、Python程序设计、Web开发技术       ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();