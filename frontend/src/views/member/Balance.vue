<template>
  <div class="balance-page">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-icon total">
            <el-icon :size="40"><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ balance.total }}</div>
            <div class="stat-label">年假总天数</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-icon used">
            <el-icon :size="40"><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ balance.used }}</div>
            <div class="stat-label">已使用天数</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-icon remaining">
            <el-icon :size="40"><Coin /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ balance.remaining }}</div>
            <div class="stat-label">剩余天数</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>📊 年假使用情况</span>
        </div>
      </template>
      
      <el-progress 
        :text-inside="true" 
        :stroke-width="26" 
        :percentage="percentage"
        :color="progressColor"
      />
      
      <div class="progress-info">
        <span>已使用 {{ balance.used }} / {{ balance.total }} 天</span>
        <span>剩余 {{ balance.remaining }} 天</span>
      </div>
    </el-card>
    
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>💡 说明</span>
        </div>
      </template>
      <ul class="tips-list">
        <li>年假：每年可使用的带薪休假天数</li>
        <li>病假：因疾病需要休息的假期，不占用年假</li>
        <li>事假：因个人原因请假的假期，不占用年假</li>
        <li>年假当年有效，不可累积到下一年</li>
      </ul>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Calendar, Clock, Coin } from '@element-plus/icons-vue'
import api from '../../api'

const balance = ref({ total: 10, used: 0, remaining: 10 })

const percentage = computed(() => {
  if (balance.value.total === 0) return 0
  return Math.round((balance.value.used / balance.value.total) * 100)
})

const progressColor = computed(() => {
  const percent = percentage.value
  if (percent < 50) return '#67c23a'
  if (percent < 80) return '#e6a23c'
  return '#f56c6c'
})

const fetchBalance = async () => {
  try {
    balance.value = await api.get('/vacations/balance')
  } catch (error) {
    ElMessage.error(error.message)
  }
}

onMounted(() => {
  fetchBalance()
})
</script>

<style scoped>
.balance-page {
  max-width: 1200px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  color: #fff;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.used {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.remaining {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  color: #666;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
  color: #666;
}

.tips-list li {
  margin-bottom: 8px;
}
</style>