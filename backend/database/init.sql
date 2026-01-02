-- 学生管理系统数据库初始化脚本
-- 数据库: student_management
-- 字符集: utf8mb4
-- 排序规则: utf8mb4_general_ci

CREATE DATABASE IF NOT EXISTS `student_management` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `student_management`;

-- 删除已存在的表
DROP TABLE IF EXISTS `password_reset`;
DROP TABLE IF EXISTS `student_course_class`;
DROP TABLE IF EXISTS `student_major_class`;
DROP TABLE IF EXISTS `course_class`;
DROP TABLE IF EXISTS `major_class`;
DROP TABLE IF EXISTS `user`;

-- 用户表
CREATE TABLE `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `real_name` VARCHAR(100) NOT NULL,
  `employee_id` VARCHAR(20) DEFAULT NULL,
  `student_id` VARCHAR(20) DEFAULT NULL,
  `role` ENUM('student', 'teacher', 'counselor', 'admin') NOT NULL DEFAULT 'student',
  `email` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_username` (`username`),
  UNIQUE KEY `uk_user_email` (`email`),
  UNIQUE KEY `uk_user_employee_id` (`employee_id`),
  UNIQUE KEY `uk_user_student_id` (`student_id`),
  KEY `idx_user_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 专业班级表
CREATE TABLE `major_class` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `counselor_id` BIGINT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_major_class_code` (`code`),
  KEY `idx_major_class_counselor` (`counselor_id`),
  CONSTRAINT `fk_major_class_counselor` FOREIGN KEY (`counselor_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 课程班级表
CREATE TABLE `course_class` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `teacher_id` BIGINT NOT NULL,
  `description` TEXT DEFAULT NULL,
  `max_students` INT DEFAULT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_course_class_code` (`code`),
  KEY `idx_course_class_teacher` (`teacher_id`),
  CONSTRAINT `fk_course_class_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 学生专业班级关联表
CREATE TABLE `student_major_class` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `student_id` BIGINT NOT NULL,
  `major_class_id` BIGINT NOT NULL,
  `status` ENUM('pending', 'approved') NOT NULL DEFAULT 'approved',
  `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_at` DATETIME DEFAULT NULL,
  `approved_by` BIGINT DEFAULT NULL,
  `remark` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_major` (`student_id`, `major_class_id`),
  KEY `idx_smc_student` (`student_id`),
  KEY `idx_smc_major_class` (`major_class_id`),
  KEY `idx_smc_status` (`status`),
  CONSTRAINT `fk_smc_student` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_smc_major_class` FOREIGN KEY (`major_class_id`) REFERENCES `major_class` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_smc_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 学生课程班级关联表
CREATE TABLE `student_course_class` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `student_id` BIGINT NOT NULL,
  `course_class_id` BIGINT NOT NULL,
  `status` ENUM('pending', 'approved') NOT NULL DEFAULT 'approved',
  `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_at` DATETIME DEFAULT NULL,
  `approved_by` BIGINT DEFAULT NULL,
  `remark` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_course` (`student_id`, `course_class_id`),
  KEY `idx_scc_student` (`student_id`),
  KEY `idx_scc_course_class` (`course_class_id`),
  KEY `idx_scc_status` (`status`),
  CONSTRAINT `fk_scc_student` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_scc_course_class` FOREIGN KEY (`course_class_id`) REFERENCES `course_class` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_scc_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 密码重置记录表
CREATE TABLE `password_reset` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `code` VARCHAR(10) NOT NULL,
  `expired_at` DATETIME NOT NULL,
  `used` TINYINT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pr_user` (`user_id`),
  KEY `idx_pr_email_code` (`email`, `code`),
  CONSTRAINT `fk_pr_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 密码: 123456 的 bcrypt 哈希值
SET @pwd = '$2a$10$g0nop6H1OnSdDRkvh/iK3OK8mqaBdeQEptg/17GAutSz1e/SmSGN6';

-- 管理员 (ID: 1)
INSERT INTO `user` (`username`, `password`, `real_name`, `role`, `email`, `phone`, `status`) VALUES
('admin', @pwd, '系统管理员', 'admin', 'admin@admin.com', '13800000000', 'active');

-- 教师 (ID: 2-6)
INSERT INTO `user` (`username`, `password`, `real_name`, `employee_id`, `role`, `email`, `phone`, `status`) VALUES
('T202401', @pwd, '王建国', 'T202401', 'teacher', 'T202401@teacher.com', '13800000001', 'active'),
('T202402', @pwd, '李明华', 'T202402', 'teacher', 'T202402@teacher.com', '13800000002', 'active'),
('T202403', @pwd, '张秀英', 'T202403', 'teacher', 'T202403@teacher.com', '13800000003', 'inactive'),
('T202404', @pwd, '刘德华', 'T202404', 'teacher', 'T202404@teacher.com', '13800000004', 'active'),
('T202405', @pwd, '陈志强', 'T202405', 'teacher', 'T202405@teacher.com', '13800000005', 'active');

-- 辅导员 (ID: 7-9)
INSERT INTO `user` (`username`, `password`, `real_name`, `employee_id`, `role`, `email`, `phone`, `status`) VALUES
('C202401', @pwd, '张晓红', 'C202401', 'counselor', 'C202401@counselor.com', '13800000010', 'active'),
('C202402', @pwd, '王丽娟', 'C202402', 'counselor', 'C202402@counselor.com', '13800000011', 'active'),
('C202403', @pwd, '李国强', 'C202403', 'counselor', 'C202403@counselor.com', '13800000012', 'inactive');

-- 计算机科学与技术2023级1班学生 (ID: 10-19)
INSERT INTO `user` (`username`, `password`, `real_name`, `student_id`, `role`, `email`, `phone`, `status`) VALUES
('23010001', @pwd, '张三', '23010001', 'student', '23010001@stu.com', '13900000001', 'active'),
('23010002', @pwd, '李四', '23010002', 'student', '23010002@stu.com', '13900000002', 'active'),
('23010003', @pwd, '王五', '23010003', 'student', '23010003@stu.com', '13900000003', 'active'),
('23010004', @pwd, '赵六', '23010004', 'student', '23010004@stu.com', '13900000004', 'active'),
('23010005', @pwd, '钱七', '23010005', 'student', '23010005@stu.com', '13900000005', 'active'),
('23010006', @pwd, '孙八', '23010006', 'student', '23010006@stu.com', '13900000006', 'active'),
('23010007', @pwd, '周九', '23010007', 'student', '23010007@stu.com', '13900000007', 'active'),
('23010008', @pwd, '吴十', '23010008', 'student', '23010008@stu.com', '13900000008', 'active'),
('23010009', @pwd, '郑十一', '23010009', 'student', '23010009@stu.com', '13900000009', 'active'),
('23010010', @pwd, '冯十二', '23010010', 'student', '23010010@stu.com', '13900000010', 'active');

-- 软件工程2023级1班学生 (ID: 20-29)
INSERT INTO `user` (`username`, `password`, `real_name`, `student_id`, `role`, `email`, `phone`, `status`) VALUES
('23020001', @pwd, '陈小明', '23020001', 'student', '23020001@stu.com', '13900000011', 'active'),
('23020002', @pwd, '林小红', '23020002', 'student', '23020002@stu.com', '13900000012', 'active'),
('23020003', @pwd, '黄小华', '23020003', 'student', '23020003@stu.com', '13900000013', 'active'),
('23020004', @pwd, '杨小丽', '23020004', 'student', '23020004@stu.com', '13900000014', 'active'),
('23020005', @pwd, '朱小强', '23020005', 'student', '23020005@stu.com', '13900000015', 'active'),
('23020006', @pwd, '徐小军', '23020006', 'student', '23020006@stu.com', '13900000016', 'active'),
('23020007', @pwd, '马小芳', '23020007', 'student', '23020007@stu.com', '13900000017', 'active'),
('23020008', @pwd, '胡小伟', '23020008', 'student', '23020008@stu.com', '13900000018', 'active'),
('23020009', @pwd, '郭小敏', '23020009', 'student', '23020009@stu.com', '13900000019', 'active'),
('23020010', @pwd, '何小杰', '23020010', 'student', '23020010@stu.com', '13900000020', 'active');

-- 人工智能2023级1班学生 (ID: 30-37)
INSERT INTO `user` (`username`, `password`, `real_name`, `student_id`, `role`, `email`, `phone`, `status`) VALUES
('23030001', @pwd, '高志远', '23030001', 'student', '23030001@stu.com', '13900000021', 'active'),
('23030002', @pwd, '罗思琪', '23030002', 'student', '23030002@stu.com', '13900000022', 'inactive'),
('23030003', @pwd, '梁浩然', '23030003', 'student', '23030003@stu.com', '13900000023', 'active'),
('23030004', @pwd, '宋雨萱', '23030004', 'student', '23030004@stu.com', '13900000024', 'active'),
('23030005', @pwd, '唐子轩', '23030005', 'student', '23030005@stu.com', '13900000025', 'active'),
('23030006', @pwd, '许诗涵', '23030006', 'student', '23030006@stu.com', '13900000026', 'active'),
('23030007', @pwd, '韩明轩', '23030007', 'student', '23030007@stu.com', '13900000027', 'active'),
('23030008', @pwd, '冯雅琪', '23030008', 'student', '23030008@stu.com', '13900000028', 'active');

-- 数据科学2023级1班学生 (ID: 38-45)
INSERT INTO `user` (`username`, `password`, `real_name`, `student_id`, `role`, `email`, `phone`, `status`) VALUES
('23040001', @pwd, '邓子豪', '23040001', 'student', '23040001@stu.com', '13900000031', 'active'),
('23040002', @pwd, '萧雨晴', '23040002', 'student', '23040002@stu.com', '13900000032', 'active'),
('23040003', @pwd, '曹俊杰', '23040003', 'student', '23040003@stu.com', '13900000033', 'active'),
('23040004', @pwd, '彭欣怡', '23040004', 'student', '23040004@stu.com', '13900000034', 'active'),
('23040005', @pwd, '曾浩宇', '23040005', 'student', '23040005@stu.com', '13900000035', 'active'),
('23040006', @pwd, '蒋梦瑶', '23040006', 'student', '23040006@stu.com', '13900000036', 'active'),
('23040007', @pwd, '沈博文', '23040007', 'student', '23040007@stu.com', '13900000037', 'active'),
('23040008', @pwd, '韦诗雨', '23040008', 'student', '23040008@stu.com', '13900000038', 'active');

-- 计算机科学与技术2024级1班学生 (ID: 46-51)
INSERT INTO `user` (`username`, `password`, `real_name`, `student_id`, `role`, `email`, `phone`, `status`) VALUES
('24010001', @pwd, '刘一鸣', '24010001', 'student', '24010001@stu.com', '13900000041', 'active'),
('24010002', @pwd, '陈思雨', '24010002', 'student', '24010002@stu.com', '13900000042', 'active'),
('24010003', @pwd, '张伟杰', '24010003', 'student', '24010003@stu.com', '13900000043', 'active'),
('24010004', @pwd, '李雨桐', '24010004', 'student', '24010004@stu.com', '13900000044', 'active'),
('24010005', @pwd, '王子涵', '24010005', 'student', '24010005@stu.com', '13900000045', 'active'),
('24010006', @pwd, '赵雅琳', '24010006', 'student', '24010006@stu.com', '13900000046', 'active');

-- 专业班级 (ID: 1-6)
INSERT INTO `major_class` (`name`, `code`, `counselor_id`, `description`) VALUES
('计算机科学与技术2023级1班', 'CS-2023-01', 7, '计算机学院2023级计算机科学与技术专业1班'),
('软件工程2023级1班', 'SE-2023-01', 7, '计算机学院2023级软件工程专业1班'),
('人工智能2023级1班', 'AI-2023-01', 8, '计算机学院2023级人工智能专业1班'),
('数据科学2023级1班', 'DS-2023-01', 8, '计算机学院2023级数据科学专业1班'),
('计算机科学与技术2024级1班', 'CS-2024-01', 9, '计算机学院2024级计算机科学与技术专业1班'),
('网络工程2023级1班', 'NE-2023-01', 9, '计算机学院2023级网络工程专业1班');

-- 课程班级 (ID: 1-8)
INSERT INTO `course_class` (`name`, `code`, `teacher_id`, `description`, `max_students`) VALUES
('数据结构与算法', 'DS-2024-01', 2, '计算机专业核心课程，讲授常用数据结构和算法设计', 60),
('操作系统原理', 'OS-2024-01', 3, '计算机专业核心课程，讲授操作系统基本原理', 50),
('计算机网络', 'CN-2024-01', 4, '计算机专业核心课程，讲授网络协议和网络编程', 55),
('数据库系统', 'DB-2024-01', 5, '计算机专业核心课程，讲授数据库设计与SQL', 50),
('软件工程导论', 'SE-2024-01', 6, '软件工程专业基础课程，讲授软件开发方法论', 45),
('机器学习基础', 'ML-2024-01', 2, '人工智能专业核心课程，讲授机器学习算法', 40),
('Python程序设计', 'PY-2024-01', 3, '编程基础课程，讲授Python语言和编程思想', 80),
('Web开发技术', 'WEB-2024-01', 4, '实践课程，讲授前后端开发技术', 50);

-- 学生-专业班级关联（包含不同状态：pending待审批, approved已通过）
INSERT INTO `student_major_class` (`student_id`, `major_class_id`, `status`, `approved_at`) VALUES
-- 计算机科学与技术2023级1班 (已通过8人，待审批2人)
(10, 1, 'approved', NOW()), (11, 1, 'approved', NOW()), (12, 1, 'approved', NOW()),
(13, 1, 'approved', NOW()), (14, 1, 'approved', NOW()), (15, 1, 'approved', NOW()),
(16, 1, 'approved', NOW()), (17, 1, 'approved', NOW()),
(18, 1, 'pending', NULL), (19, 1, 'pending', NULL),
-- 软件工程2023级1班 (已通过8人，待审批2人)
(20, 2, 'approved', NOW()), (21, 2, 'approved', NOW()), (22, 2, 'approved', NOW()),
(23, 2, 'approved', NOW()), (24, 2, 'approved', NOW()), (25, 2, 'approved', NOW()),
(26, 2, 'approved', NOW()), (27, 2, 'approved', NOW()),
(28, 2, 'pending', NULL), (29, 2, 'pending', NULL),
-- 人工智能2023级1班 (已通过6人，待审批2人)
(30, 3, 'approved', NOW()), (31, 3, 'approved', NOW()), (32, 3, 'approved', NOW()),
(33, 3, 'approved', NOW()), (34, 3, 'approved', NOW()), (35, 3, 'approved', NOW()),
(36, 3, 'pending', NULL), (37, 3, 'pending', NULL),
-- 数据科学2023级1班 (已通过6人，待审批2人)
(38, 4, 'approved', NOW()), (39, 4, 'approved', NOW()), (40, 4, 'approved', NOW()),
(41, 4, 'approved', NOW()), (42, 4, 'approved', NOW()), (43, 4, 'approved', NOW()),
(44, 4, 'pending', NULL), (45, 4, 'pending', NULL),
-- 计算机科学与技术2024级1班 (已通过4人，待审批2人)
(46, 5, 'approved', NOW()), (47, 5, 'approved', NOW()), (48, 5, 'approved', NOW()),
(49, 5, 'approved', NOW()),
(50, 5, 'pending', NULL), (51, 5, 'pending', NULL);

-- 学生-课程班级关联（包含不同状态：pending待审批, approved已通过）
INSERT INTO `student_course_class` (`student_id`, `course_class_id`, `status`, `approved_at`) VALUES
-- 数据结构与算法 (教师: 王建国 T202401) - 已通过10人，待审批3人
(10, 1, 'approved', NOW()), (11, 1, 'approved', NOW()), (12, 1, 'approved', NOW()),
(13, 1, 'approved', NOW()), (15, 1, 'approved', NOW()), (17, 1, 'approved', NOW()),
(19, 1, 'approved', NOW()), (30, 1, 'approved', NOW()), (32, 1, 'approved', NOW()),
(36, 1, 'approved', NOW()),
(46, 1, 'pending', NULL), (47, 1, 'pending', NULL), (49, 1, 'pending', NULL),

-- 操作系统原理 (教师: 李明华 T202402) - 已通过6人，待审批2人
(10, 2, 'approved', NOW()), (12, 2, 'approved', NOW()), (14, 2, 'approved', NOW()),
(16, 2, 'approved', NOW()), (19, 2, 'approved', NOW()), (18, 2, 'approved', NOW()),
(20, 2, 'pending', NULL), (21, 2, 'pending', NULL),

-- 计算机网络 (教师: 刘德华 T202404) - 已通过5人，待审批2人
(11, 3, 'approved', NOW()), (14, 3, 'approved', NOW()), (17, 3, 'approved', NOW()),
(22, 3, 'approved', NOW()), (23, 3, 'approved', NOW()),
(24, 3, 'pending', NULL), (25, 3, 'pending', NULL),

-- 数据库系统 (教师: 陈志强 T202405) - 已通过8人，待审批3人
(12, 4, 'approved', NOW()), (15, 4, 'approved', NOW()), (18, 4, 'approved', NOW()),
(21, 4, 'approved', NOW()), (24, 4, 'approved', NOW()), (27, 4, 'approved', NOW()),
(34, 4, 'approved', NOW()), (38, 4, 'approved', NOW()),
(39, 4, 'pending', NULL), (40, 4, 'pending', NULL), (41, 4, 'pending', NULL),

-- 软件工程导论 (教师: 陈志强 T202405) - 已通过7人，待审批2人
(20, 5, 'approved', NOW()), (21, 5, 'approved', NOW()), (22, 5, 'approved', NOW()),
(23, 5, 'approved', NOW()), (25, 5, 'approved', NOW()), (27, 5, 'approved', NOW()),
(29, 5, 'approved', NOW()),
(28, 5, 'pending', NULL), (26, 5, 'pending', NULL),

-- 机器学习基础 (教师: 王建国 T202401) - 已通过8人，待审批4人
(30, 6, 'approved', NOW()), (31, 6, 'approved', NOW()), (32, 6, 'approved', NOW()),
(33, 6, 'approved', NOW()), (34, 6, 'approved', NOW()), (35, 6, 'approved', NOW()),
(38, 6, 'approved', NOW()), (40, 6, 'approved', NOW()),
(36, 6, 'pending', NULL), (37, 6, 'pending', NULL), (42, 6, 'pending', NULL), (43, 6, 'pending', NULL),

-- Python程序设计 (教师: 李明华 T202402) - 已通过15人，待审批5人
(10, 7, 'approved', NOW()), (11, 7, 'approved', NOW()), (13, 7, 'approved', NOW()),
(16, 7, 'approved', NOW()), (18, 7, 'approved', NOW()), (20, 7, 'approved', NOW()),
(22, 7, 'approved', NOW()), (24, 7, 'approved', NOW()), (26, 7, 'approved', NOW()),
(28, 7, 'approved', NOW()), (29, 7, 'approved', NOW()), (30, 7, 'approved', NOW()),
(31, 7, 'approved', NOW()), (33, 7, 'approved', NOW()), (35, 7, 'approved', NOW()),
(37, 7, 'pending', NULL), (38, 7, 'pending', NULL), (39, 7, 'pending', NULL),
(41, 7, 'pending', NULL), (44, 7, 'pending', NULL),

-- Web开发技术 (教师: 刘德华 T202404) - 已通过6人，待审批3人
(20, 8, 'approved', NOW()), (21, 8, 'approved', NOW()), (23, 8, 'approved', NOW()),
(25, 8, 'approved', NOW()), (26, 8, 'approved', NOW()), (28, 8, 'approved', NOW()),
(48, 8, 'pending', NULL), (50, 8, 'pending', NULL), (27, 8, 'pending', NULL);

SELECT '数据库初始化完成！' AS message;