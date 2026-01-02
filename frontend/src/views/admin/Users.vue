<template>
  <div class="users-page page-container">
    <h1 class="page-title">用户管理</h1>
    
    <!-- 搜索栏 -->
    <div class="search-form">
      <el-input
        v-model="searchParams.keyword"
        placeholder="搜索用户名/姓名"
        clearable
        style="width: 200px"
      />
      <el-select v-model="searchParams.role" placeholder="选择角色" clearable style="width: 120px">
        <el-option label="学生" value="student" />
        <el-option label="教师" value="teacher" />
        <el-option label="辅导员" value="counselor" />
        <el-option label="管理员" value="admin" />
      </el-select>
      <el-select v-model="searchParams.status" placeholder="选择状态" clearable style="width: 120px">
        <el-option label="正常" value="active" />
        <el-option label="禁用" value="inactive" />
      </el-select>
      <el-button type="primary" @click="loadUsers">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>
    
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          批量删除 ({{ selectedIds.length }})
        </el-button>
      </div>
    </div>
    
    <!-- 用户列表 -->
    <el-table
      :data="users"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="realName" label="姓名" width="100" />
      <el-table-column prop="role" label="角色" width="100">
        <template #default="{ row }">
          <el-tag :type="getRoleTagType(row.role)" size="small">
            {{ getRoleName(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)" size="small">
            {{ getStatusName(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-popconfirm
            title="确定要删除该用户吗？"
            @confirm="handleDelete(row.id)"
          >
            <template #reference>
              <el-button type="danger" link>删除</el-button>
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
        @size-change="loadUsers"
        @current-change="loadUsers"
      />
    </div>
    
    <!-- 新增/编辑用户弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="500px">
      <el-form ref="formRef" :model="form" :rules="currentRules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" :disabled="isEdit" placeholder="请选择角色">
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
            <el-option label="辅导员" value="counselor" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getUserList, createUser, updateUser, deleteUser, batchDeleteUsers } from '@/api/user'
import { RoleNames, RoleTagTypes } from '@/constants/roles'

const loading = ref(false)
const users = ref([])
const selectedIds = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const formRef = ref(null)
const currentUserId = ref(null)

const searchParams = reactive({
  keyword: '',
  role: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  username: '',
  password: '',
  realName: '',
  role: 'student',
  email: '',
  phone: '',
  status: 'active'
})

// 创建用户时的验证规则
const createRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
  ]
}

// 编辑用户时的验证规则（不需要密码）
const editRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
  ]
}

// 根据编辑模式动态选择验证规则
const currentRules = computed(() => isEdit.value ? editRules : createRules)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

const getRoleName = (role) => RoleNames[role] || '未知'
const getRoleTagType = (role) => RoleTagTypes[role] || 'info'

const getStatusName = (status) => {
  const map = { active: '正常', inactive: '禁用' }
  return map[status] || '未知'
}

const getStatusTagType = (status) => {
  const map = { active: 'success', inactive: 'danger' }
  return map[status] || 'info'
}

const loadUsers = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchParams
    })
    users.value = res.list
    pagination.total = res.pagination.total
  } catch (error) {
    console.error('加载用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchParams.keyword = ''
  searchParams.role = ''
  searchParams.status = ''
  pagination.page = 1
  loadUsers()
}

const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleCreate = () => {
  isEdit.value = false
  currentUserId.value = null
  form.username = ''
  form.password = ''
  form.realName = ''
  form.role = 'student'
  form.email = ''
  form.phone = ''
  form.status = 'active'
  dialogVisible.value = true
  // 重置表单验证
  nextTick(() => {
    if (formRef.value) {
      formRef.value.clearValidate()
    }
  })
}

const handleEdit = (user) => {
  isEdit.value = true
  currentUserId.value = user.id
  form.username = user.username
  form.password = ''
  form.realName = user.realName || ''
  form.role = user.role
  form.email = user.email || ''
  form.phone = user.phone || ''
  form.status = user.status
  dialogVisible.value = true
  // 重置表单验证
  nextTick(() => {
    if (formRef.value) {
      formRef.value.clearValidate()
    }
  })
}

const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    // 验证表单
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) {
      return
    }
    
    saving.value = true
    
    if (isEdit.value) {
      // 构建更新数据，空字符串转为 null
      const updateData = {
        realName: form.realName,
        status: form.status
      }
      // 只有当邮箱不为空时才发送
      if (form.email && form.email.trim()) {
        updateData.email = form.email.trim()
      }
      // 只有当手机号不为空时才发送
      if (form.phone && form.phone.trim()) {
        updateData.phone = form.phone.trim()
      }
      
      await updateUser(currentUserId.value, updateData)
    } else {
      // 创建用户时，处理空字符串
      const createData = { ...form }
      if (!createData.email || !createData.email.trim()) {
        delete createData.email
      }
      if (!createData.phone || !createData.phone.trim()) {
        delete createData.phone
      }
      await createUser(createData)
    }
    
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    loadUsers()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id) => {
  try {
    await deleteUser(id)
    ElMessage.success('删除成功')
    loadUsers()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个用户吗？`,
      '批量删除',
      { type: 'warning' }
    )
    
    const result = await batchDeleteUsers(selectedIds.value)
    
    if (result.failed > 0) {
      ElMessage.warning(`删除完成：成功 ${result.success} 个，失败 ${result.failed} 个`)
    } else {
      ElMessage.success(`成功删除 ${result.success} 个用户`)
    }
    
    selectedIds.value = []
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
    }
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style lang="scss" scoped>
.users-page {
  // 使用全局样式
}
</style>