<template>
  <el-container class="main-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo">
        <el-icon size="24"><School /></el-icon>
        <span v-show="!isCollapse" class="logo-text">学生管理系统</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>

        <!-- 学生菜单 -->
        <template v-if="userRole === 'student'">
          <el-menu-item index="/student/my-classes">
            <el-icon><Collection /></el-icon>
            <span>我的班级</span>
          </el-menu-item>
          <el-menu-item index="/student/join-class">
            <el-icon><Plus /></el-icon>
            <span>加入班级</span>
          </el-menu-item>
        </template>

        <!-- 教师菜单 -->
        <template v-if="userRole === 'teacher'">
          <el-menu-item index="/teacher/my-courses">
            <el-icon><Reading /></el-icon>
            <span>我的课程</span>
          </el-menu-item>
        </template>

        <!-- 辅导员菜单 -->
        <template v-if="userRole === 'counselor'">
          <el-menu-item index="/counselor/my-classes">
            <el-icon><OfficeBuilding /></el-icon>
            <span>我的班级</span>
          </el-menu-item>
          <el-menu-item index="/counselor/create-student">
            <el-icon><UserFilled /></el-icon>
            <span>创建学生</span>
          </el-menu-item>
        </template>

        <!-- 管理员菜单 -->
        <template v-if="userRole === 'admin'">
          <el-sub-menu index="admin">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/admin/users">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/major-classes">
              <el-icon><OfficeBuilding /></el-icon>
              <span>专业班级</span>
            </el-menu-item>
            <el-menu-item index="/admin/course-classes">
              <el-icon><Reading /></el-icon>
              <span>课程班级</span>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon 
            class="collapse-btn" 
            @click="isCollapse = !isCollapse"
          >
            <Expand v-if="isCollapse" />
            <Fold v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="$route.meta.title && $route.path !== '/'">
              {{ $route.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="username">{{ realName || username }}</span>
              <el-tag size="small" :type="roleTagType">{{ roleName }}</el-tag>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人信息
                </el-dropdown-item>
                <el-dropdown-item command="changePassword">
                  <el-icon><Lock /></el-icon>
                  修改密码
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/store'
import { RoleNames, RoleTagTypes } from '@/constants/roles'
import {
  HomeFilled,
  UserFilled,
  User,
  Lock,
  SwitchButton,
  Setting,
  Collection,
  Plus,
  Reading,
  OfficeBuilding,
  Expand,
  Fold,
  School
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isCollapse = ref(false)

const userRole = computed(() => authStore.userRole)
const username = computed(() => authStore.username)
const realName = computed(() => authStore.realName)
const roleName = computed(() => RoleNames[userRole.value] || '未知')
const roleTagType = computed(() => RoleTagTypes[userRole.value] || 'info')
const activeMenu = computed(() => route.path)

const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'changePassword':
      router.push('/change-password')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          type: 'warning'
        })
        await authStore.logout()
        router.push('/login')
      } catch (error) {
        // 用户取消
      }
      break
  }
}
</script>

<style lang="scss" scoped>
.main-layout {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    background-color: #263445;
    
    .logo-text {
      margin-left: 10px;
      white-space: nowrap;
    }
  }

  .sidebar-menu {
    border-right: none;
    background-color: #304156;
    
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      color: #bfcbd9;
      
      &:hover {
        background-color: #263445;
      }
    }
    
    :deep(.el-menu-item.is-active) {
      color: #409eff;
      background-color: #263445;
    }
  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 20px;

  .header-left {
    display: flex;
    align-items: center;
    
    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      margin-right: 15px;
      
      &:hover {
        color: #409eff;
      }
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      
      .username {
        margin: 0 10px;
        color: #333;
      }
    }
  }
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}

// 页面切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>