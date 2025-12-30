<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>学生管理系统</h1>
        <p>Student Management System</p>
      </div>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <div class="form-options">
            <el-checkbox v-model="form.rememberMe">记住我</el-checkbox>
            <router-link to="/forgot-password" class="forgot-link">
              忘记密码？
            </router-link>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
        
        <div class="register-link">
          还没有账号？
          <router-link to="/register">立即注册</router-link>
        </div>
      </el-form>
      
      <div class="demo-accounts">
        <el-divider>测试账号</el-divider>
        <div class="account-list">
          <el-tag @click="fillAccount('admin', 'admin123')">管理员</el-tag>
          <el-tag type="success" @click="fillAccount('teacher001', 'admin123')">教师</el-tag>
          <el-tag type="warning" @click="fillAccount('counselor001', 'admin123')">辅导员</el-tag>
          <el-tag type="info" @click="fillAccount('student001', 'admin123')">学生</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    await authStore.login(form)
    ElMessage.success('登录成功')
    
    // 跳转到之前的页面或首页
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

const fillAccount = (username, password) => {
  form.username = username
  form.password = password
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    font-size: 28px;
    color: #333;
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
    color: #999;
  }
}

.login-form {
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  .forgot-link {
    color: #409eff;
    font-size: 14px;
  }
  
  .login-btn {
    width: 100%;
  }
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: #666;
  
  a {
    color: #409eff;
  }
}

.demo-accounts {
  margin-top: 20px;
  
  .account-list {
    display: flex;
    justify-content: center;
    gap: 10px;
    
    .el-tag {
      cursor: pointer;
      
      &:hover {
        opacity: 0.8;
      }
    }
  }
}
</style>