# 班组成员休假管理系统

## 项目结构

```
vacation-system/
├── backend/          # 后端 (Node.js + Express + SQLite)
│   ├── src/
│   │   ├── index.js       # 入口
│   │   ├── db.js          # 数据库
│   │   ├── middleware/    # 中间件
│   │   └── routes/        # 路由
│   └── package.json
│
└── frontend/         # 前端 (Vue 3 + Element Plus)
    ├── src/
    │   ├── api/           # API 调用
    │   ├── router/        # 路由
    │   └── views/         # 页面
    └── package.json
```

## 快速开始

### 后端启动
```bash
cd backend
npm install
npm start
```

### 前端启动
```bash
cd frontend
npm install
npm run dev
```

## 默认账号

- 用户名：admin
- 密码：admin123
- 角色：管理员

## API 文档

### 认证
- POST /api/auth/register - 注册
- POST /api/auth/login - 登录
- GET /api/auth/me - 当前用户

### 用户
- GET /api/users - 用户列表（管理员）
- GET /api/users/:id - 用户详情
- PUT /api/users/:id - 更新用户
- DELETE /api/users/:id - 删除用户（管理员）

### 休假
- GET /api/vacations - 我的休假记录
- GET /api/vacations/all - 所有记录（管理员）
- GET /api/vacations/pending - 待审批（管理员）
- POST /api/vacations - 提交申请
- PUT /api/vacations/:id/approve - 审批通过
- PUT /api/vacations/:id/reject - 审批拒绝
- GET /api/vacations/balance - 假期余额

## 部署

1. 安装依赖：npm install
2. 启动后端：npm start（端口 3000）
3. 构建前端：npm run build
4. 配置 Nginx 托管静态文件并反向代理