# 班组成员休假管理系统 - 完整设计方案

> 版本：1.0 | 更新日期：2026-05-29 | 状态：已完成代码开发

---

## 一、项目概述

### 1.1 项目背景

本项目为某20人规模班组开发一套在线休假管理系统，用于记录和管理成员的休假申请。

### 1.2 核心需求

| 序号 | 需求描述 | 优先级 |
|-----|---------|-------|
| R1 | 用户注册、登录功能 | P0 |
| R2 | 角色区分（成员/管理员） | P0 |
| R3 | 成员提交休假申请（年假/病假/事假/其他） | P0 |
| R4 | 管理员审批休假申请（通过/拒绝） | P0 |
| R5 | 数据隔离（成员只看自己，管理员看全部） | P0 |
| R6 | 成员查看年假余额 | P1 |
| R7 | 成员查看申请历史 | P1 |
| R8 | 管理员查看所有休假记录 | P1 |
| R9 | 管理员管理成员（修改/删除） | P1 |

---

## 二、技术架构

### 2.1 技术选型

| 层级 | 技术 | 版本 | 说明 |
|-----|------|-----|------|
| 前端框架 | Vue | 3.4 | 渐进式前端框架 |
| UI组件库 | Element Plus | 2.5 | 基于Vue 3的UI组件库 |
| 构建工具 | Vite | 5.0 | 现代化的前端构建工具 |
| 后端框架 | Express | 4.18 | Node.js轻量级框架 |
| 数据库 | SQLite | - | 嵌入式关系型数据库 |
| 认证 | JWT | 9.0 | JSON Web Token |
| 密码加密 | bcryptjs | 2.4 | 密码哈希加密 |

### 2.2 系统架构图

```
┌──────────────────────────────────────────────────────────────────┐
│                           用户浏览器                             │
│                    (Chrome / Edge / Safari)                      │
└────────────────────────────────┬─────────────────────────────────┘
                                 │ HTTP/HTTPS
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                     云服务器 (101.43.20.124)                     │
│                                                                  │
│  ┌─────────────────────┐        ┌─────────────────────────────┐ │
│  │      Nginx          │        │      Node.js + Express      │ │
│  │   (端口 80/443)     │───────▶│        (端口 3000)          │ │
│  │                     │        │                             │ │
│  │  静态文件托管       │        │   API接口处理               │ │
│  │  反向代理           │        │   业务逻辑                  │ │
│  └─────────┬───────────┘        └──────────────┬──────────────┘ │
│            │                                    │                │
│            │                                    ▼                │
│            │                    ┌──────────────────────────────┐ │
│            │                    │      SQLite 数据库           │ │
│            │                    │     (vacation.db)            │ │
│            │                    │                              │ │
│            │                    │  - users 表                  │ │
│            │                    │  - vacation_records 表       │ │
│            │                    └──────────────────────────────┘ │
│            │                                                       │
│            ▼                                                       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    /var/www/vacation-system                 │ │
│  │  ├── frontend/dist          (构建后的前端静态文件)           │ │
│  │  └── backend/               (后端代码)                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   PM2 进程管理器                            │ │
│  │                   (守护 vacation-api 后端服务)               │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 三、数据库设计

### 3.1 数据表总览

```sql
-- 用户表
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,      -- 用户名（唯一）
  password TEXT NOT NULL,             -- 密码（bcrypt加密）
  name TEXT NOT NULL,                 -- 真实姓名
  role TEXT DEFAULT 'member' CHECK(role IN ('member', 'admin')),
  vacation_days INTEGER DEFAULT 10,  -- 年假总天数
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 休假记录表
CREATE TABLE vacation_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,          -- 申请人ID
  type TEXT NOT NULL CHECK(type IN ('年假', '病假', '事假', '其他')),
  start_date DATE NOT NULL,          -- 开始日期
  end_date DATE NOT NULL,            -- 结束日期
  days REAL NOT NULL,                -- 时长（天）
  reason TEXT,                       -- 申请理由
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  approver_id INTEGER,               -- 审批人ID
  approve_time DATETIME,             -- 审批时间
  approve_note TEXT,                 -- 审批备注
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### 3.2 ER 图

