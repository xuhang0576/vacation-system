<template>
  <div class="history-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>📋 我的申请历史</span>
        </div>
      </el-card>
      
      <el-table :data="records" stripe v-loading="loading">
        <el-table-column prop="type" label="假别" width="80" />
        <el-table-column prop="start_date" label="开始日期" width="120" />
        <el-table-column prop="end_date" label="结束日期" width="120" />
        <el-table-column prop="days" label="时长" width="80">
          <template #default="{ row }">
            {{ row.days }} 天
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="理由" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approve_time" label="审批时间" width="160">
          <template #default="{ row }">
            {{ row.approve_time || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" v-if="hasPending">
          <template #default="{ row }">
            <el-button 
              type="danger" 
              size="small" 
              link
              v-if="row.status === 'pending'"
              @click="handleDelete(row.id)"
            >
              撤销
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="!loading && records.length === 0" description="暂无申请记录" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../../api'

const records = ref([])
const loading = ref(false)

const hasPending = computed(() => records.value.some(r => r.status === 'pending'))

const statusType = (status) => {
  const map = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status] || ''
}

const statusText = (status) => {
  const map = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return map[status] || status
}

const fetchRecords = async () => {
  loading.value = true
  try {
    records.value = await api.get('/vacations')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要撤销该申请吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await api.delete(`/vacations/${id}`)
    ElMessage.success('撤销成功')
    fetchRecords()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '撤销失败')
    }
  }
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped>
.history-page {
  max-width: 1200px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}
</style>