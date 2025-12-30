<template>
  <div class="my-classes-page page-container">
    <h1 class="page-title">我的班级</h1>
    
    <el-row :gutter="20" v-loading="loading">
      <el-col :span="8" v-for="item in classes" :key="item.id">
        <el-card class="class-card">
          <template #header>
            <div class="card-header">
              <span>{{ item.name }}</span>
              <el-tag size="small">{{ item.code }}</el-tag>
            </div>
          </template>
          
          <div class="class-stats">
            <div class="stat-item">
              <span class="stat-value">{{ item.studentCount }}</span>
              <span class="stat-label">学生人数</span>
            </div>
            <div class="stat-item" v-if="item.pendingCount > 0">
              <span class="stat-value text-warning">{{ item.pendingCount }}</span>
              <span class="stat-label">待审核</span>
            </div>
          </div>
          
          <p class="class-desc">{{ item.description || '暂无描述' }}</p>
          
          <div class="card-actions">
            <el-button type="primary" @click="viewStudents(item.id)">
              管理学生
            </el-button>
            <el-button @click="editClass(item)">编辑</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-empty v-if="!loading && classes.length === 0" description="您还没有负责的班级" />
    
    <!-- 编辑班级弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑班级" width="500px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="班级描述" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入班级描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { updateMajorClass } from '@/api/majorClass'

const router = useRouter()

const loading = ref(false)
const classes = ref([])
const editDialogVisible = ref(false)
const saving = ref(false)
const editFormRef = ref(null)
const currentClassId = ref(null)

const editForm = reactive({
  name: '',
  description: ''
})

const editRules = {
  name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }]
}

const loadClasses = async () => {
  loading.value = true
  try {
    classes.value = await request.get('/counselor/my-major-classes')
  } catch (error) {
    console.error('加载班级失败:', error)
  } finally {
    loading.value = false
  }
}

const viewStudents = (classId) => {
  router.push(`/counselor/class-students/${classId}`)
}

const editClass = (item) => {
  currentClassId.value = item.id
  editForm.name = item.name
  editForm.description = item.description
  editDialogVisible.value = true
}

const handleSave = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    saving.value = true
    
    await updateMajorClass(currentClassId.value, editForm)
    ElMessage.success('保存成功')
    editDialogVisible.value = false
    loadClasses()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadClasses()
})
</script>

<style lang="scss" scoped>
.my-classes-page {
  .class-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .class-stats {
      display: flex;
      gap: 30px;
      margin-bottom: 15px;
      padding: 15px;
      background-color: #f5f7fa;
      border-radius: 4px;
      
      .stat-item {
        text-align: center;
        
        .stat-value {
          display: block;
          font-size: 24px;
          font-weight: bold;
          color: #409eff;
          
          &.text-warning {
            color: #e6a23c;
          }
        }
        
        .stat-label {
          font-size: 12px;
          color: #999;
        }
      }
    }
    
    .class-desc {
      color: #666;
      font-size: 14px;
      margin-bottom: 15px;
      min-height: 40px;
    }
    
    .card-actions {
      display: flex;
      gap: 10px;
    }
  }
}
</style>