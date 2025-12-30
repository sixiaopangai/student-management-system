<template>
  <div class="my-classes-page page-container">
    <h1 class="page-title">我的班级</h1>
    
    <!-- 专业班级 -->
    <div class="section">
      <h2 class="section-title">
        <el-icon><OfficeBuilding /></el-icon>
        专业班级
      </h2>
      
      <el-card v-if="majorClass" class="class-card">
        <template #header>
          <div class="card-header">
            <span>{{ majorClass.name }}</span>
            <el-tag>{{ majorClass.code }}</el-tag>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="辅导员">{{ majorClass.counselorName || '未分配' }}</el-descriptions-item>
          <el-descriptions-item label="加入时间">{{ formatDate(majorClass.joinedAt) }}</el-descriptions-item>
          <el-descriptions-item label="班级描述" :span="2">{{ majorClass.description || '暂无描述' }}</el-descriptions-item>
        </el-descriptions>
        <div class="card-actions">
          <el-popconfirm
            title="确定要退出该专业班级吗？"
            @confirm="handleLeaveMajorClass"
          >
            <template #reference>
              <el-button type="danger" plain :loading="leavingMajor">退出班级</el-button>
            </template>
          </el-popconfirm>
        </div>
      </el-card>
      
      <el-empty v-else description="您还未加入专业班级">
        <el-button type="primary" @click="$router.push('/student/join-class')">
          去加入
        </el-button>
      </el-empty>
    </div>
    
    <!-- 课程班级 -->
    <div class="section">
      <h2 class="section-title">
        <el-icon><Reading /></el-icon>
        课程班级
      </h2>
      
      <el-row :gutter="20" v-if="courseClasses.length > 0">
        <el-col :span="8" v-for="course in courseClasses" :key="course.id">
          <el-card class="course-card">
            <template #header>
              <div class="card-header">
                <span>{{ course.name }}</span>
                <el-tag size="small">{{ course.code }}</el-tag>
              </div>
            </template>
            <p class="course-teacher">
              <el-icon><User /></el-icon>
              授课教师：{{ course.teacherName }}
            </p>
            <p class="course-desc">{{ course.description || '暂无描述' }}</p>
            <div class="card-actions">
              <el-popconfirm
                title="确定要退出该课程班级吗？"
                @confirm="handleLeaveCourseClass(course.id)"
              >
                <template #reference>
                  <el-button type="danger" plain size="small">退出课程</el-button>
                </template>
              </el-popconfirm>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-empty v-else description="您还未加入任何课程班级">
        <el-button type="primary" @click="$router.push('/student/join-class')">
          去选课
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { OfficeBuilding, Reading, User } from '@element-plus/icons-vue'
import { getMyMajorClass, getMyCourseClasses, leaveMajorClass, leaveCourseClass } from '@/api/student'

const majorClass = ref(null)
const courseClasses = ref([])
const loading = ref(false)
const leavingMajor = ref(false)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const loadData = async () => {
  loading.value = true
  try {
    // 加载专业班级
    try {
      majorClass.value = await getMyMajorClass()
    } catch (error) {
      // 可能未加入专业班级
      majorClass.value = null
    }
    
    // 加载课程班级
    courseClasses.value = await getMyCourseClasses()
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleLeaveMajorClass = async () => {
  if (!majorClass.value) return
  
  try {
    leavingMajor.value = true
    await leaveMajorClass(majorClass.value.id)
    ElMessage.success('已退出专业班级')
    majorClass.value = null
  } catch (error) {
    console.error('退出失败:', error)
  } finally {
    leavingMajor.value = false
  }
}

const handleLeaveCourseClass = async (courseClassId) => {
  try {
    await leaveCourseClass(courseClassId)
    ElMessage.success('已退出课程班级')
    courseClasses.value = courseClasses.value.filter(c => c.id !== courseClassId)
  } catch (error) {
    console.error('退出失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.my-classes-page {
  .section {
    margin-bottom: 30px;
    
    .section-title {
      display: flex;
      align-items: center;
      font-size: 18px;
      color: #333;
      margin-bottom: 15px;
      
      .el-icon {
        margin-right: 8px;
        color: #409eff;
      }
    }
  }
  
  .class-card {
    max-width: 600px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .card-actions {
      margin-top: 15px;
      text-align: right;
    }
  }
  
  .course-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .course-teacher {
      display: flex;
      align-items: center;
      color: #666;
      margin-bottom: 10px;
      
      .el-icon {
        margin-right: 5px;
      }
    }
    
    .course-desc {
      color: #999;
      font-size: 13px;
      margin-bottom: 15px;
      min-height: 40px;
    }
    
    .card-actions {
      text-align: right;
    }
  }
}
</style>