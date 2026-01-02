/**
 * 测试数据初始化脚本
 * 用于初始化测试环境的数据
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// 测试数据配置
const TEST_DATA = {
  // 统一密码: 123456
  passwords: {
    default: '123456'
  },
  
  // 用户数据
  users: [
    // 管理员
    { username: 'admin', realName: '系统管理员', role: 'admin', status: 'active' },
    
    // 教师
    { username: 'T202401', realName: '王建国', employeeId: 'T202401', role: 'teacher', status: 'active' },
    { username: 'T202402', realName: '李明华', employeeId: 'T202402', role: 'teacher', status: 'active' },
    { username: 'T202403', realName: '张秀英', employeeId: 'T202403', role: 'teacher', status: 'inactive' }, // 禁用账号
    
    // 辅导员
    { username: 'C202401', realName: '张晓红', employeeId: 'C202401', role: 'counselor', status: 'active' },
    { username: 'C202402', realName: '王丽娟', employeeId: 'C202402', role: 'counselor', status: 'active' },
    { username: 'C202403', realName: '李国强', employeeId: 'C202403', role: 'counselor', status: 'inactive' }, // 禁用账号
    
    // 学生 - 计算机科学与技术2023级1班
    { username: '23010001', realName: '张三', studentId: '23010001', role: 'student', status: 'active' },
    { username: '23010002', realName: '李四', studentId: '23010002', role: 'student', status: 'active' },
    
    // 学生 - 软件工程2023级1班
    { username: '23020001', realName: '陈小明', studentId: '23020001', role: 'student', status: 'active' },
    { username: '23020002', realName: '林小红', studentId: '23020002', role: 'student', status: 'active' },
    
    // 学生 - 人工智能2023级1班
    { username: '23030001', realName: '高志远', studentId: '23030001', role: 'student', status: 'active' }, // 未分配班级
    { username: '23030002', realName: '罗思琪', studentId: '23030002', role: 'student', status: 'inactive' }, // 禁用账号
    
    // 学生 - 数据科学2023级1班
    { username: '23040001', realName: '邓子豪', studentId: '23040001', role: 'student', status: 'active' },
    { username: '23040002', realName: '萧雨晴', studentId: '23040002', role: 'student', status: 'active' }
  ],
  
  // 专业班级数据
  majorClasses: [
    { name: '计算机科学与技术2023级1班', code: 'CS-2023-01', counselorUsername: 'C202401' },
    { name: '软件工程2023级1班', code: 'SE-2023-01', counselorUsername: 'C202401' },
    { name: '人工智能2023级1班', code: 'AI-2023-01', counselorUsername: 'C202402' },
    { name: '数据科学2023级1班', code: 'DS-2023-01', counselorUsername: 'C202402' },
    { name: '计算机科学与技术2024级1班', code: 'CS-2024-01', counselorUsername: null } // 未分配辅导员
  ],
  
  // 课程班级数据
  courseClasses: [
    { name: '数据结构与算法', code: 'DS-2024-01', teacherUsername: 'T202401', maxStudents: 60 },
    { name: '操作系统原理', code: 'OS-2024-01', teacherUsername: 'T202401', maxStudents: 50 },
    { name: '计算机网络', code: 'CN-2024-01', teacherUsername: 'T202402', maxStudents: 55 },
    { name: '数据库系统', code: 'DB-2024-01', teacherUsername: 'T202402', maxStudents: 3 }, // 人数限制测试
    { name: 'Python程序设计', code: 'PY-2024-01', teacherUsername: 'T202401', maxStudents: 80 }
  ],
  
  // 学生-专业班级关联
  studentMajorRelations: [
    { studentUsername: '23010001', majorClassCode: 'CS-2023-01', status: 'approved' },
    { studentUsername: '23010002', majorClassCode: 'CS-2023-01', status: 'approved' },
    { studentUsername: '23020001', majorClassCode: 'SE-2023-01', status: 'approved' },
    { studentUsername: '23020002', majorClassCode: 'SE-2023-01', status: 'pending' }, // 待审批
    { studentUsername: '23040001', majorClassCode: 'DS-2023-01', status: 'approved' },
    { studentUsername: '23040002', majorClassCode: 'DS-2023-01', status: 'removed' } // 已移除
  ],
  
  // 学生-课程班级关联
  studentCourseRelations: [
    { studentUsername: '23010001', courseClassCode: 'DS-2024-01', status: 'approved' },
    { studentUsername: '23010001', courseClassCode: 'OS-2024-01', status: 'approved' },
    { studentUsername: '23010002', courseClassCode: 'DS-2024-01', status: 'approved' },
    { studentUsername: '23010002', courseClassCode: 'CN-2024-01', status: 'pending' }, // 待审批
    { studentUsername: '23020001', courseClassCode: 'DB-2024-01', status: 'approved' },
    { studentUsername: '23020002', courseClassCode: 'DB-2024-01', status: 'approved' },
    { studentUsername: '23040001', courseClassCode: 'DB-2024-01', status: 'approved' }, // DB课程已满3人
    { studentUsername: '23040001', courseClassCode: 'PY-2024-01', status: 'approved' },
    { studentUsername: '23040002', courseClassCode: 'PY-2024-01', status: 'approved' },
    { studentUsername: '23040002', courseClassCode: 'DS-2024-01', status: 'removed' } // 已移除
  ]
};

async function initTestData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'student_management'
  });

  try {
    console.log('========================================');
    console.log('开始初始化测试数据...');
    console.log('========================================\n');

    // 1. 加密密码
    console.log('1. 加密密码...');
    const hashedPassword = await bcrypt.hash(TEST_DATA.passwords.default, 10);
    console.log('   密码加密完成\n');

    // 2. 清空现有数据
    console.log('2. 清空现有数据...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.execute('TRUNCATE TABLE student_course_class');
    await connection.execute('TRUNCATE TABLE student_major_class');
    await connection.execute('TRUNCATE TABLE course_class');
    await connection.execute('TRUNCATE TABLE major_class');
    await connection.execute('TRUNCATE TABLE password_reset');
    await connection.execute('TRUNCATE TABLE user');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('   数据清空完成\n');

    // 3. 插入用户数据
    console.log('3. 插入用户数据...');
    const userIdMap = {};
    for (const user of TEST_DATA.users) {
      const [result] = await connection.execute(
        `INSERT INTO user (username, password, real_name, employee_id, student_id, role, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user.username, hashedPassword, user.realName, user.employeeId || null, user.studentId || null, user.role, user.status]
      );
      userIdMap[user.username] = result.insertId;
    }
    console.log(`   插入 ${TEST_DATA.users.length} 条用户数据\n`);

    // 4. 插入专业班级数据
    console.log('4. 插入专业班级数据...');
    const majorClassIdMap = {};
    for (const mc of TEST_DATA.majorClasses) {
      const counselorId = mc.counselorUsername ? userIdMap[mc.counselorUsername] : null;
      const [result] = await connection.execute(
        `INSERT INTO major_class (name, code, counselor_id) VALUES (?, ?, ?)`,
        [mc.name, mc.code, counselorId]
      );
      majorClassIdMap[mc.code] = result.insertId;
    }
    console.log(`   插入 ${TEST_DATA.majorClasses.length} 条专业班级数据\n`);

    // 5. 插入课程班级数据
    console.log('5. 插入课程班级数据...');
    const courseClassIdMap = {};
    for (const cc of TEST_DATA.courseClasses) {
      const teacherId = userIdMap[cc.teacherUsername];
      const [result] = await connection.execute(
        `INSERT INTO course_class (name, code, teacher_id, max_students) VALUES (?, ?, ?, ?)`,
        [cc.name, cc.code, teacherId, cc.maxStudents]
      );
      courseClassIdMap[cc.code] = result.insertId;
    }
    console.log(`   插入 ${TEST_DATA.courseClasses.length} 条课程班级数据\n`);

    // 6. 插入学生-专业班级关联数据
    console.log('6. 插入学生-专业班级关联数据...');
    for (const rel of TEST_DATA.studentMajorRelations) {
      const studentId = userIdMap[rel.studentUsername];
      const majorClassId = majorClassIdMap[rel.majorClassCode];
      await connection.execute(
        `INSERT INTO student_major_class (student_id, major_class_id, status, approved_at) 
         VALUES (?, ?, ?, ?)`,
        [studentId, majorClassId, rel.status, rel.status === 'approved' ? new Date() : null]
      );
    }
    console.log(`   插入 ${TEST_DATA.studentMajorRelations.length} 条关联数据\n`);

    // 7. 插入学生-课程班级关联数据
    console.log('7. 插入学生-课程班级关联数据...');
    for (const rel of TEST_DATA.studentCourseRelations) {
      const studentId = userIdMap[rel.studentUsername];
      const courseClassId = courseClassIdMap[rel.courseClassCode];
      await connection.execute(
        `INSERT INTO student_course_class (student_id, course_class_id, status, approved_at) 
         VALUES (?, ?, ?, ?)`,
        [studentId, courseClassId, rel.status, rel.status === 'approved' ? new Date() : null]
      );
    }
    console.log(`   插入 ${TEST_DATA.studentCourseRelations.length} 条关联数据\n`);

    // 8. 重置自增ID
    console.log('8. 重置自增ID...');
    await connection.execute('ALTER TABLE user AUTO_INCREMENT = 100');
    await connection.execute('ALTER TABLE major_class AUTO_INCREMENT = 100');
    await connection.execute('ALTER TABLE course_class AUTO_INCREMENT = 100');
    console.log('   自增ID重置完成\n');

    // 9. 验证数据
    console.log('9. 验证数据...');
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM user');
    const [majorCount] = await connection.execute('SELECT COUNT(*) as count FROM major_class');
    const [courseCount] = await connection.execute('SELECT COUNT(*) as count FROM course_class');
    const [smcCount] = await connection.execute('SELECT COUNT(*) as count FROM student_major_class');
    const [sccCount] = await connection.execute('SELECT COUNT(*) as count FROM student_course_class');
    
    console.log(`   用户数量: ${userCount[0].count}`);
    console.log(`   专业班级数量: ${majorCount[0].count}`);
    console.log(`   课程班级数量: ${courseCount[0].count}`);
    console.log(`   学生-专业班级关联数量: ${smcCount[0].count}`);
    console.log(`   学生-课程班级关联数量: ${sccCount[0].count}`);

    console.log('\n========================================');
    console.log('测试数据初始化完成！');
    console.log('========================================\n');
    
    console.log('测试账号信息:');
    console.log('----------------------------------------');
    console.log('所有账号密码: 123456');
    console.log('----------------------------------------');
    console.log('管理员: admin');
    console.log('教师:   T202401, T202402, T202403(禁用)');
    console.log('辅导员: C202401, C202402, C202403(禁用)');
    console.log('学生:   23010001, 23010002, 23020001, 23020002');
    console.log('        23030001(未分配班级), 23030002(禁用)');
    console.log('        23040001, 23040002');
    console.log('----------------------------------------\n');

  } catch (error) {
    console.error('初始化失败:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// 导出测试数据配置供测试使用
module.exports = { TEST_DATA, initTestData };

// 如果直接运行此脚本
if (require.main === module) {
  initTestData().catch(console.error);
}