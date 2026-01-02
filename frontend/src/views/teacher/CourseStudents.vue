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
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 120px; margin-left: 10px" @change="loadStudents">
          <el-option label="全部" value="" />
          <el-option label="待审批" value="pending" />
          <el-option label="已通过" value="approved" />
        </el-select>
        <el-button type="primary" @click="loadStudents">搜索</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="success" :disabled="pendingSelectedIds.length === 0" @click="handleBatchApprove">
          批量通过 ({{ pendingSelectedIds.length }})
        </el-button>
        <el-button type="danger" :disabled="approvedSelectedIds.length === 0" @click="handleBatchRemove">
          批量移除 ({{ approvedSelectedIds.length }})
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
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="joinedAt" label="加入时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.joinedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 'pending'">
            <el-button type="success" link @click="handleApprove(row.id)">通过</el-button>
            <el-popconfirm
              title="确定要拒绝该学生的申请吗？"
              @confirm="handleReject(row.id)"
            >
              <template #reference>
                <el-button type="warning" link>拒绝</el-button>
              </template>
            </el-popconfirm>
          </template>
          <template v-else-if="row.status === 'approved'">
            <el-popconfirm
              title="确定要将该学生移出课程吗？"
              @confirm="handleRemove(row.id)"
            >
              <template #reference>
                <el-button type="danger" link>移除</el-button>
              </template>
            </el-popconfirm>
          </template>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { 
  removeStudentFromCourseClass, 
  batchRemoveStudentsFromCourseClass,
  approveStudentInCourseClass,
  rejectStudentInCourseClass
} from '@/api/courseClass'

const route = useRoute()
const courseId = route.params.id

const loading = ref(false)
const courseInfo = ref(null)
const students = ref([])
const searchKeyword = ref('')
const statusFilter = ref('')
const selectedRows = ref([])

const selectedIds = computed(() => selectedRows.value.map(item => item.id))
const pendingSelectedIds = computed(() => 
  selectedRows.value.filter(item => item.status === 'pending').map(item => item.id)
)
const approvedSelectedIds = computed(() => 
  selectedRows.value.filter(item => item.status === 'approved').map(item => item.id)
)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    approved: 'success'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待审批',
    approved: '已通过'
  }
  return texts[status] || status
}

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
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value
    }
    if (statusFilter.value) {
      params.status = statusFilter.value
    }
    const res = await request.get(`/teacher/my-course-classes/${courseId}/students`, { params })
    students.value = res.list
    pagination.total = res.pagination.total
  } catch (error) {
    console.error('加载学生列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleApprove = async (studentId) => {
  try {
    await approveStudentInCourseClass(courseId, studentId)
    ElMessage.success('审批通过')
    loadStudents()
  } catch (error) {
    console.error('审批失败:', error)
  }
}

const handleReject = async (studentId) => {
  try {
    await rejectStudentInCourseClass(courseId, studentId)
    ElMessage.success('已拒绝')
    loadStudents()
  } catch (error) {
    console.error('拒绝失败:', error)
  }
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

const handleBatchApprove = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要批量通过选中的 ${pendingSelectedIds.value.length} 名学生吗？`,
      '批量审批',
      { type: 'warning' }
    )
    
    // 逐个审批
    let success = 0
    let failed = 0
    for (const studentId of pendingSelectedIds.value) {
      try {
        await approveStudentInCourseClass(courseId, studentId)
        success++
      } catch {
        failed++
      }
    }
    
    if (failed > 0) {
      ElMessage.warning(`审批完成：成功 ${success} 人，失败 ${failed} 人`)
    } else {
      ElMessage.success(`成功审批 ${success} 名学生`)
    }
    
    selectedRows.value = []
    loadStudents()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量审批失败:', error)
    }
  }
}

const handleBatchRemove = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要移除选中的 ${approvedSelectedIds.value.length} 名学生吗？`,
      '批量移除',
      { type: 'warning' }
    )
    
    const result = await batchRemoveStudentsFromCourseClass(courseId, approvedSelectedIds.value)
    
    if (result.failed > 0) {
      ElMessage.warning(`移除完成：成功 ${result.success} 人，失败 ${result.failed} 人`)
    } else {
      ElMessage.success(`成功移除 ${result.success} 名学生`)
    }
    
    selectedRows.value = []
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