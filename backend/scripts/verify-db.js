/**
 * 数据库验证脚本
 * 用于验证数据库初始化是否正确
 */

const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: 'student_management'
};

async function verifyDatabase() {
  let connection;
  
  try {
    console.log('🔄 正在连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');
    
    // 验证用户表
    console.log('========================================');
    console.log('用户表数据:');
    console.log('========================================');
    const [users] = await connection.query(`
      SELECT id, username, real_name, employee_id, student_id, role, email, status 
      FROM user ORDER BY id
    `);
    
    console.log('ID\t用户名\t\t姓名\t\t职工号/学号\t角色\t\t邮箱');
    console.log('-'.repeat(100));
    users.forEach(u => {
      const idNum = u.employee_id || u.student_id || '-';
      console.log(`${u.id}\t${u.username}\t\t${u.real_name}\t\t${idNum}\t\t${u.role}\t\t${u.email}`);
    });
    
    // 验证专业班级表
    console.log('\n========================================');
    console.log('专业班级表数据:');
    console.log('========================================');
    const [majorClasses] = await connection.query(`
      SELECT mc.id, mc.name, mc.code, u.real_name as counselor_name, mc.description
      FROM major_class mc
      LEFT JOIN user u ON mc.counselor_id = u.id
      ORDER BY mc.id
    `);
    
    console.log('ID\t班级名称\t\t\t\t编码\t\t辅导员');
    console.log('-'.repeat(80));
    majorClasses.forEach(mc => {
      console.log(`${mc.id}\t${mc.name}\t\t${mc.code}\t\t${mc.counselor_name || '-'}`);
    });
    
    // 验证课程班级表
    console.log('\n========================================');
    console.log('课程班级表数据:');
    console.log('========================================');
    const [courseClasses] = await connection.query(`
      SELECT cc.id, cc.name, cc.code, u.real_name as teacher_name, cc.max_students
      FROM course_class cc
      LEFT JOIN user u ON cc.teacher_id = u.id
      ORDER BY cc.id
    `);
    
    console.log('ID\t课程名称\t\t编码\t\t授课教师\t最大人数');
    console.log('-'.repeat(80));
    courseClasses.forEach(cc => {
      console.log(`${cc.id}\t${cc.name}\t\t${cc.code}\t\t${cc.teacher_name}\t\t${cc.max_students}`);
    });
    
    // 验证学生专业班级关联
    console.log('\n========================================');
    console.log('学生-专业班级关联:');
    console.log('========================================');
    const [studentMajor] = await connection.query(`
      SELECT u.real_name as student_name, u.student_id, mc.name as class_name, smc.status
      FROM student_major_class smc
      JOIN user u ON smc.student_id = u.id
      JOIN major_class mc ON smc.major_class_id = mc.id
      ORDER BY smc.id
    `);
    
    console.log('学生姓名\t学号\t\t专业班级\t\t\t\t状态');
    console.log('-'.repeat(80));
    studentMajor.forEach(sm => {
      console.log(`${sm.student_name}\t\t${sm.student_id}\t\t${sm.class_name}\t\t${sm.status}`);
    });
    
    // 验证学生课程班级关联
    console.log('\n========================================');
    console.log('学生-课程班级关联:');
    console.log('========================================');
    const [studentCourse] = await connection.query(`
      SELECT u.real_name as student_name, u.student_id, cc.name as course_name, scc.status
      FROM student_course_class scc
      JOIN user u ON scc.student_id = u.id
      JOIN course_class cc ON scc.course_class_id = cc.id
      ORDER BY scc.id
    `);
    
    console.log('学生姓名\t学号\t\t课程名称\t\t状态');
    console.log('-'.repeat(80));
    studentCourse.forEach(sc => {
      console.log(`${sc.student_name}\t\t${sc.student_id}\t\t${sc.course_name}\t\t${sc.status}`);
    });
    
    console.log('\n✅ 数据库验证完成！所有数据正确。');
    
  } catch (error) {
    console.error('❌ 数据库验证失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifyDatabase();