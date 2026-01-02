# 学生管理系统

一个基于前后端分离架构的学生管理系统，支持多角色权限管理。

## 技术栈

### 后端
- Node.js + Express
- MySQL 8.0
- JWT 认证
- bcrypt 密码加密

### 前端
- Vue 3 + Composition API
- Vite 构建工具
- Element Plus UI 组件库
- Pinia 状态管理
- Vue Router 路由管理
- Axios HTTP 客户端
- SCSS 样式预处理

## 功能特性

### 角色权限
- **学生 (student)**: 查看/申请加入班级、查看个人信息
- **教师 (teacher)**: 管理课程班级、审批学生加入申请
- **辅导员 (counselor)**: 管理专业班级、审批学生申请、创建学生账号
- **管理员 (admin)**: 系统管理、用户管理、班级管理

### 核心功能
- 用户认证（登录、注册、找回密码、记住密码）
- 用户管理（CRUD、批量操作）
- 专业班级管理（支持按辅导员姓名搜索）
- 课程班级管理（支持按教师姓名搜索）
- 学生选课/退课
- **审批功能**（学生申请加入班级需要审批）
- 班级成员管理

### 审批功能
- 学生申请加入班级后，状态为"待审批"
- 辅导员审批专业班级的学生申请
- 教师审批课程班级的学生申请
- 支持单个审批和批量审批
- 审批通过后学生正式加入班级

### 登录功能
- **记住密码**：勾选后，用户名和密码会保存在本地，下次打开自动填充
- **会话管理**：
  - 勾选"记住密码"：Token 存储在 localStorage，关闭浏览器后保持登录
  - 不勾选：Token 存储在 sessionStorage，关闭浏览器后需重新登录

## 项目结构

```
student-management-system/
├── backend/                 # 后端项目
│   ├── database/           # 数据库脚本
│   │   └── init.sql       # 初始化SQL
│   ├── scripts/            # 工具脚本
│   │   ├── init-db.js     # 数据库初始化脚本
│   │   └── verify-db.js   # 数据库验证脚本
│   ├── src/
│   │   ├── config/        # 配置文件
│   │   ├── controllers/   # 控制器
│   │   ├── middlewares/   # 中间件
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── services/      # 业务服务
│   │   ├── utils/         # 工具函数
│   │   └── app.js         # 应用入口
│   ├── .env.example       # 环境变量示例
│   └── package.json
├── frontend/               # 前端项目
│   ├── public/
│   ├── src/
│   │   ├── api/           # API 接口
│   │   ├── assets/        # 静态资源
│   │   ├── components/    # 公共组件
│   │   ├── constants/     # 常量定义
│   │   ├── layout/        # 布局组件
│   │   ├── router/        # 路由配置
│   │   ├── store/         # 状态管理
│   │   ├── styles/        # 全局样式
│   │   ├── utils/         # 工具函数
│   │   ├── views/         # 页面组件
│   │   ├── App.vue
│   │   └── main.js
│   ├── .env.example       # 环境变量示例
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── docs/                   # 项目文档
```

## 快速开始

### 环境要求
- Node.js >= 16.0
- MySQL >= 8.0
- npm 或 yarn

### 1. 克隆项目
```bash
git clone <repository-url>
cd student-management-system
```

### 2. 数据库初始化

**方式一：使用 Node.js 脚本（推荐）**
```bash
cd backend
npm install
npm run init-db
```

**方式二：使用 MySQL 命令行**
```bash
mysql -u root -p < backend/database/init.sql
```

### 3. 后端配置与启动
```bash
cd backend

# 安装依赖
npm install

# 复制环境变量配置
cp .env.example .env

# 编辑 .env 文件，配置数据库连接等信息

# 启动开发服务器
npm run dev
```

后端服务默认运行在 http://localhost:3000

### 4. 前端配置与启动
```bash
cd frontend

# 安装依赖
npm install

# 复制环境变量配置
cp .env.example .env

# 启动开发服务器
npm run dev
```

前端服务默认运行在 http://localhost:5173

## 测试数据

系统初始化后包含以下测试数据（所有账号密码均为 `123456`）：

### 用户账号

| 角色 | 数量 | 用户名示例 | 说明 |
|------|------|------------|------|
| 管理员 | 1 | admin | 系统管理员 |
| 教师 | 5 | T202401-T202405 | 王建国、李明华、张秀英(禁用)、刘德华、陈志强 |
| 辅导员 | 3 | C202401-C202403 | 张晓红、王丽娟、李国强(禁用) |
| 学生 | 42 | 23010001等 | 分布在5个专业班级 |

### 学生账号详情

| 专业班级 | 学号范围 | 人数 | 辅导员 |
|----------|----------|------|--------|
| 计算机科学与技术2023级1班 | 23010001-23010010 | 10 | 张晓红 |
| 软件工程2023级1班 | 23020001-23020010 | 10 | 张晓红 |
| 人工智能2023级1班 | 23030001-23030008 | 8 | 王丽娟 |
| 数据科学2023级1班 | 23040001-23040008 | 8 | 王丽娟 |
| 计算机科学与技术2024级1班 | 24010001-24010006 | 6 | 李国强 |

