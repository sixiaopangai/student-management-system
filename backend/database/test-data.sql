-- =====================================================
-- 学生管理系统测试数据初始化脚本
-- 执行前请确保数据库表结构已创建
-- =====================================================

-- 清空现有数据（按外键依赖顺序）
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE password_reset;
TRUNCATE TABLE student_course_class;
TRUNCATE TABLE student_major_class;
TRUNCATE TABLE course_class;
TRUNCATE TABLE major_class;
TRUNCATE TABLE user;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. 插入用户数据
-- 所有密码使用 bcrypt 加密
-- Admin@123 -> $2a$10$rDkPvvAFV8kqwvKJzwlBNOQZxjDZ5tY8CGHzUQBcmJFCpXnLnHwW2
-- Teacher@123 -> $2a$10$rDkPvvAFV8kqwvKJzwlBNOQZxjDZ5tY8CGHzUQBcmJFCpXnLnHwW2
-- Counselor@123 -> $2a$10$rDkPvvAFV8kqwvKJzwlBNOQZxjDZ5tY8CGHzUQBcmJFCpXnLnHwW2
-- Student@123 -> $2a$10$rDkPvvAFV8kqwvKJzwlBNOQZxjDZ5tY8CGHzUQBcmJFCpXnLnHwW2
-- 注：实际使用时需要用真实的bcrypt哈希值替换
-- =====================================================

-- 超级管理员 (ID: 1)
INSERT INTO `user` (`id`, `username`, `password`, `real_name`, `role`, `email`, `status`) VALUES
(1, 'admin', '$2a$10$rDkPvvAFV8kqwvKJzwlBNOQZxjDZ5tY8CGHzUQBcmJFCpXnLnHwW2', '系统管理员', 'admin', 'admin@admin.com', 'active');

-- 教师 (ID: 2-4)
INSERT INTO `user` (`id`, `username`, `password`, `real_name`, `employee_id`, `role`, `email`, `status`) VALUES
(2, 'T202401', '$2a$10$rDkPvvAFV8kqwvKJzwlBNOQZxjDZ5tY8CGHzUQBcmJFCpXnLnHwW2', '王建国', 'T202401', 'teacher', 'T202401@teacher.com', 'active'),
(3, 'T202402', '$2a$10$rDkPvvAFV8kqwvKJzwlBNOQZxjDZ5tY8CGHzUQBcmJFCpXnLnHwW2', '李明华', 'T202402', 'teacher', 'T202402@teacher.com', 'active'),
(4, 'T202403', '$2a$10$rDkPvvAFV8kqwvKJzwlBNOQZxjDZ5tY8CGHzUQBcmJFCpXnLnHwW2', '张伟', 'T202403', 'teacher', 'T202403@teacher.com', 'inactive');

-- 辅导员 (ID: 5-7)
INSERT INTO `user` (`id`, `username`, `password`, `real_name`, `employee_id`, `role`, `email`, `status`) VALUES
(5, 'C202401', '$2a$10$rDkPvvAFV8kqwvKJzwlBNOQZxjDZ5tY8CGHzUQBcmJFCpXnLnHwW2', '张晓红', 'C202401', 'counselor', 'C202401@counselor.com', 'active'),
(6, 'C202402', '$2a$10$rDkPvvAFV8kqwvKJzwlBNOQZxjDZ5tY8CGHzUQBcmJFCpXnLnHwW2', '刘芳', 'C202402', 'counselor', 'C202402@counselor.com', 'active'),
(7, 'C202403', '$2a$10$rDkPvvAFV8kqwvKJzwlBNOQZxjDZ5tY8CGHzUQBcmJFCpXnLnHwW2', '陈静', 'C202403', 'counselor', 'C202403@counselor.com', 'inactive');

-- 学生 (ID: 8-15)
INSERT INTO `user` (`id`, `username`, `password`, `real_name`, `student_id`, `role`, `email`, `status`) VALUES
(8, '23010001', '$2a$10$rDkPvvAFV8kqwvKJzwlBNOQZxjDZ5tY8CGHzUQBcmJFCpXnLnHwW2', '张三', '23010001', 'student', '23010001@stu.com', 'active'),
(9, '23010002', '$2a$10$rDkPvvAFV8kqwvKJzwlBNOQZxjDZ5tY8CGHzUQBcmJFCpXnLnHwW2', '李四', '23010002', 'student', '23010002@stu.com', 'active'),
(10, '23010003', '$2a$10$rDkPvvAFV8kqwvKJzwlBNOQZxjDZ5tY8CGHzUQBcmJFCpXnLnHwW2', '王五', '23010003', 'student', '23010003@stu.com', 'active'),
(11, '23020001', '$2a$10$rDkPvvAFV8kqwvKJzwlBNOQZxjDZ5tY8CGHzUQBcmJFCpXnLnHwW2', '赵六', '23020001', 'student', '23020001@stu.com', 'active'),
(12, '23020002', '$2a$10$rDkPvvAFV8kqwvKJzwlBNOQZxjDZ5tY8CGHzUQBcmJFCpXnLnHwW2', '钱七', '23020002', 'student', '23020002@stu.com', 'active'),
(13, '23030001', '$2a$10$rDkPvvAFV8kqwvKJzwlBNOQZxjDZ5tY8CGHzUQBcmJFCpXnLnHwW2', '孙八', '23030001', 'student', '23030001@stu.com', 'active'),
(14, '23030002', '$2a$10$rDkPvvAFV8kqwvKJzwlBNOQZxjDZ5tY8CGHzUQBcmJFCpXnLnHwW2', '周九', '23030002', 'student', '23030002@stu.com', 'inactive'),
(15, '24010001', '$2a$10$rDkPvvAFV8kqwvKJzwlBNOQZxjDZ5tY8CGHzUQBcmJFCpXnLnHwW2', '吴十', '24010001', 'student', '24010001@stu.com', 'active');

