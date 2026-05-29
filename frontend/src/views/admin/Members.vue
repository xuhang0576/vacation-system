<template>
  <div class="members-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>👥 成员管理</span>
        </div>
      </el-card>
      
      <el-table :data="members" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : ''">
              {{ row.role === 'admin' ? '管理员' : '成员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="vacation_days" label="年假天数" width="100">
          <template #default="{ row }">
            <el-tag type="success">{{ row.vacation_days }} 天</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              link
              :disabled="row.role === 'admin'"
              @click="handleDelete(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="!loading && members.length === 0" description="暂无成员" />
    </el-card>
    
    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑成员" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="年假天数">
          <el-input-number v-model="editForm.vacation_days" :min="0" :max="30" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="editForm.role" style="width: 100%">
            <el-option label="成员" value="member" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../../api'

const members = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const editForm = reactive({
  id: null,
  name: '',
  vacation_days: 10,
  role: 'member'
})

const fetchMembers = async () => {
  loading.value = true
  try {
    members.value = await api.get('/users')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

const handleEdit = (row) => {
  editForm.id = row.id
  editForm.name = row.name
  editForm.vacation_days = row.vacation_days
  editForm.role = row.role
  dialogVisible.value = true
}

const handleSave = async () => {
  try {
    await api.put(`/users/${editForm.id}`, {
      name: editForm.name,
      vacation_days: editForm.vacation_days
    })
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchMembers()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该成员吗？其所有休假记录也将被删除。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await api.delete(`/users/${id}`)
    ElMessage.success('删除成功')
    fetchMembers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

onMounted(() => {
  fetchMembers()
})
</script>

<style scoped>
.members-page {
  max-width: 1200px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}
</style>