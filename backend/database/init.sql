-- 学生管理系统数据库初始化脚本
-- 数据库: student_management
-- 字符集: utf8mb4
-- 排序规则: utf8mb4_general_ci

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `student_management` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_general_ci;

USE `student_management`;

-- =====================================================
-- 1. 用户表 (user)
-- =====================================================
DROP TABLE IF EXISTS `password_reset`;
DROP TABLE IF EXISTS `student_course_class`;
DROP TABLE IF EXISTS `student_major_class`;
DROP TABLE IF EXISTS `course_class`;
DROP TABLE IF EXISTS `major_class`;
DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加密）',
  `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
  `role` ENUM('student', 'teacher', 'counselor', 'admin') NOT NULL DEFAULT 'student' COMMENT '角色',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `status` ENUM('active', 'inactive', 'locked') NOT NULL DEFAULT 'active' COMMENT '状态',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_username` (`username`),
  UNIQUE KEY `uk_user_email` (`email`),
  KEY `idx_user_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户表';

-- =====================================================
-- 2. 专业班级表 (major_class)
-- =====================================================
CREATE TABLE `major_class` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` VARCHAR(100) NOT NULL COMMENT '班级名称',
  `code` VARCHAR(50) NOT NULL COMMENT '班级编码',
  `counselor_id` BIGINT DEFAULT NULL COMMENT '辅导员ID',
  `description` TEXT DEFAULT NULL COMMENT '班级描述',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT '状态',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_major_class_code` (`code`),
  KEY `idx_major_class_counselor` (`counselor_id`),
  CONSTRAINT `fk_major_class_counselor` FOREIGN KEY (`counselor_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='专业班级表';