```
┌─────────────────┐       ┌─────────────────────────────┐
│      users      │       │    vacation_records         │
├─────────────────┤       ├─────────────────────────────┤
│ id (PK)         │◀──────│ user_id (FK)                │
│ username        │       │ id (PK)                     │
│ password        │       │ type                        │
│ name            │       │ start_date                  │
│ role            │       │ end_date                    │
│ vacation_days   │       │ days                        │
│ created_at      │       │ reason                      │
└─────────────────┘       │ status                      │
                          │ approver_id (FK)────────────▶┌─────────────────┐
                          │ approve_time                 │      users      │
                          │ approve_note                 │    (审批人)     │
                          │ created_at                   │    id (PK)      │
                          └─────────────────────────────┘    name          │
                                                            │ role           │
                                                            └─────────────────┘
```

---

## 四、API 接口设计

### 4.1 接口域名

```
Base URL: http://101.43.20.124/api
```

### 4.2 认证接口

| 方法 | 路径 | 说明 | 认证 | 参数 |
|-----|------|------|-----|-----|
| POST | /auth/register | 用户注册 | 否 | username, password, name |
| POST | /auth/login | 用户登录 | 否 | username, password |
| GET | /auth/me | 获取当前用户信息 | 是 | - |

**登录成功返回：**
```json
{
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "系统管理员",
    "role": "admin",
    "vacation_days": 15
  }
}
```

### 4.3 用户管理接口

| 方法 | 路径 | 说明 | 权限 | 参数 |
|-----|------|------|-----|-----|
| GET | /users | 获取用户列表 | 管理员 | - |
| GET | /users/:id | 获取指定用户 | 管理员/本人 | - |
| PUT | /users/:id | 更新用户信息 | 管理员/本人 | name, vacation_days |
| PUT | /users/:id/role | 修改用户角色 | 管理员 | role |
| DELETE | /users/:id | 删除用户 | 管理员 | - |

### 4.4 休假管理接口

| 方法 | 路径 | 说明 | 权限 | 参数 |
|-----|------|------|-----|-----|
| GET | /vacations | 我的休假记录 | 本人 | - |
| GET | /vacations/all | 所有休假记录 | 管理员 | - |
| GET | /vacations/pending | 待审批列表 | 管理员 | - |
| GET | /vacations/balance | 我的假期余额 | 本人 | - |
| POST | /vacations | 提交休假申请 | 成员 | type, start_date, end_date, days, reason |
| PUT | /vacations/:id/approve | 审批通过 | 管理员 | note（可选） |
| PUT | /vacations/:id/reject | 审批拒绝 | 管理员 | note（可选） |

---

## 五、页面设计

### 5.1 路由结构

```
/login                 # 登录页
/register              # 注册页
/member                # 成员端布局
/member/vacations      # 成员 - 申请休假
/member/history        # 成员 - 申请历史
/member/balance        # 成员 - 假期余额
/admin                 # 管理员端布局
/admin/pending         # 管理员 - 待审批
/admin/records         # 管理员 - 全部记录
/admin/members         # 管理员 - 成员管理
```

### 5.2 登录页

```
┌────────────────────────────────────────┐
│            班组成员休假管理系统           │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ 用户名                           │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ 密码                    👁        │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │           登 录                   │  │
│  └──────────────────────────────────┘  │
│                                         │
│  还没有账号？立即注册                    │
└────────────────────────────────────────┘
```

### 5.3 成员端 - 申请休假页

