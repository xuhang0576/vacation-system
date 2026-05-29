<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <div class="logo">
        <span>🏖️ 休假管理</span>
        <span class="role-tag">管理员</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="el-menu-vertical"
      >
        <el-menu-item index="/admin/pending">
          <el-icon><Bell /></el-icon>
          <span>待审批</span>
          <el-badge :value="pendingCount" :hidden="pendingCount === 0" class="badge" />
        </el-menu-item>
        <el-menu-item index="/admin/records">
          <el-icon><Document /></el-icon>
          <span>全部记录</span>
        </el-menu-item>
        <el-menu-item index="/admin/members">
          <el-icon><User /></el-icon>
          <span>成员管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>
        <div class="header-content">
          <span class="username">{{ user.name }} (管理员)</span>
          <el-button type="danger" size="small" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            退出
          </el-button>
        </div>
      </el-header>
      
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Bell, Document, User, SwitchButton } from '@element-plus/icons-vue'
import api from '../../api'

const router = useRouter()
const route = useRoute()

const user = reactive(JSON.parse(localStorage.getItem('user') || '{}'))
const pendingCount = ref(0)

const activeMenu = computed(() => route.path)

const fetchPendingCount = async () => {
  try {
    const data = await api.get('/vacations/pending')
    pendingCount.value = data.length
  } catch (error) {
    console.error('获取待审批数量失败:', error)
  }
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }).catch(() => {})
}

onMounted(() => {
  fetchPendingCount()
})

// 暴露给子组件刷新待审批数量
defineExpose({ fetchPendingCount })
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.el-aside {
  background-color: #304156;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #404854;
  flex-direction: column;
  padding: 10px 0;
}

.role-tag {
  font-size: 12px;
  font-weight: normal;
  color: #67c23a;
  background: rgba(103, 194, 58, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
  margin-top: 4px;
}

.el-menu {
  border: none;
  background-color: #304156;
}

.el-menu-item {
  color: #bfcbd9;
  position: relative;
}

.el-menu-item:hover,
.el-menu-item.is-active {
  background-color: #263445 !important;
  color: #409eff !important;
}

.badge {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.el-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.username {
  font-size: 14px;
  color: #333;
}

.el-main {
  padding: 20px;
}
</style>