-- =====================================================
-- 3. 课程班级表 (course_class)
-- =====================================================
CREATE TABLE `course_class` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` VARCHAR(100) NOT NULL COMMENT '课程名称',
  `code` VARCHAR(50) NOT NULL COMMENT '课程编码',
  `teacher_id` BIGINT NOT NULL COMMENT '授课教师ID',
  `description` TEXT DEFAULT NULL COMMENT '课程描述',
  `max_students` INT DEFAULT NULL COMMENT '最大学生数',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT '状态',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_course_class_code` (`code`),
  KEY `idx_course_class_teacher` (`teacher_id`),
  CONSTRAINT `fk_course_class_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='课程班级表';

-- =====================================================
-- 4. 学生专业班级关联表 (student_major_class)
-- =====================================================
CREATE TABLE `student_major_class` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `student_id` BIGINT NOT NULL COMMENT '学生ID',
  `major_class_id` BIGINT NOT NULL COMMENT '专业班级ID',
  `status` ENUM('pending', 'approved', 'rejected', 'removed') NOT NULL DEFAULT 'approved' COMMENT '关联状态',
  `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  `approved_at` DATETIME DEFAULT NULL COMMENT '审核通过时间',
  `approved_by` BIGINT DEFAULT NULL COMMENT '审核人ID',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注信息',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_major` (`student_id`, `major_class_id`),
  KEY `idx_smc_student` (`student_id`),
  KEY `idx_smc_major_class` (`major_class_id`),
  KEY `idx_smc_status` (`status`),
  CONSTRAINT `fk_smc_student` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_smc_major_class` FOREIGN KEY (`major_class_id`) REFERENCES `major_class` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_smc_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='学生专业班级关联表';

-- =====================================================
-- 5. 学生课程班级关联表 (student_course_class)
-- =====================================================
CREATE TABLE `student_course_class` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `student_id` BIGINT NOT NULL COMMENT '学生ID',
  `course_class_id` BIGINT NOT NULL COMMENT '课程班级ID',
  `status` ENUM('pending', 'approved', 'rejected', 'removed') NOT NULL DEFAULT 'approved' COMMENT '关联状态',
  `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  `approved_at` DATETIME DEFAULT NULL COMMENT '审核通过时间',
  `approved_by` BIGINT DEFAULT NULL COMMENT '审核人ID',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注信息',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_course` (`student_id`, `course_class_id`),
  KEY `idx_scc_student` (`student_id`),
  KEY `idx_scc_course_class` (`course_class_id`),
  KEY `idx_scc_status` (`status`),
  CONSTRAINT `fk_scc_student` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_scc_course_class` FOREIGN KEY (`course_class_id`) REFERENCES `course_class` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_scc_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='学生课程班级关联表';

-- =====================================================
-- 6. 密码重置记录表 (password_reset)
-- =====================================================
CREATE TABLE `password_reset` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `email` VARCHAR(100) NOT NULL COMMENT '邮箱',
  `code` VARCHAR(10) NOT NULL COMMENT '验证码',
  `expired_at` DATETIME NOT NULL COMMENT '过期时间',
  `used` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已使用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_pr_user` (`user_id`),
  KEY `idx_pr_email_code` (`email`, `code`),
  CONSTRAINT `fk_pr_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='密码重置记录表';

-- =====================================================
-- 初始化数据
-- =====================================================

-- 插入管理员账号 (密码: admin123)
-- 密码使用 bcrypt 加密，这里是 'admin123' 的加密结果
INSERT INTO `user` (`username`, `password`, `real_name`, `role`, `email`, `status`)
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '系统管理员', 'admin', 'admin@example.com', 'active');

-- 插入测试教师
INSERT INTO `user` (`username`, `password`, `real_name`, `role`, `email`, `status`)
VALUES 
('teacher001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '王老师', 'teacher', 'teacher001@example.com', 'active'),
('teacher002', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '李老师', 'teacher', 'teacher002@example.com', 'active');

-- 插入测试辅导员
INSERT INTO `user` (`username`, `password`, `real_name`, `role`, `email`, `status`)
VALUES 
('counselor001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '张辅导员', 'counselor', 'counselor001@example.com', 'active');

-- 插入测试学生
INSERT INTO `user` (`username`, `password`, `real_name`, `role`, `email`, `status`)
VALUES 
('student001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '张三', 'student', 'student001@example.com', 'active'),
('student002', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '李四', 'student', 'student002@example.com', 'active'),
('student003', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '王五', 'student', 'student003@example.com', 'active');

-- 插入测试专业班级
INSERT INTO `major_class` (`name`, `code`, `counselor_id`, `description`)
VALUES 
('计算机科学与技术2024级1班', 'CS2024-01', 4, '计算机学院2024级本科1班'),
('软件工程2024级1班', 'SE2024-01', 4, '软件学院2024级本科1班');

-- 插入测试课程班级
INSERT INTO `course_class` (`name`, `code`, `teacher_id`, `description`, `max_students`)
VALUES 
('数据结构与算法', 'CS101-2024', 2, '计算机专业核心课程', 50),
('操作系统原理', 'CS102-2024', 3, '计算机专业核心课程', 45);

-- 插入学生与专业班级关联
INSERT INTO `student_major_class` (`student_id`, `major_class_id`, `status`, `approved_at`)
VALUES 
(5, 1, 'approved', NOW()),
(6, 1, 'approved', NOW()),
(7, 2, 'approved', NOW());

-- 插入学生与课程班级关联
INSERT INTO `student_course_class` (`student_id`, `course_class_id`, `status`, `approved_at`)
VALUES 
(5, 1, 'approved', NOW()),
(5, 2, 'approved', NOW()),
(6, 1, 'approved', NOW()),
(7, 1, 'approved', NOW());

-- =====================================================
-- 完成
-- =====================================================
SELECT '数据库初始化完成！' AS message;
SELECT '测试账号信息：' AS info;
SELECT '管理员: admin / admin123' AS account;
SELECT '教师: teacher001 / admin123, teacher002 / admin123' AS account;
SELECT '辅导员: counselor001 / admin123' AS account;
SELECT '学生: student001 / admin123, student002 / admin123, student003 / admin123' AS account;