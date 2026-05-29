<template>
  <div class="pending-page">
    <el-card v-if="records.length === 0 && !loading">
      <el-empty description="暂无待审批的申请" />
    </el-card>
    
    <div v-else class="card-list">
      <el-card v-for="record in records" :key="record.id" class="pending-card">
        <div class="card-content">
          <div class="card-left">
            <div class="user-info">
              <el-avatar :size="40">{{ record.user_name?.charAt(0) }}</el-avatar>
              <div class="user-detail">
                <div class="name">{{ record.user_name }}</div>
                <div class="time">申请时间：{{ record.created_at }}</div>
              </div>
            </div>
            
            <div class="vacation-info">
              <el-tag :type="typeTag(record.type)">{{ record.type }}</el-tag>
              <span class="days">{{ record.days }} 天</span>
              <span class="date">{{ record.start_date }} ~ {{ record.end_date }}</span>
            </div>
            
            <div class="reason">
              <strong>申请理由：</strong>{{ record.reason }}
            </div>
          </div>
          
          <div class="card-right">
            <el-button type="success" @click="handleApprove(record.id)">
              <el-icon><Check /></el-icon>
              通过
            </el-button>
            <el-button type="danger" @click="handleReject(record.id)">
              <el-icon><Close /></el-icon>
              拒绝
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'
import api from '../../api'

const records = ref([])
const loading = ref(false)

const typeTag = (type) => {
  const map = {
    '年假': '',
    '病假': 'danger',
    '事假': 'warning',
    '其他': 'info'
  }
  return map[type] || ''
}

const fetchRecords = async () => {
  loading.value = true
  try {
    records.value = await api.get('/vacations/pending')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

const handleApprove = async (id) => {
  try {
    await ElMessageBox.confirm('确定要通过该申请吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    await api.put(`/vacations/${id}/approve`, {})
    ElMessage.success('已通过')
    fetchRecords()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handleReject = async (id) => {
  try {
    const { value: note } = await ElMessageBox.prompt('请输入拒绝理由（可选）', '拒绝申请', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '拒绝理由'
    })
    
    await api.put(`/vacations/${id}/reject`, { note })
    ElMessage.success('已拒绝')
    fetchRecords()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped>
.pending-page {
  max-width: 1000px;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.pending-card {
  border-left: 4px solid #e6a23c;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-left {
  flex: 1;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.user-detail {
  margin-left: 12px;
}

.user-detail .name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.user-detail .time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.vacation-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.vacation-info .days {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}

.vacation-info .date {
  color: #666;
  font-size: 14px;
}

.reason {
  color: #666;
  font-size: 14px;
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
}

.card-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-left: 20px;
}
</style>