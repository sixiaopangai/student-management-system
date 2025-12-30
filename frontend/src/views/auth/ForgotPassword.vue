<template>
  <div class="forgot-container">
    <div class="forgot-card">
      <div class="forgot-header">
        <h1>忘记密码</h1>
        <p>通过邮箱重置您的密码</p>
      </div>
      
      <!-- 步骤1：发送验证码 -->
      <el-form
        v-if="step === 1"
        ref="emailFormRef"
        :model="emailForm"
        :rules="emailRules"
        class="forgot-form"
      >
        <el-form-item prop="email">
          <el-input
            v-model="emailForm.email"
            placeholder="请输入注册时使用的邮箱"
            prefix-icon="Message"
            size="large"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="submit-btn"
            @click="handleSendCode"
          >
            {{ loading ? '发送中...' : '发送验证码' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 步骤2：重置密码 -->
      <el-form
        v-else
        ref="resetFormRef"
        :model="resetForm"
        :rules="resetRules"
        class="forgot-form"
      >
        <el-form-item prop="code">
          <el-input
            v-model="resetForm.code"
            placeholder="请输入验证码"
            prefix-icon="Key"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="newPassword">
          <el-input
            v-model="resetForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="resetForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="submit-btn"
            @click="handleResetPassword"
          >
            {{ loading ? '重置中...' : '重置密码' }}
          </el-button>
        </el-form-item>
        
        <div class="resend-link">
          没有收到验证码？
          <el-button type="text" :disabled="countdown > 0" @click="handleSendCode">
            {{ countdown > 0 ? `${countdown}秒后重发` : '重新发送' }}
          </el-button>
        </div>
      </el-form>
      
      <div class="back-link">
        <router-link to="/login">
          <el-icon><ArrowLeft /></el-icon>
          返回登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { forgotPassword, resetPassword } from '@/api/auth'

const router = useRouter()

const step = ref(1)
const loading = ref(false)
const countdown = ref(0)
let timer = null

const emailFormRef = ref(null)
const resetFormRef = ref(null)

const emailForm = reactive({
  email: ''
})

const resetForm = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})

const emailRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== resetForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const resetRules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const startCountdown = () => {
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleSendCode = async () => {
  if (step.value === 1) {
    if (!emailFormRef.value) return
    try {
      await emailFormRef.value.validate()
    } catch {
      return
    }
  }
  
  try {
    loading.value = true
    const email = step.value === 1 ? emailForm.email : resetForm.email
    await forgotPassword({ email })
    ElMessage.success('验证码已发送到您的邮箱')
    
    if (step.value === 1) {
      resetForm.email = emailForm.email
      step.value = 2
    }
    startCountdown()
  } catch (error) {
    console.error('发送验证码失败:', error)
  } finally {
    loading.value = false
  }
}

const handleResetPassword = async () => {
  if (!resetFormRef.value) return
  
  try {
    await resetFormRef.value.validate()
    loading.value = true
    
    await resetPassword(resetForm)
    ElMessage.success('密码重置成功，请登录')
    router.push('/login')
  } catch (error) {
    console.error('重置密码失败:', error)
  } finally {
    loading.value = false
  }
}

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="scss" scoped>
.forgot-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.forgot-card {
  width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.forgot-header {
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

.forgot-form {
  .submit-btn {
    width: 100%;
  }
}

.resend-link {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.back-link {
  text-align: center;
  margin-top: 20px;
  
  a {
    display: inline-flex;
    align-items: center;
    color: #409eff;
    font-size: 14px;
    
    .el-icon {
      margin-right: 5px;
    }
  }
}
</style>