<template>
  <div class="home-page">
    <div class="welcome-section">
      <h1>欢迎使用学生管理系统</h1>
      <p>您好，{{ realName || username }}！您当前的角色是：{{ roleName }}</p>
    </div>

    <el-row :gutter="20" class="stats-row">
      <!-- 学生统计卡片 -->
      <el-col :span="6" v-if="userRole === 'student'">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #409eff;">
            <el-icon size="32"><OfficeBuilding /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ studentStats.majorClass || '未加入' }}</div>
            <div class="stat-label">专业班级</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6" v-if="userRole === 'student'">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #67c23a;">
            <el-icon size="32"><Reading /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ studentStats.courseCount }}</div>
            <div class="stat-label">已选课程</div>
          </div>
        </div>
      </el-col>

      <!-- 教师统计卡片 -->
      <el-col :span="6" v-if="userRole === 'teacher'">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #409eff;">
            <el-icon size="32"><Reading /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ teacherStats.courseCount }}</div>
            <div class="stat-label">负责课程</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6" v-if="userRole === 'teacher'">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #67c23a;">
            <el-icon size="32"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ teacherStats.studentCount }}</div>
            <div class="stat-label">学生总数</div>
          </div>
        </div>
      </el-col>

      <!-- 辅导员统计卡片 -->
      <el-col :span="6" v-if="userRole === 'counselor'">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #409eff;">
            <el-icon size="32"><OfficeBuilding /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ counselorStats.classCount }}</div>
            <div class="stat-label">负责班级</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6" v-if="userRole === 'counselor'">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #67c23a;">
            <el-icon size="32"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ counselorStats.studentCount }}</div>
            <div class="stat-label">学生总数</div>
          </div>
        </div>
      </el-col>

      <!-- 管理员统计卡片 -->
      <el-col :span="6" v-if="userRole === 'admin'">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #409eff;">
            <el-icon size="32"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ adminStats.userCount }}</div>
            <div class="stat-label">用户总数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6" v-if="userRole === 'admin'">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #67c23a;">
            <el-icon size="32"><OfficeBuilding /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ adminStats.majorClassCount }}</div>
            <div class="stat-label">专业班级</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6" v-if="userRole === 'admin'">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #e6a23c;">
            <el-icon size="32"><Reading /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ adminStats.courseClassCount }}</div>
            <div class="stat-label">课程班级</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="quick-actions">
      <h2>快捷操作</h2>
      <el-row :gutter="20">
        <!-- 学生快捷操作 -->
        <template v-if="userRole === 'student'">
          <el-col :span="6">
            <el-card class="action-card" @click="$router.push('/student/my-classes')">
              <el-icon size="40"><Collection /></el-icon>
              <span>查看我的班级</span>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="action-card" @click="$router.push('/student/join-class')">
              <el-icon size="40"><Plus /></el-icon>
              <span>加入新班级</span>
            </el-card>
          </el-col>
        </template>

        <!-- 教师快捷操作 -->
        <template v-if="userRole === 'teacher'">
          <el-col :span="6">
            <el-card class="action-card" @click="$router.push('/teacher/my-courses')">
              <el-icon size="40"><Reading /></el-icon>
              <span>管理我的课程</span>
            </el-card>
          </el-col>
        </template>

        <!-- 辅导员快捷操作 -->
        <template v-if="userRole === 'counselor'">
          <el-col :span="6">
            <el-card class="action-card" @click="$router.push('/counselor/my-classes')">
              <el-icon size="40"><OfficeBuilding /></el-icon>
              <span>管理我的班级</span>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="action-card" @click="$router.push('/counselor/create-student')">
              <el-icon size="40"><UserFilled /></el-icon>
              <span>创建学生账号</span>
            </el-card>
          </el-col>
        </template>

        <!-- 管理员快捷操作 -->
        <template v-if="userRole === 'admin'">
          <el-col :span="6">
            <el-card class="action-card" @click="$router.push('/admin/users')">
              <el-icon size="40"><User /></el-icon>
              <span>用户管理</span>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="action-card" @click="$router.push('/admin/major-classes')">
              <el-icon size="40"><OfficeBuilding /></el-icon>
              <span>专业班级管理</span>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="action-card" @click="$router.push('/admin/course-classes')">
              <el-icon size="40"><Reading /></el-icon>
              <span>课程班级管理</span>
            </el-card>
          </el-col>
        </template>

        <!-- 通用操作 -->
        <el-col :span="6">
          <el-card class="action-card" @click="$router.push('/profile')">
            <el-icon size="40"><Setting /></el-icon>
            <span>个人设置</span>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store'