-- =====================================================
-- 2. 插入专业班级数据 (ID: 1-5)
-- =====================================================

INSERT INTO `major_class` (`id`, `name`, `code`, `counselor_id`, `description`, `status`) VALUES
(1, '计算机科学与技术2023级1班', 'CS-2023-01', 5, '计算机学院2023级计算机科学与技术专业1班', 'active'),
(2, '计算机科学与技术2023级2班', 'CS-2023-02', 5, '计算机学院2023级计算机科学与技术专业2班', 'active'),
(3, '软件工程2023级1班', 'SE-2023-01', 6, '计算机学院2023级软件工程专业1班', 'active'),
(4, '人工智能2023级1班', 'AI-2023-01', NULL, '计算机学院2023级人工智能专业1班', 'active'),
(5, '网络工程2022级1班', 'NE-2022-01', 5, '计算机学院2022级网络工程专业1班', 'inactive');

-- =====================================================
-- 3. 插入课程班级数据 (ID: 1-5)
-- =====================================================

INSERT INTO `course_class` (`id`, `name`, `code`, `teacher_id`, `description`, `max_students`, `status`) VALUES
(1, '数据结构与算法', 'DS-2024-01', 2, '计算机专业核心课程，讲授常用数据结构和算法设计', 50, 'active'),
(2, '操作系统原理', 'OS-2024-01', 2, '计算机专业核心课程，讲授操作系统基本原理', 45, 'active'),
(3, '计算机网络', 'CN-2024-01', 3, '计算机专业核心课程，讲授计算机网络基础', 40, 'active'),
(4, '数据库原理', 'DB-2024-01', 3, '计算机专业核心课程，讲授数据库设计与应用', 3, 'active'),
(5, '软件工程导论', 'SE-2024-01', 2, '软件工程专业课程，讲授软件工程基础', 30, 'inactive');

-- =====================================================
-- 4. 插入学生与专业班级关联数据
-- =====================================================

INSERT INTO `student_major_class` (`student_id`, `major_class_id`, `status`, `joined_at`) VALUES
(8, 1, 'approved', NOW()),   -- 张三 -> CS-2023-01
(9, 1, 'approved', NOW()),   -- 李四 -> CS-2023-01
(10, 2, 'approved', NOW()),  -- 王五 -> CS-2023-02
(11, 3, 'approved', NOW()),  -- 赵六 -> SE-2023-01
(12, 3, 'pending', NOW()),   -- 钱七 -> SE-2023-01 (待审核)
(15, 1, 'removed', NOW());   -- 吴十 -> CS-2023-01 (已移除)

-- 注：孙八(13)未分配专业班级，用于测试未分配场景

-- =====================================================
-- 5. 插入学生与课程班级关联数据
-- =====================================================

INSERT INTO `student_course_class` (`student_id`, `course_class_id`, `status`, `joined_at`) VALUES
(8, 1, 'approved', NOW()),   -- 张三 -> 数据结构与算法
(8, 2, 'approved', NOW()),   -- 张三 -> 操作系统原理
(9, 1, 'approved', NOW()),   -- 李四 -> 数据结构与算法
(10, 1, 'approved', NOW()),  -- 王五 -> 数据结构与算法
(11, 3, 'approved', NOW()),  -- 赵六 -> 计算机网络
(12, 4, 'approved', NOW()),  -- 钱七 -> 数据库原理
(15, 4, 'approved', NOW()),  -- 吴十 -> 数据库原理
(13, 4, 'approved', NOW()),  -- 孙八 -> 数据库原理 (课程已满，3人)
(9, 3, 'pending', NOW()),    -- 李四 -> 计算机网络 (待审核)
(10, 2, 'removed', NOW());   -- 王五 -> 操作系统原理 (已移除)

-- =====================================================
-- 重置自增ID
-- =====================================================

ALTER TABLE `user` AUTO_INCREMENT = 16;
ALTER TABLE `major_class` AUTO_INCREMENT = 6;
ALTER TABLE `course_class` AUTO_INCREMENT = 6;

-- =====================================================
-- 数据初始化完成
-- =====================================================

SELECT '测试数据初始化完成！' AS message;
SELECT '用户数量：' AS info, COUNT(*) AS count FROM user;
SELECT '专业班级数量：' AS info, COUNT(*) AS count FROM major_class;
SELECT '课程班级数量：' AS info, COUNT(*) AS count FROM course_class;
SELECT '学生-专业班级关联数量：' AS info, COUNT(*) AS count FROM student_major_class;
SELECT '学生-课程班级关联数量：' AS info, COUNT(*) AS count FROM student_course_class;