### 课程班级

| 课程名称 | 课程编码 | 授课教师 | 最大人数 |
|----------|----------|----------|----------|
| 数据结构与算法 | DS-2024-01 | 王建国 | 60 |
| 操作系统原理 | OS-2024-01 | 李明华 | 50 |
| 计算机网络 | CN-2024-01 | 刘德华 | 55 |
| 数据库系统 | DB-2024-01 | 陈志强 | 50 |
| 软件工程导论 | SE-2024-01 | 陈志强 | 45 |
| 机器学习基础 | ML-2024-01 | 王建国 | 40 |
| Python程序设计 | PY-2024-01 | 李明华 | 80 |
| Web开发技术 | WEB-2024-01 | 刘德华 | 50 |

### 禁用账号（用于测试）

以下账号为禁用状态，用于测试登录失败场景：
- T202403 (张秀英) - 教师
- C202403 (李国强) - 辅导员
- 23030002 (罗思琪) - 学生

### 编号规则

- **学号格式**：年级(2位) + 专业代码(2位) + 序号(4位)
  - 例：`23010001` = 23级 + 01专业 + 0001号
- **教师职工号格式**：T + 年份(4位) + 序号(2位)
  - 例：`T202401` = 2024年入职01号教师
- **辅导员职工号格式**：C + 年份(4位) + 序号(2位)
  - 例：`C202401` = 2024年入职01号辅导员

### 邮箱格式

- 学生：学号@stu.com（如 23010001@stu.com）
- 教师：职工号@teacher.com（如 T202401@teacher.com）
- 辅导员：职工号@counselor.com（如 C202401@counselor.com）

## API 文档

详细的 API 文档请参考 [接口说明文档](docs/学生管理系统_接口说明.md)

### 主要接口

#### 认证相关
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/logout` - 用户登出
- `GET /api/v1/auth/current-user` - 获取当前用户信息

#### 用户管理
- `GET /api/v1/users` - 获取用户列表
- `POST /api/v1/users` - 创建用户
- `PUT /api/v1/users/:id` - 更新用户
- `DELETE /api/v1/users/:id` - 删除用户

#### 专业班级
- `GET /api/v1/major-classes` - 获取班级列表（支持按辅导员姓名搜索）
- `POST /api/v1/major-classes` - 创建班级
- `PUT /api/v1/major-classes/:id` - 更新班级
- `DELETE /api/v1/major-classes/:id` - 删除班级

#### 课程班级
- `GET /api/v1/course-classes` - 获取课程列表（支持按教师姓名搜索）
- `POST /api/v1/course-classes` - 创建课程
- `PUT /api/v1/course-classes/:id` - 更新课程
- `DELETE /api/v1/course-classes/:id` - 删除课程

#### 辅导员专属
- `GET /api/v1/counselor/my-major-classes` - 获取我的班级
- `GET /api/v1/counselor/my-major-classes/:id/students` - 获取班级学生
- `PUT /api/v1/counselor/my-major-classes/:id/students/:studentId/approve` - 审批通过
- `PUT /api/v1/counselor/my-major-classes/:id/students/:studentId/reject` - 审批拒绝

#### 教师专属
- `GET /api/v1/teacher/my-course-classes` - 获取我的课程
- `GET /api/v1/teacher/my-course-classes/:id/students` - 获取课程学生

## 开发指南

### 代码规范
- 使用 ESLint 进行代码检查
- 遵循 Vue 3 Composition API 风格
- 使用 SCSS 编写样式

### 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

## 测试

### 运行测试
```bash
# 后端测试
cd backend && npm test

# 前端测试
cd frontend && npm test
```

### 测试报告
详细的测试报告请参考 [测试报告](docs/学生管理系统_测试报告.md)

## 部署

详细的部署说明请参考 [部署说明文档](docs/学生管理系统_部署说明.md)

### 生产环境构建

```bash
# 前端
cd frontend
npm run build
```

前端构建产物在 `frontend/dist` 目录，可部署到 Nginx 等静态服务器。

## 文档列表

| 文档 | 说明 |
|------|------|
| [项目需求说明](docs/学生管理系统_项目需求说明.md) | 项目需求和功能说明 |
| [技术选型说明](docs/学生管理系统_技术选型说明.md) | 技术栈选择说明 |
| [数据库设计](docs/学生管理系统_数据库设计.md) | 数据库表结构设计 |
| [接口说明](docs/学生管理系统_接口说明.md) | API 接口文档 |
| [权限与角色说明](docs/学生管理系统_权限与角色说明.md) | 角色权限设计 |
| [前端设计说明](docs/学生管理系统_前端设计说明.md) | 前端架构设计 |
| [部署说明](docs/学生管理系统_部署说明.md) | 部署指南 |
| [测试数据](docs/学生管理系统_测试数据.md) | 测试数据说明 |
| [测试报告](docs/学生管理系统_测试报告.md) | 测试结果报告 |
| [运行说明](docs/学生管理系统_运行说明.md) | 项目运行指南 |
| [变更记录](docs/学生管理系统_变更记录.md) | 版本变更历史 |

## 许可证

MIT License
