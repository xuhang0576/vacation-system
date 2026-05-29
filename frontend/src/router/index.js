import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/member',
    component: () => import('../views/member/Layout.vue'),
    meta: { requiresAuth: true, role: 'member' },
    children: [
      {
        path: '',
        redirect: '/member/vacations'
      },
      {
        path: 'vacations',
        name: 'MemberVacations',
        component: () => import('../views/member/Vacations.vue')
      },
      {
        path: 'history',
        name: 'MemberHistory',
        component: () => import('../views/member/History.vue')
      },
      {
        path: 'balance',
        name: 'MemberBalance',
        component: () => import('../views/member/Balance.vue')
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('../views/admin/Layout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: '',
        redirect: '/admin/pending'
      },
      {
        path: 'pending',
        name: 'AdminPending',
        component: () => import('../views/admin/Pending.vue')
      },
      {
        path: 'records',
        name: 'AdminRecords',
        component: () => import('../views/admin/Records.vue')
      },
      {
        path: 'members',
        name: 'AdminMembers',
        component: () => import('../views/admin/Members.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.role && to.meta.role !== user.role) {
    // 角色不匹配，跳转到对应角色首页
    next(user.role === 'admin' ? '/admin' : '/member')
  } else {
    next()
  }
})

export default router