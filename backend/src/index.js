require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initDatabase = require('./db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const vacationRoutes = require('./routes/vacations');

const app = express();
const PORT = process.env.PORT || 3000;

// 初始化数据库
initDatabase();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vacations', vacationRoutes);

// 根路由
app.get('/', (req, res) => {
  res.json({ message: '班组成员休假管理系统 API', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
});