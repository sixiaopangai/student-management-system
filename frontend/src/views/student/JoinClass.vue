<template>
  <div class="join-class-page page-container">
    <h1 class="page-title">加入班级</h1>
    
    <el-tabs v-model="activeTab">
      <!-- 专业班级 -->
      <el-tab-pane label="专业班级" name="major">
        <div class="tab-content">
          <el-alert
            v-if="hasMajorClass"
            title="您已加入专业班级，如需更换请先退出当前班级"
            type="info"
            show-icon
            :closable="false"
            class="mb-20"
          />
          
          <el-row :gutter="20" v-loading="loadingMajor">
            <el-col :span="8" v-for="item in availableMajorClasses" :key="item.id">
              <el-card class="class-card" :class="{ disabled: hasMajorClass }">
                <template #header>
                  <div class="card-header">
                    <span>{{ item.name }}</span>
                    <el-tag size="small">{{ item.code }}</el-tag>
                  </div>
                </template>
                <p class="class-info">
                  <el-icon><User /></el-icon>
                  辅导员：{{ item.counselorName || '未分配' }}
                </p>
                <p class="class-desc">{{ item.description || '暂无描述' }}</p>
                <div class="card-actions">
                  <el-button
                    type="primary"
                    :disabled="hasMajorClass"
                    @click="handleJoinMajorClass(item.id)"
                  >
                    加入班级
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
          
          <el-empty v-if="!loadingMajor && availableMajorClasses.length === 0" description="暂无可加入的专业班级" />
        </div>
      </el-tab-pane>
      
      <!-- 课程班级 -->
      <el-tab-pane label="课程班级" name="course">
        <div class="tab-content">
          <el-row :gutter="20" v-loading="loadingCourse">
            <el-col :span="8" v-for="item in availableCourseClasses" :key="item.id">
              <el-card class="class-card" :class="{ full: item.isFull }">
                <template #header>
                  <div class="card-header">
                    <span>{{ item.name }}</span>
                    <el-tag size="small">{{ item.code }}</el-tag>
                  </div>
                </template>
                <p class="class-info">
                  <el-icon><User /></el-icon>
                  授课教师：{{ item.teacherName }}
                </p>
                <p class="class-info">
                  <el-icon><UserFilled /></el-icon>
                  已选人数：{{ item.studentCount }}{{ item.maxStudents ? ` / ${item.maxStudents}` : '' }}
                  <el-tag v-if="item.isFull" type="danger" size="small" class="ml-10">已满</el-tag>
                </p>
                <p class="class-desc">{{ item.description || '暂无描述' }}</p>
                <div class="card-actions">
                  <el-button
                    type="primary"
                    :disabled="item.isFull"
                    @click="handleJoinCourseClass(item.id)"
                  >
                    {{ item.isFull ? '人数已满' : '加入课程' }}
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
          
          <el-empty v-if="!loadingCourse && availableCourseClasses.length === 0" description="暂无可加入的课程班级" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, UserFilled } from '@element-plus/icons-vue'
import {
  getMyMajorClass,
  getAvailableMajorClasses,
  getAvailableCourseClasses,
  joinMajorClass,
  joinCourseClass
} from '@/api/student'

const activeTab = ref('major')
const hasMajorClass = ref(false)
const loadingMajor = ref(false)
const loadingCourse = ref(false)
const availableMajorClasses = ref([])
const availableCourseClasses = ref([])

const loadMajorClasses = async () => {
  loadingMajor.value = true
  try {
    // 检查是否已有专业班级
    try {
      const myMajor = await getMyMajorClass()
      hasMajorClass.value = !!myMajor
    } catch {
      hasMajorClass.value = false
    }
    
    // 获取可加入的专业班级
    availableMajorClasses.value = await getAvailableMajorClasses()
  } catch (error) {
    console.error('加载专业班级失败:', error)
  } finally {
    loadingMajor.value = false
  }
}

const loadCourseClasses = async () => {
  loadingCourse.value = true
  try {
    availableCourseClasses.value = await getAvailableCourseClasses()
  } catch (error) {
    console.error('加载课程班级失败:', error)
  } finally {
    loadingCourse.value = false
  }
}

const handleJoinMajorClass = async (majorClassId) => {
  try {
    await joinMajorClass(majorClassId)
    ElMessage.success('加入成功')
    hasMajorClass.value = true
    // 从列表中移除
    availableMajorClasses.value = availableMajorClasses.value.filter(c => c.id !== majorClassId)
  } catch (error) {
    console.error('加入失败:', error)
  }
}

const handleJoinCourseClass = async (courseClassId) => {
  try {
    await joinCourseClass(courseClassId)
    ElMessage.success('加入成功')
    // 从列表中移除
    availableCourseClasses.value = availableCourseClasses.value.filter(c => c.id !== courseClassId)
  } catch (error) {
    console.error('加入失败:', error)
  }
}

onMounted(() => {
  loadMajorClasses()
  loadCourseClasses()
})
</script>

<style lang="scss" scoped>
.join-class-page {
  .tab-content {
    padding: 20px 0;
  }
  
  .class-card {
    margin-bottom: 20px;
    transition: all 0.3s;
    
    &:hover:not(.disabled):not(.full) {
      transform: translateY(-5px);
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    }
    
    &.disabled {
      opacity: 0.6;
    }
    
    &.full {
      opacity: 0.7;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .class-info {
      display: flex;
      align-items: center;
      color: #666;
      margin-bottom: 8px;
      font-size: 14px;
      
      .el-icon {
        margin-right: 5px;
      }
    }
    
    .class-desc {
      color: #999;
      font-size: 13px;
      margin-bottom: 15px;
      min-height: 40px;
    }
    
    .card-actions {
      text-align: center;
    }
  }
}
</style>