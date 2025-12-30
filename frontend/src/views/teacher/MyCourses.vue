<template>
  <div class="my-courses-page page-container">
    <h1 class="page-title">我的课程</h1>
    
    <el-row :gutter="20" v-loading="loading">
      <el-col :span="8" v-for="course in courses" :key="course.id">
        <el-card class="course-card">
          <template #header>
            <div class="card-header">
              <span>{{ course.name }}</span>
              <el-tag size="small">{{ course.code }}</el-tag>
            </div>
          </template>
          
          <div class="course-stats">
            <div class="stat-item">
              <span class="stat-value">{{ course.studentCount }}</span>
              <span class="stat-label">已选学生</span>
            </div>
            <div class="stat-item" v-if="course.maxStudents">
              <span class="stat-value">{{ course.maxStudents }}</span>
              <span class="stat-label">最大人数</span>
            </div>
            <div class="stat-item" v-if="course.pendingCount > 0">
              <span class="stat-value text-warning">{{ course.pendingCount }}</span>
              <span class="stat-label">待审核</span>
            </div>
          </div>
          
          <p class="course-desc">{{ course.description || '暂无描述' }}</p>
          
          <div class="card-actions">
            <el-button type="primary" @click="viewStudents(course.id)">
              查看学生
            </el-button>
            <el-button @click="editCourse(course)">编辑</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-empty v-if="!loading && courses.length === 0" description="您还没有负责的课程" />
    
    <!-- 编辑课程弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑课程" width="500px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="最大人数" prop="maxStudents">
          <el-input-number v-model="editForm.maxStudents" :min="1" :max="500" />
        </el-form-item>
        <el-form-item label="课程描述" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入课程描述" />
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
import { updateCourseClass } from '@/api/courseClass'

const router = useRouter()

const loading = ref(false)
const courses = ref([])
const editDialogVisible = ref(false)
const saving = ref(false)
const editFormRef = ref(null)
const currentCourseId = ref(null)

const editForm = reactive({
  name: '',
  maxStudents: null,
  description: ''
})

const editRules = {
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }]
}

const loadCourses = async () => {
  loading.value = true
  try {
    courses.value = await request.get('/teacher/my-course-classes')
  } catch (error) {
    console.error('加载课程失败:', error)
  } finally {
    loading.value = false
  }
}

const viewStudents = (courseId) => {
  router.push(`/teacher/course-students/${courseId}`)
}

const editCourse = (course) => {
  currentCourseId.value = course.id
  editForm.name = course.name
  editForm.maxStudents = course.maxStudents
  editForm.description = course.description
  editDialogVisible.value = true
}

const handleSave = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    saving.value = true
    
    await updateCourseClass(currentCourseId.value, editForm)
    ElMessage.success('保存成功')
    editDialogVisible.value = false
    loadCourses()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadCourses()
})
</script>

<style lang="scss" scoped>
.my-courses-page {
  .course-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .course-stats {
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
    
    .course-desc {
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