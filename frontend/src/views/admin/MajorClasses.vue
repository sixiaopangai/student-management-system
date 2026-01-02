<template>
  <div class="major-classes-page page-container">
    <h1 class="page-title">专业班级管理</h1>
    
    <!-- 搜索栏 -->
    <div class="search-form">
      <el-input
        v-model="searchParams.keyword"
        placeholder="搜索班级名称/编码/辅导员姓名"
        clearable
        style="width: 250px"
      />
      <el-select v-model="searchParams.status" placeholder="选择状态" clearable style="width: 120px">
        <el-option label="正常" value="active" />
        <el-option label="停用" value="inactive" />
      </el-select>
      <el-button type="primary" @click="loadClasses">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>
    
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新增班级
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          批量删除 ({{ selectedIds.length }})
        </el-button>
      </div>
    </div>
    
    <!-- 班级列表 -->
    <el-table
      :data="classes"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="班级名称" min-width="200" />
      <el-table-column prop="code" label="班级编码" width="150" />
      <el-table-column prop="counselorName" label="辅导员" width="100" />
      <el-table-column prop="studentCount" label="学生人数" width="100" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
            {{ row.status === 'active' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="viewStudents(row.id)">学生</el-button>
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-popconfirm
            title="确定要删除该班级吗？"
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
        @size-change="loadClasses"
        @current-change="loadClasses"
      />
    </div>
    
    <!-- 新增/编辑班级弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑班级' : '新增班级'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="班级编码" prop="code">
          <el-input v-model="form.code" :disabled="isEdit" placeholder="请输入班级编码" />
        </el-form-item>
        <el-form-item label="辅导员" prop="counselorId">
          <el-select v-model="form.counselorId" placeholder="请选择辅导员" clearable filterable>
            <el-option
              v-for="item in counselors"
              :key="item.id"
              :label="item.realName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入班级描述" />
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="正常" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 学生管理弹窗 -->
    <el-dialog v-model="studentsDialogVisible" title="班级学生管理" width="800px">
      <div class="students-toolbar">
        <el-input
          v-model="studentKeyword"
          placeholder="搜索学生"
          clearable
          style="width: 200px"
          @keyup.enter="loadClassStudents"
        />
        <el-button type="primary" @click="loadClassStudents">搜索</el-button>
      </div>
      
      <el-table :data="classStudents" v-loading="loadingStudents" max-height="400">
        <el-table-column prop="username" label="学号" width="120" />
        <el-table-column prop="realName" label="姓名" width="100" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="joinedAt" label="加入时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.joinedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-popconfirm
              title="确定要移除该学生吗？"
              @confirm="removeStudent(row.id)"
            >
              <template #reference>
                <el-button type="danger" link>移除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getMajorClassList,
  getMajorClassById,
  createMajorClass,
  updateMajorClass,
  deleteMajorClass,
  batchDeleteMajorClasses,
  getMajorClassStudents,
  removeStudentFromMajorClass
} from '@/api/majorClass'
import { getUserList } from '@/api/user'

const loading = ref(false)
const classes = ref([])
const selectedIds = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const formRef = ref(null)
const currentClassId = ref(null)
const counselors = ref([])

const studentsDialogVisible = ref(false)
const loadingStudents = ref(false)
const classStudents = ref([])
const studentKeyword = ref('')

const searchParams = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  name: '',
  code: '',
  counselorId: null,
  description: '',
  status: 'active'
})

const rules = {
  name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入班级编码', trigger: 'blur' }]
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

const loadClasses = async () => {
  loading.value = true
  try {
    const res = await getMajorClassList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchParams
    })
    classes.value = res.list
    pagination.total = res.pagination.total
  } catch (error) {
    console.error('加载班级列表失败:', error)
  } finally {
    loading.value = false
  }
}

const loadCounselors = async () => {
  try {
    const res = await getUserList({ role: 'counselor', pageSize: 100 })
    counselors.value = res.list
  } catch (error) {
    console.error('加载辅导员列表失败:', error)
  }
}

const resetSearch = () => {
  searchParams.keyword = ''
  searchParams.status = ''
  pagination.page = 1
  loadClasses()
}

const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleCreate = () => {
  isEdit.value = false
  currentClassId.value = null
  form.name = ''
  form.code = ''
  form.counselorId = null
  form.description = ''
  form.status = 'active'
  dialogVisible.value = true
}

const handleEdit = (item) => {
  isEdit.value = true
  currentClassId.value = item.id
  form.name = item.name
  form.code = item.code
  form.counselorId = item.counselorId
  form.description = item.description || ''
  form.status = item.status
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    
    if (isEdit.value) {
      await updateMajorClass(currentClassId.value, form)
    } else {
      await createMajorClass(form)
    }
    
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    loadClasses()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id) => {
  try {
    await deleteMajorClass(id)
    ElMessage.success('删除成功')
    loadClasses()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个班级吗？`,
      '批量删除',
      { type: 'warning' }
    )
    
    const result = await batchDeleteMajorClasses(selectedIds.value)
    
    if (result.failed > 0) {
      ElMessage.warning(`删除完成：成功 ${result.success} 个，失败 ${result.failed} 个`)
    } else {
      ElMessage.success(`成功删除 ${result.success} 个班级`)
    }
    
    selectedIds.value = []
    loadClasses()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
    }
  }
}

const viewStudents = async (classId) => {
  currentClassId.value = classId
  studentKeyword.value = ''
  studentsDialogVisible.value = true
  await loadClassStudents()
}

const loadClassStudents = async () => {
  loadingStudents.value = true
  try {
    const res = await getMajorClassStudents(currentClassId.value, {
      keyword: studentKeyword.value,
      pageSize: 100
    })
    classStudents.value = res.list
  } catch (error) {
    console.error('加载学生列表失败:', error)
  } finally {
    loadingStudents.value = false
  }
}

const removeStudent = async (studentId) => {
  try {
    await removeStudentFromMajorClass(currentClassId.value, studentId)
    ElMessage.success('移除成功')
    loadClassStudents()
    loadClasses()
  } catch (error) {
    console.error('移除失败:', error)
  }
}

onMounted(() => {
  loadClasses()
  loadCounselors()
})
</script>

<style lang="scss" scoped>
.major-classes-page {
  .students-toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }
}
</style>