```
┌─────────────────────────────────────────────────────────────┐
│  🏖️ 休假管理                        用户名 (成员)    [退出] │
├─────────────┬───────────────────────────────────────────────┤
│             │  📝 申请休假                                   │
│  申请休假   │ ┌────────────────────┬──────────────────────┐ │
│  申请历史   │ │ 假别              [年假 ▼]               │ │
│  假期余额   │ │ 开始日期          [选择日期]             │ │
│             │ │ 结束日期          [选择日期]             │ │
│             │ │ 时长              [自动计算] 天          │ │
│             │ │ 申请理由          [请输入理由]           │ │
│             │ └────────────────────┴──────────────────────┘ │
│             │                        [提交申请]  [重置]     │
│             │ ┌────────────────────┐ ┌───────────────────┐ │
│             │ │ 💰 年假余额        │ │ 💡 提示           │ │
│             │ │ 总天数：10天       │ │ • 年假需检查余额   │ │
│             │ │ 已使用：3天        │ │ • 病假事假不占余额 │ │
│             │ │ 剩余：7天          │ │ • 需管理员审批     │ │
│             │ │ ████████░░ 70%     │ └───────────────────┘ │
│             │ └────────────────────┘                       │
└─────────────┴───────────────────────────────────────────────┘
```

### 5.4 管理员端 - 待审批页

```
┌─────────────────────────────────────────────────────────────┐
│  🏖️ 休假管理                        管理员    [退出]       │
├─────────────┬───────────────────────────────────────────────┤
│             │  🔔 待审批 (3)                                │
│  待审批  ✓  │                                               │
│  全部记录   │  ┌─────────────────────────────────────────┐  │
│  成员管理   │  │ 👤 张三                                  │  │
│             │  │ 年假 • 3天 • 2026-06-01 ~ 2026-06-03   │  │
│             │  │ 申请理由：家里有事需要处理                │  │
│             │  │ 申请时间：2026-05-29 09:30              │  │
│             │  │                            [✅ 通过] [❌ 拒绝] │  │
│             │  └─────────────────────────────────────────┘  │
│             │                                               │
│             │  ┌─────────────────────────────────────────┐  │
│             │  │ 👤 李四                                  │  │
│             │  │ 病假 • 1天 • 2026-06-05                 │  │
│             │  │ ...                                     │  │
│             │  └─────────────────────────────────────────┘  │
└─────────────┴───────────────────────────────────────────────┘
```

---

## 六、权限设计

### 6.1 角色说明

| 角色 | 英文 | 权限描述 |
|-----|------|---------|
| 成员 | member | 1. 提交休假申请<br>2. 查看自己的申请历史<br>3. 查看自己的假期余额<br>4. 撤销待审批的申请 |
| 管理员 | admin | 1. 所有成员权限<br>2. 审批休假申请<br>3. 查看所有成员的休假记录<br>4. 管理成员（修改信息、删除、设置角色） |

### 6.2 数据隔离规则

```
┌─────────────────────────────────────────────────────────────┐
│                      接口权限控制                            │
├─────────────────────────────────────────────────────────────┤
│  成员访问 /api/vacations         → 只返回自己的记录          │
│  成员访问 /api/users/:id         → 只能查看自己              │
│  成员访问 /api/vacations/all    → 403 禁止                 │
│  成员访问 /api/users            → 403 禁止                 │
│                                                             │
│  管理员访问 /api/vacations      → 返回所有记录（同时含user_name）│
│  管理员访问 /api/users          → 返回所有用户               │
│  管理员访问 /api/vacations/pending → 返回待审批列表          │
└─────────────────────────────────────────────────────────────┘
```

---

## 七、部署方案

### 7.1 服务器环境

| 项目 | 配置 |
|-----|------|
| 服务器 | 腾讯云轻量应用服务器 |
| 公网IP | 101.43.20.124 |
| 操作系统 | CentOS / Ubuntu |
| Node.js | v18+ |
| Nginx | 最新版 |
| PM2 | 最新版 |

### 7.2 目录结构

