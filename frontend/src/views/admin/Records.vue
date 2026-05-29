<template>
  <div class="records-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>📋 全部休假记录</span>
        </div>
      </template>
      
      <!-- 筛选 -->
      <el-form inline class="filter-form">
        <el-form-item label="申请人">
          <el-input v-model="filters.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="请选择" clearable>
            <el-option label="待审批" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="filteredRecords" stripe v-loading="loading">
        <el-table-column prop="user_name" label="申请人" width="100" />
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
        <el-table-column prop="approver_name" label="审批人" width="100">
          <template #default="{ row }">
            {{ row.approver_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="申请时间" width="160" />
      </el-table>
      
      <el-empty v-if="!loading && filteredRecords.length === 0" description="暂无记录" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../../api'

const records = ref([])
const loading = ref(false)

const filters = ref({
  name: '',
  status: '',
  dateRange: []
})

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
    records.value = await api.get('/vacations/all')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

const filteredRecords = computed(() => {
  let result = records.value
  
  if (filters.value.name) {
    result = result.filter(r => r.user_name?.includes(filters.value.name))
  }
  
  if (filters.value.status) {
    result = result.filter(r => r.status === filters.value.status)
  }
  
  if (filters.value.dateRange && filters.value.dateRange.length === 2) {
    const [start, end] = filters.value.dateRange
    result = result.filter(r => r.start_date >= start && r.start_date <= end)
  }
  
  return result
})

const handleFilter = () => {
  // 筛选逻辑在 computed 中处理，这里只需要触发更新
}

const handleReset = () => {
  filters.value = { name: '', status: '', dateRange: [] }
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped>
.records-page {
  max-width: 1400px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.filter-form {
  margin-bottom: 20px;
}
</style>