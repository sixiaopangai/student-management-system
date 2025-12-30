<template>
  <div class="course-students-page page-container">
    <div class="page-header">
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1 class="page-title">{{ courseInfo?.name }} - 学生列表</h1>
    </div>
    
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索学生姓名/学号"
          prefix-icon="Search"
          clearable
          style="width: 250px"
          @clear="loadStudents"
          @keyup.enter="loadStudents"
        />
        <el-button type="primary" @click="loadStudents">搜索</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchRemove">
          批量移除 ({{ selectedIds.length }})
        </el-button>
      </div>
    </div>
    
    <!-- 学生列表 -->
    <el-table
      :data="students"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="username" label="学号" width="120" />
      <el-table-column prop="realName" label="姓名" width="100" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="joinedAt" label="加入时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.joinedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-popconfirm
            title="确定要将该学生移出课程吗？"
            @confirm="handleRemove(row.id)"
          >
            <template #reference>
              <el-button type="danger" link>移除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadStudents"
        @current-change="loadStudents"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { removeStudentFromCourseClass, batchRemoveStudentsFromCourseClass } from '@/api/courseClass'

const route = useRoute()
const courseId = route.params.id

const loading = ref(false)
const courseInfo = ref(null)
const students = ref([])
const searchKeyword = ref('')
const selectedIds = ref([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

const loadCourseInfo = async () => {
  try {
    courseInfo.value = await request.get(`/teacher/my-course-classes/${courseId}`)
  } catch (error) {
    console.error('加载课程信息失败:', error)
  }
}

const loadStudents = async () => {
  loading.value = true
  try {
    const res = await request.get(`/teacher/my-course-classes/${courseId}/students`, {
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: searchKeyword.value
      }
    })
    students.value = res.list
    pagination.total = res.pagination.total
  } catch (error) {
    console.error('加载学生列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleRemove = async (studentId) => {
  try {
    await removeStudentFromCourseClass(courseId, studentId)
    ElMessage.success('移除成功')
    loadStudents()
  } catch (error) {
    console.error('移除失败:', error)
  }
}

const handleBatchRemove = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要移除选中的 ${selectedIds.value.length} 名学生吗？`,
      '批量移除',
      { type: 'warning' }
    )
    
    const result = await batchRemoveStudentsFromCourseClass(courseId, selectedIds.value)
    
    if (result.failed > 0) {
      ElMessage.warning(`移除完成：成功 ${result.success} 人，失败 ${result.failed} 人`)
    } else {
      ElMessage.success(`成功移除 ${result.success} 名学生`)
    }
    
    selectedIds.value = []
    loadStudents()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量移除失败:', error)
    }
  }
}

onMounted(() => {
  loadCourseInfo()
  loadStudents()
})
</script>

<style lang="scss" scoped>
.course-students-page {
  .page-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    
    .page-title {
      margin: 0 0 0 15px;
      font-size: 20px;
      border-bottom: none;
      padding-bottom: 0;
    }
  }
}
</style>