```
/var/www/vacation-system/
├── frontend/
│   ├── dist/                 # 前端构建产物（静态文件）
│   │   ├── index.html
│   │   ├── assets/
│   │   └── ...
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── index.js          # 入口文件
│   │   ├── db.js             # 数据库
│   │   ├── middleware/
│   │   │   └── auth.js       # 认证中间件
│   │   └── routes/
│   │       ├── auth.js       # 认证路由
│   │       ├── users.js      # 用户路由
│   │       └── vacations.js  # 休假路由
│   ├── vacation.db           # SQLite数据库文件
│   ├── package.json
│   └── .env                  # 环境变量
```

### 7.3 Nginx 配置

```nginx
server {
    listen 80;
    server_name _;

    # 前端静态文件
    location / {
        root /var/www/vacation-system/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7.4 启动命令

```bash
# 1. 安装后端依赖
cd /var/www/vacation-system/backend
npm install

# 2. 构建前端
cd /var/www/vacation-system/frontend
npm install
npm run build

# 3. 使用 PM2 启动后端
cd /var/www/vacation-system/backend
pm2 start src/index.js --name vacation-api
pm2 save

# 4. 配置 Nginx（复制配置到 /etc/nginx/sites-available/）
# 5. 重载 Nginx
nginx -s reload
```

### 7.5 访问地址

```
http://101.43.20.124
```

---

## 八、使用说明

### 8.1 首次访问

1. 打开浏览器访问：`http://101.43.20.124`
2. 使用默认管理员账号登录：
   - 用户名：`admin`
   - 密码：`admin123`

### 8.2 管理员操作流程

1. 登录管理员账号
2. 进入「成员管理」添加团队成员（或让成员自己注册）
3. 成员提交休假申请后，在「待审批」查看并处理
4. 可在「全部记录」查看历史数据

### 8.3 成员操作流程

1. 注册账号（或由管理员添加）
2. 登录后进入「申请休假」
3. 填写休假信息提交申请
4. 在「申请历史」查看审批状态

---

## 九、测试账号

| 角色 | 用户名 | 密码 | 说明 |
|-----|--------|------|------|
| 管理员 | admin | admin123 | 系统管理员，拥有所有权限 |
| 成员 | test | test123 | 测试账号，可申请休假 |

---

## 十、常见问题

### Q1: 如何修改年假天数？
A: 管理员在「成员管理」中，点击成员右侧的「编辑」按钮修改。

### Q2: 成员可以查看其他人的申请吗？
A: 不可以，系统做了数据隔离，成员只能看到自己的申请。

### Q3: 年假额度用完了还能申请年假吗？
A: 不能，系统会自动检查年假余额，余额不足会提示错误。

### Q4: 如何重置管理员密码？
A: 需要通过数据库直接修改，或联系开发人员。

---

## 十一、后续可扩展功能

| 功能 | 说明 | 优先级 |
|-----|------|-------|
| 假期统计报表 | 管理员查看部门整体休假情况 | P2 |
| 消息通知 | 申请审批后发送通知 | P2 |
| 导入导出 | 批量导入成员、导出数据 | P2 |
| 自定义假期类型 | 管理员添加更多假期类型 | P3 |
| 审批流程自定义 | 多级审批配置 | P3 |

---

## 十二、代码位置

项目完整代码位于：
```
/root/.openclaw/workspace/projects/vacation-system/
```

文件结构：
```
vacation-system/
├── backend/                    # 后端代码
│   ├── src/
│   │   ├── index.js           # 入口
│   │   ├── db.js              # 数据库初始化
│   │   ├── middleware/auth.js # JWT认证
│   │   └── routes/            # API路由
│   ├── package.json
│   └── .env
├── frontend/                   # 前端代码
│   ├── src/
│   │   ├── api/               # API封装
│   │   ├── router/            # 路由配置
│   │   ├── views/             # 页面组件
│   │   │   ├── Login.vue
│   │   │   ├── Register.vue
│   │   │   ├── member/        # 成员端
│   │   │   └── admin/         # 管理员端
│   │   ├── App.vue
│   │   └── main.js
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── SPEC.md                     # 技术规格文档
├── README.md                   # 使用说明
└── DESIGN.md                   # 本设计文档
```

---

*文档结束*