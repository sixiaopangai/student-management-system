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
      <el-table-column prop="userStatus" label="账号状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.userStatus === 'active' ? 'success' : 'danger'" size="small">
            {{ row.userStatus === 'active' ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="joinedAt" label="加入时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.joinedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
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
import { ref, reactive, onMounted } from 'vue'
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
const selectedIds = ref([])
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
    
    selectedIds.value = []
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