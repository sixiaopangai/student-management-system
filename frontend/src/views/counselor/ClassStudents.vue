<template>
  <div class="class-students-page page-container">
    <div class="page-header">
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1 class="page-title">{{ classInfo?.name }} - 学生管理</h1>
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
          <el-option label="已通过" value="approved" />
          <el-option label="待审批" value="pending" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
        <el-button type="primary" @click="loadStudents">搜索</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="success" :disabled="pendingSelectedIds.length === 0" @click="handleBatchApprove">
          批量通过 ({{ pendingSelectedIds.length }})
        </el-button>
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
      <el-table-column prop="status" label="审批状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="userStatus" label="账号状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.userStatus === 'active' ? 'success' : 'danger'" size="small">
            {{ row.userStatus === 'active' ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="joinedAt" label="申请时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.joinedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <!-- 待审批状态显示审批按钮 -->
          <template v-if="row.status === 'pending'">
            <el-button type="success" link @click="handleApprove(row.id)">通过</el-button>
            <el-button type="danger" link @click="handleReject(row.id)">拒绝</el-button>
          </template>
          <!-- 已通过状态显示编辑和移除按钮 -->
          <template v-else-if="row.status === 'approved'">
            <el-button type="primary" link @click="editStudent(row)">编辑</el-button>
            <el-popconfirm
              title="确定要将该学生移出班级吗？"
              @confirm="handleRemove(row.id)"
            >
              <template #reference>
                <el-button type="danger" link>移除</el-button>
              </template>
            </el-popconfirm>
          </template>
          <!-- 已拒绝状态显示重新审批按钮 -->
          <template v-else-if="row.status === 'rejected'">
            <el-button type="success" link @click="handleApprove(row.id)">重新通过</el-button>
            <el-popconfirm
              title="确定要删除该申请记录吗？"
              @confirm="handleRemove(row.id)"
            >
              <template #reference>
                <el-button type="danger" link>删除</el-button>
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
    
    <!-- 编辑学生弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑学生信息" width="500px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="学号">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="editForm.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveStudent">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { updateUser } from '@/api/user'
import { removeStudentFromMajorClass, batchRemoveStudentsFromMajorClass } from '@/api/majorClass'

const route = useRoute()
const classId = route.params.id

const loading = ref(false)
const classInfo = ref(null)
const students = ref([])
const searchKeyword = ref('')
const statusFilter = ref('')
const selectedRows = ref([])
const editDialogVisible = ref(false)
const saving = ref(false)
const editFormRef = ref(null)
const currentStudentId = ref(null)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const editForm = reactive({
  username: '',
  realName: '',
  email: '',
  phone: ''
})

const editRules = {
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }]
}

// 计算选中的ID
const selectedIds = computed(() => selectedRows.value.map(item => item.id))

// 计算选中的待审批学生ID
const pendingSelectedIds = computed(() => 
  selectedRows.value.filter(item => item.status === 'pending').map(item => item.id)
)

const getStatusType = (status) => {
  const types = {
    approved: 'success',
    pending: 'warning',
    rejected: 'danger',
    removed: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    approved: '已通过',
    pending: '待审批',
    rejected: '已拒绝',
    removed: '已移除'
  }
  return texts[status] || status
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

const loadClassInfo = async () => {
  try {
    classInfo.value = await request.get(`/counselor/my-major-classes/${classId}`)
  } catch (error) {
    console.error('加载班级信息失败:', error)
  }
}

const loadStudents = async () => {
  loading.value = true
  try {
    const res = await request.get(`/counselor/my-major-classes/${classId}/students`, {
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: searchKeyword.value,
        status: statusFilter.value
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
  selectedRows.value = selection
}

const editStudent = (student) => {
  currentStudentId.value = student.id
  editForm.username = student.username
  editForm.realName = student.realName
  editForm.email = student.email
  editForm.phone = student.phone
  editDialogVisible.value = true
}

const handleSaveStudent = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    saving.value = true
    
    await updateUser(currentStudentId.value, {
      realName: editForm.realName,
      email: editForm.email,
      phone: editForm.phone
    })
    ElMessage.success('保存成功')
    editDialogVisible.value = false
    loadStudents()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

// 审批通过
const handleApprove = async (studentId) => {
  try {
    await request.put(`/counselor/my-major-classes/${classId}/students/${studentId}/approve`)
    ElMessage.success('审批通过')
    loadStudents()
  } catch (error) {
    console.error('审批失败:', error)
    ElMessage.error('审批失败')
  }
}

// 审批拒绝
const handleReject = async (studentId) => {
  try {
    await ElMessageBox.prompt('请输入拒绝原因（可选）', '拒绝申请', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入拒绝原因'
    }).then(async ({ value }) => {
      await request.put(`/counselor/my-major-classes/${classId}/students/${studentId}/reject`, {
        reason: value
      })
      ElMessage.success('已拒绝该申请')
      loadStudents()
    })
  } catch (error) {
    if (error !== 'cancel') {
      console.error('拒绝失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 批量审批通过
const handleBatchApprove = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要通过选中的 ${pendingSelectedIds.value.length} 名学生的申请吗？`,
      '批量审批',
      { type: 'warning' }
    )
    
    await request.post(`/counselor/my-major-classes/${classId}/students/batch-approve`, {
      studentIds: pendingSelectedIds.value
    })
    
    ElMessage.success(`成功通过 ${pendingSelectedIds.value.length} 名学生的申请`)
    selectedRows.value = []
    loadStudents()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量审批失败:', error)
      ElMessage.error('批量审批失败')
    }
  }
}

const handleRemove = async (studentId) => {
  try {
    await removeStudentFromMajorClass(classId, studentId)
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
    
    const result = await batchRemoveStudentsFromMajorClass(classId, selectedIds.value)
    
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
  loadClassInfo()
  loadStudents()
})
</script>

<style lang="scss" scoped>
.class-students-page {
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