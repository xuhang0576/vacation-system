<template>
  <div class="vacations-page">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>📝 申请休假</span>
            </div>
          </template>
          
          <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
            <el-form-item label="假别" prop="type">
              <el-select v-model="form.type" placeholder="请选择假别" style="width: 100%">
                <el-option label="年假" value="年假" />
                <el-option label="病假" value="病假" />
                <el-option label="事假" value="事假" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="开始日期" prop="start_date">
              <el-date-picker
                v-model="form.start_date"
                type="date"
                placeholder="选择开始日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                :disabled-date="disabledDate"
              />
            </el-form-item>
            
            <el-form-item label="结束日期" prop="end_date">
              <el-date-picker
                v-model="form.end_date"
                type="date"
                placeholder="选择结束日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                :disabled-date="disabledDate"
              />
            </el-form-item>
            
            <el-form-item label="时长">
              <el-input v-model="form.days" readonly>
                <template #append>天</template>
              </el-input>
            </el-form-item>
            
            <el-form-item label="申请理由" prop="reason">
              <el-input
                v-model="form.reason"
                type="textarea"
                :rows="3"
                placeholder="请输入申请理由"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" :loading="loading" @click="handleSubmit">
                提交申请
              </el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="balance-card">
          <template #header>
            <div class="card-header">
              <span>💰 年假余额</span>
            </div>
          </template>
          
          <div class="balance-info">
            <div class="balance-item">
              <span class="label">总天数</span>
              <span class="value">{{ balance.total }} 天</span>
            </div>
            <div class="balance-item">
              <span class="label">已使用</span>
              <span class="value used">{{ balance.used }} 天</span>
            </div>
            <div class="balance-item">
              <span class="label">剩余</span>
              <span class="value remaining">{{ balance.remaining }} 天</span>
            </div>
            
            <el-progress 
              :percentage="balance.total ? Math.round((balance.remaining / balance.total) * 100) : 0" 
              :color="progressColor"
            />
          </div>
        </el-card>
        
        <el-card class="tips-card" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>💡 提示</span>
            </div>
          </template>
          <ul class="tips-list">
            <li>年假需要检查余额，余额不足无法申请</li>
            <li>病假、事假不占用年假额度</li>
            <li>申请提交后需要管理员审批</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../../api'

const formRef = ref()
const loading = ref(false)
const balance = ref({ total: 10, used: 0, remaining: 10 })

const form = reactive({
  type: '',
  start_date: '',
  end_date: '',
  days: 0,
  reason: ''
})

const rules = {
  type: [{ required: true, message: '请选择假别', trigger: 'change' }],
  start_date: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  end_date: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  reason: [{ required: true, message: '请输入申请理由', trigger: 'blur' }]
}

// 计算天数
watch([() => form.start_date, () => form.end_date], ([start, end]) => {
  if (start && end) {
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (endDate >= startDate) {
      const diffTime = endDate - startDate
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      form.days = diffDays
    } else {
      form.days = 0
    }
  } else {
    form.days = 0
  }
})

// 禁用今天之前的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7
}

// 进度条颜色
const progressColor = computed(() => {
  const percent = balance.value.total ? balance.value.remaining / balance.value.total : 0
  if (percent > 0.5) return '#67c23a'
  if (percent > 0.2) return '#e6a23c'
  return '#f56c6c'
})

// 获取余额
const fetchBalance = async () => {
  try {
    balance.value = await api.get('/vacations/balance')
  } catch (error) {
    console.error('获取余额失败:', error)
  }
}

// 提交申请
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  if (form.days <= 0) {
    ElMessage.warning('请选择正确的日期范围')
    return
  }
  
  loading.value = true
  try {
    await api.post('/vacations', form)
    ElMessage.success('申请提交成功，等待审批')
    handleReset()
    fetchBalance()
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

// 重置
const handleReset = () => {
  formRef.value.resetFields()
  form.days = 0
}

fetchBalance()
</script>

<style scoped>
.vacations-page {
  max-width: 1200px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.balance-info {
  text-align: center;
}

.balance-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.balance-item:last-of-type {
  border-bottom: none;
}

.balance-item .label {
  color: #666;
}

.balance-item .value {
  font-size: 18px;
  font-weight: bold;
}

.balance-item .value.used {
  color: #f56c6c;
}

.balance-item .value.remaining {
  color: #67c23a;
}

.el-progress {
  margin-top: 20px;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
  color: #666;
  font-size: 14px;
}

.tips-list li {
  margin-bottom: 8px;
}
</style>