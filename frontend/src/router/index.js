import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store'
import { getToken } from '@/utils/token'

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { requiresAuth: false, title: '注册' }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/auth/ForgotPassword.vue'),
    meta: { requiresAuth: false, title: '忘记密码' }
  },
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人信息' }
      },
      {
        path: 'change-password',
        name: 'ChangePassword',
        component: () => import('@/views/ChangePassword.vue'),
        meta: { title: '修改密码' }
      },
      // 学生路由
      {
        path: 'student/my-classes',
        name: 'StudentMyClasses',
        component: () => import('@/views/student/MyClasses.vue'),
        meta: { title: '我的班级', roles: ['student'] }
      },
      {
        path: 'student/join-class',
        name: 'StudentJoinClass',
        component: () => import('@/views/student/JoinClass.vue'),
        meta: { title: '加入班级', roles: ['student'] }
      },
      // 教师路由
      {
        path: 'teacher/my-courses',
        name: 'TeacherMyCourses',
        component: () => import('@/views/teacher/MyCourses.vue'),
        meta: { title: '我的课程', roles: ['teacher'] }
      },
      {
        path: 'teacher/course-students/:id',
        name: 'TeacherCourseStudents',
        component: () => import('@/views/teacher/CourseStudents.vue'),
        meta: { title: '课程学生', roles: ['teacher'] }
      },
      // 辅导员路由
      {
        path: 'counselor/my-classes',
        name: 'CounselorMyClasses',
        component: () => import('@/views/counselor/MyClasses.vue'),
        meta: { title: '我的班级', roles: ['counselor'] }
      },
      {
        path: 'counselor/class-students/:id',
        name: 'CounselorClassStudents',
        component: () => import('@/views/counselor/ClassStudents.vue'),
        meta: { title: '班级学生', roles: ['counselor'] }
      },
      {
        path: 'counselor/create-student',
        name: 'CounselorCreateStudent',
        component: () => import('@/views/counselor/CreateStudent.vue'),
        meta: { title: '创建学生', roles: ['counselor'] }
      },
      // 管理员路由
      {
        path: 'admin/users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue'),
        meta: { title: '用户管理', roles: ['admin'] }
      },
      {
        path: 'admin/major-classes',
        name: 'AdminMajorClasses',
        component: () => import('@/views/admin/MajorClasses.vue'),
        meta: { title: '专业班级管理', roles: ['admin'] }
      },
      {
        path: 'admin/course-classes',
        name: 'AdminCourseClasses',
        component: () => import('@/views/admin/CourseClasses.vue'),
        meta: { title: '课程班级管理', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: { requiresAuth: false, title: '无权限' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { requiresAuth: false, title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 学生管理系统` : '学生管理系统'

  // 不需要认证的页面
  if (to.meta.requiresAuth === false) {
    // 已登录用户访问登录页，跳转到首页
    if (to.name === 'Login' && getToken()) {
      return next({ name: 'Home' })
    }
    return next()
  }

  // 检查登录状态
  const token = getToken()
  if (!token) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  // 获取用户信息
  const authStore = useAuthStore()
  if (!authStore.userInfo) {
    try {
      await authStore.fetchUserInfo()
    } catch (error) {
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }
  }

  // 检查角色权限
  const requiredRoles = to.meta.roles
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(authStore.userRole)) {
      return next({ name: 'Forbidden' })
    }
  }

  next()
})

export default router