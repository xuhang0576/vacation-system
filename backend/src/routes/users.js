const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 获取所有用户（管理员）
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, username, name, role, vacation_days, created_at 
      FROM users 
      ORDER BY created_at DESC
    `).all();
    res.json(users);
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取指定用户
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // 检查权限：只能查看自己，或者管理员查看任意用户
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: '无权限查看此用户' });
    }

    const user = db.prepare(`
      SELECT id, username, name, role, vacation_days, created_at 
      FROM users WHERE id = ?
    `).get(userId);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(user);
  } catch (error) {
    console.error('获取用户错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新用户信息
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, vacation_days } = req.body;

    // 检查权限：只能更新自己，或者管理员更新任意用户
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: '无权限更新此用户' });
    }

    // 普通成员只能更新名字和假期天数，管理员可以更新所有
    if (req.user.role !== 'admin') {
      db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, userId);
    } else {
      db.prepare('UPDATE users SET name = ?, vacation_days = ? WHERE id = ?')
        .run(name, vacation_days, userId);
    }

    const user = db.prepare('SELECT id, username, name, role, vacation_days FROM users WHERE id = ?').get(userId);
    res.json({ message: '更新成功', user });
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 修改用户角色（仅管理员）
router.put('/:id/role', authenticateToken, requireAdmin, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    if (!['member', 'admin'].includes(role)) {
      return res.status(400).json({ error: '无效的角色' });
    }

    // 不能修改自己的角色
    if (userId === req.user.id) {
      return res.status(400).json({ error: '不能修改自己的角色' });
    }

    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
    res.json({ message: '角色更新成功' });
  } catch (error) {
    console.error('修改角色错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除用户（仅管理员）
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // 不能删除自己
    if (userId === req.user.id) {
      return res.status(400).json({ error: '不能删除自己的账号' });
    }

    const result = db.prepare('DELETE FROM users WHERE id = ? AND role = ?').run(userId, 'member');
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '用户不存在或无法删除' });
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;