import { RoleNames } from '@/constants/roles'
import { getStats } from '@/api/user'
import { getMyMajorClass, getMyCourseClasses } from '@/api/student'
import { getMyMajorClasses } from '@/api/counselor'
import { getMyCourseClasses as getTeacherCourseClasses } from '@/api/teacher'
import {
  User,
  UserFilled,
  OfficeBuilding,
  Reading,
  Collection,
  Plus,
  Setting
} from '@element-plus/icons-vue'

const authStore = useAuthStore()

const userRole = computed(() => authStore.userRole)
const username = computed(() => authStore.username)
const realName = computed(() => authStore.realName)
const roleName = computed(() => RoleNames[userRole.value] || '未知')

// 统计数据
const studentStats = ref({
  majorClass: '',
  courseCount: 0
})

const teacherStats = ref({
  courseCount: 0,
  studentCount: 0
})

const counselorStats = ref({
  classCount: 0,
  studentCount: 0
})

const adminStats = ref({
  userCount: 0,
  majorClassCount: 0,
  courseClassCount: 0
})

const loadStats = async () => {
  try {
    if (userRole.value === 'admin') {
      const data = await getStats()
      adminStats.value = {
        userCount: data.userCount || 0,
        majorClassCount: data.majorClassCount || 0,
        courseClassCount: data.courseClassCount || 0
      }
    } else if (userRole.value === 'student') {
      // 加载学生统计数据
      try {
        const majorClass = await getMyMajorClass()
        studentStats.value.majorClass = majorClass?.name || '未加入'
      } catch (e) {
        studentStats.value.majorClass = '未加入'
      }
      
      try {
        const courseClasses = await getMyCourseClasses()
        studentStats.value.courseCount = Array.isArray(courseClasses) ? courseClasses.length : 0
      } catch (e) {
        studentStats.value.courseCount = 0
      }
    } else if (userRole.value === 'teacher') {
      // 加载教师统计数据
      try {
        const courseClasses = await getTeacherCourseClasses()
        teacherStats.value.courseCount = Array.isArray(courseClasses) ? courseClasses.length : 0
        // 计算学生总数
        let totalStudents = 0
        if (Array.isArray(courseClasses)) {
          courseClasses.forEach(c => {
            totalStudents += c.studentCount || 0
          })
        }
        teacherStats.value.studentCount = totalStudents
      } catch (e) {
        teacherStats.value.courseCount = 0
        teacherStats.value.studentCount = 0
      }
    } else if (userRole.value === 'counselor') {
      // 加载辅导员统计数据
      try {
        const majorClasses = await getMyMajorClasses()
        counselorStats.value.classCount = Array.isArray(majorClasses) ? majorClasses.length : 0
        // 计算学生总数
        let totalStudents = 0
        if (Array.isArray(majorClasses)) {
          majorClasses.forEach(c => {
            totalStudents += c.studentCount || 0
          })
        }
        counselorStats.value.studentCount = totalStudents
      } catch (e) {
        counselorStats.value.classCount = 0
        counselorStats.value.studentCount = 0
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style lang="scss" scoped>
.home-page {
  .welcome-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 40px;
    border-radius: 8px;
    margin-bottom: 20px;
    
    h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }
    
    p {
      font-size: 16px;
      opacity: 0.9;
    }
  }

  .stats-row {
    margin-bottom: 30px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    
    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      margin-right: 15px;
    }
    
    .stat-info {
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #333;
      }
      
      .stat-label {
        font-size: 14px;
        color: #999;
        margin-top: 5px;
      }
    }
  }

  .quick-actions {
    h2 {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }
    
    .action-card {
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
      }
      
      :deep(.el-card__body) {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 30px 20px;
      }
      
      .el-icon {
        color: #409eff;
        margin-bottom: 15px;
      }
      
      span {
        font-size: 14px;
        color: #333;
      }
    }
  }
}
</style>