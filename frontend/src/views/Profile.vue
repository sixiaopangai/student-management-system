<template>
  <div class="profile-page page-container">
    <h1 class="page-title">个人信息</h1>
    
    <el-card class="profile-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="profile-form"
      >
        <el-form-item label="用户名">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        
        <el-form-item label="角色">
          <el-tag :type="roleTagType">{{ roleName }}</el-tag>
        </el-form-item>
        
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="注册时间">
          <el-input :value="formatDate(userInfo?.createdAt)" disabled />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSave">
            保存修改
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store'
import { updateProfile } from '@/api/user'
import { RoleNames, RoleTagTypes } from '@/constants/roles'

const authStore = useAuthStore()

const formRef = ref(null)
const loading = ref(false)

const userInfo = computed(() => authStore.userInfo)
const roleName = computed(() => RoleNames[userInfo.value?.role] || '未知')
const roleTagType = computed(() => RoleTagTypes[userInfo.value?.role] || 'info')

const form = reactive({
  username: '',
  realName: '',
  email: '',
  phone: ''
})

const rules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

const initForm = () => {
  if (userInfo.value) {
    form.username = userInfo.value.username || ''
    form.realName = userInfo.value.realName || ''
    form.email = userInfo.value.email || ''
    form.phone = userInfo.value.phone || ''
  }
}

const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    await updateProfile({
      realName: form.realName,
      email: form.email,
      phone: form.phone
    })
    
    // 刷新用户信息
    await authStore.fetchUserInfo()
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  initForm()
}

onMounted(() => {
  initForm()
})
</script>

<style lang="scss" scoped>
.profile-page {
  .profile-card {
    max-width: 600px;
  }
  
  .profile-form {
    padding: 20px;
  }
}
</style>