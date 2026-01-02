<template>
  <div class="create-student-page page-container">
    <h1 class="page-title">创建学生账号</h1>
    
    <el-tabs v-model="activeTab">
      <!-- 单个创建 -->
      <el-tab-pane label="单个创建" name="single">
        <el-card class="form-card">
          <el-form
            ref="singleFormRef"
            :model="singleForm"
            :rules="singleRules"
            label-width="100px"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="singleForm.username" placeholder="请输入用户名（学号）" />
            </el-form-item>
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="singleForm.realName" placeholder="请输入真实姓名" />
            </el-form-item>
            <el-form-item label="初始密码" prop="password">
              <el-input v-model="singleForm.password" placeholder="请输入初始密码" show-password />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="singleForm.email" placeholder="请输入邮箱（可选）" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="singleForm.phone" placeholder="请输入手机号（可选）" />
            </el-form-item>
            <el-form-item label="加入班级" prop="majorClassId">
              <el-select v-model="singleForm.majorClassId" placeholder="选择专业班级（可选）" clearable>
                <el-option
                  v-for="item in myClasses"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="creating" @click="handleCreateSingle">
                创建学生
              </el-button>
              <el-button @click="resetSingleForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <!-- 批量创建 -->
      <el-tab-pane label="批量创建" name="batch">
        <el-card class="form-card">
          <el-alert
            title="批量创建说明"
            type="info"
            :closable="false"
            class="mb-20"
          >
            <template #default>
              <p>1. 每行一个学生，格式：用户名,姓名,密码</p>
              <p>2. 例如：student001,张三,123456</p>
              <p>3. 单次最多创建100个学生</p>
            </template>
          </el-alert>
          
          <el-form label-width="100px">
            <el-form-item label="加入班级">
              <el-select v-model="batchForm.majorClassId" placeholder="选择专业班级（可选）" clearable>
                <el-option
                  v-for="item in myClasses"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="学生数据">
              <el-input
                v-model="batchForm.data"
                type="textarea"
                :rows="10"
                placeholder="请输入学生数据，每行一个学生&#10;格式：用户名,姓名,密码&#10;例如：&#10;student001,张三,123456&#10;student002,李四,123456"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="batchCreating" @click="handleCreateBatch">
                批量创建
              </el-button>
              <el-button @click="batchForm.data = ''">清空</el-button>
            </el-form-item>
          </el-form>
          
          <!-- 批量创建结果 -->
          <div v-if="batchResult" class="batch-result">
            <el-divider>创建结果</el-divider>
            <el-alert
              :title="`成功 ${batchResult.success} 个，失败 ${batchResult.failed} 个`"
              :type="batchResult.failed > 0 ? 'warning' : 'success'"
              :closable="false"
            />
            <el-table v-if="batchResult.results" :data="batchResult.results" class="mt-20">
              <el-table-column prop="username" label="用户名" width="150" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                    {{ row.status === 'success' ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="说明">
                <template #default="{ row }">
                  {{ row.status === 'success' ? `ID: ${row.id}` : row.error?.message }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const activeTab = ref('single')
const myClasses = ref([])
const creating = ref(false)
const batchCreating = ref(false)
const batchResult = ref(null)

const singleFormRef = ref(null)
const singleForm = reactive({
  username: '',
  realName: '',
  password: '',
  email: '',
  phone: '',
  majorClassId: null
})

const singleRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
  ]
}

const batchForm = reactive({
  majorClassId: null,
  data: ''
})

const loadMyClasses = async () => {
  try {
    myClasses.value = await request.get('/counselor/my-major-classes')
  } catch (error) {
    console.error('加载班级失败:', error)
  }
}

const handleCreateSingle = async () => {
  if (!singleFormRef.value) return
  
  try {
    await singleFormRef.value.validate()
    creating.value = true
    
    await request.post('/counselor/create-student', singleForm)
    ElMessage.success('创建成功')
    resetSingleForm()
  } catch (error) {
    console.error('创建失败:', error)
  } finally {
    creating.value = false
  }
}

const resetSingleForm = () => {
  singleForm.username = ''
  singleForm.realName = ''
  singleForm.password = ''
  singleForm.email = ''
  singleForm.phone = ''
  singleForm.majorClassId = null
  singleFormRef.value?.resetFields()
}

const handleCreateBatch = async () => {
  if (!batchForm.data.trim()) {
    ElMessage.warning('请输入学生数据')
    return
  }
  
  // 解析数据
  const lines = batchForm.data.trim().split('\n')
  const students = []
  
  for (const line of lines) {
    const parts = line.trim().split(',')
    if (parts.length >= 3) {
      students.push({
        username: parts[0].trim(),
        realName: parts[1].trim(),
        password: parts[2].trim()
      })
    }
  }
  
  if (students.length === 0) {
    ElMessage.warning('未解析到有效的学生数据')
    return
  }
  
  if (students.length > 100) {
    ElMessage.warning('单次最多创建100个学生')
    return
  }
  
  try {
    batchCreating.value = true
    batchResult.value = null
    
    const result = await request.post('/counselor/batch-create-students', {
      students,
      majorClassId: batchForm.majorClassId
    })
    
    batchResult.value = result
    
    if (result.failed > 0) {
      ElMessage.warning(`创建完成：成功 ${result.success} 个，失败 ${result.failed} 个`)
    } else {
      ElMessage.success(`成功创建 ${result.success} 个学生`)
    }
  } catch (error) {
    console.error('批量创建失败:', error)
  } finally {
    batchCreating.value = false
  }
}

onMounted(() => {
  loadMyClasses()
})
</script>

<style lang="scss" scoped>
.create-student-page {
  .form-card {
    max-width: 700px;
  }
  
  .batch-result {
    margin-top: 20px;
  }
}
</style>