<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <div class="logo">
        <span>🏖️ 休假管理</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="el-menu-vertical"
      >
        <el-menu-item index="/member/vacations">
          <el-icon><Calendar /></el-icon>
          <span>申请休假</span>
        </el-menu-item>
        <el-menu-item index="/member/history">
          <el-icon><Document /></el-icon>
          <span>申请历史</span>
        </el-menu-item>
        <el-menu-item index="/member/balance">
          <el-icon><Coin /></el-icon>
          <span>假期余额</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>
        <div class="header-content">
          <span class="username">{{ user.name }} ({{ user.role === 'admin' ? '管理员' : '成员' }})</span>
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
import { computed, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Calendar, Document, Coin, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const user = reactive(JSON.parse(localStorage.getItem('user') || '{}'))

const activeMenu = computed(() => route.path)

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
}

.el-menu {
  border: none;
  background-color: #304156;
}

.el-menu-item {
  color: #bfcbd9;
}

.el-menu-item:hover,
.el-menu-item.is-active {
  background-color: #263445 !important;
  color: #409eff !important;
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