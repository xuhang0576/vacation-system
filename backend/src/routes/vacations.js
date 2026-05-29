const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 获取我的休假记录
router.get('/', authenticateToken, (req, res) => {
  try {
    const records = db.prepare(`
      SELECT vr.*, u.name as user_name
      FROM vacation_records vr
      JOIN users u ON vr.user_id = u.id
      WHERE vr.user_id = ?
      ORDER BY vr.created_at DESC
    `).all(req.user.id);
    res.json(records);
  } catch (error) {
    console.error('获取休假记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取所有休假记录（管理员）
router.get('/all', authenticateToken, requireAdmin, (req, res) => {
  try {
    const records = db.prepare(`
      SELECT vr.*, u.name as user_name, 
             a.name as approver_name
      FROM vacation_records vr
      JOIN users u ON vr.user_id = u.id
      LEFT JOIN users a ON vr.approver_id = a.id
      ORDER BY vr.created_at DESC
    `).all();
    res.json(records);
  } catch (error) {
    console.error('获取所有休假记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取待审批列表（管理员）
router.get('/pending', authenticateToken, requireAdmin, (req, res) => {
  try {
    const records = db.prepare(`
      SELECT vr.*, u.name as user_name
      FROM vacation_records vr
      JOIN users u ON vr.user_id = u.id
      WHERE vr.status = 'pending'
      ORDER BY vr.created_at ASC
    `).all();
    res.json(records);
  } catch (error) {
    console.error('获取待审批列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 提交休假申请
router.post('/', authenticateToken, (req, res) => {
  try {
    const { type, start_date, end_date, days, reason } = req.body;

    if (!type || !start_date || !end_date || !days) {
      return res.status(400).json({ error: '请填写完整信息' });
    }

    // 检查日期合法性
    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ error: '结束日期不能早于开始日期' });
    }

    // 获取用户当前剩余假期
    const user = db.prepare('SELECT vacation_days FROM users WHERE id = ?').get(req.user.id);
    
    // 计算已使用的假期
    const used = db.prepare(`
      SELECT COALESCE(SUM(days), 0) as used 
      FROM vacation_records 
      WHERE user_id = ? AND status = 'approved' AND type = '年假'
    `).get(req.user.id);

    const remaining = user.vacation_days - used.used;

    // 年假需要检查余额
    if (type === '年假' && days > remaining) {
      return res.status(400).json({ error: `年假余额不足，当前剩余 ${remaining} 天` });
    }

    const result = db.prepare(`
      INSERT INTO vacation_records (user_id, type, start_date, end_date, days, reason)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.user.id, type, start_date, end_date, days, reason || '');

    res.json({ message: '申请提交成功', id: result.lastInsertRowid });
  } catch (error) {
    console.error('提交休假申请错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 审批通过
router.put('/:id/approve', authenticateToken, requireAdmin, (req, res) => {
  try {
    const recordId = parseInt(req.params.id);
    const { note } = req.body;

    const record = db.prepare('SELECT * FROM vacation_records WHERE id = ?').get(recordId);
    if (!record) {
      return res.status(404).json({ error: '申请不存在' });
    }

    if (record.status !== 'pending') {
      return res.status(400).json({ error: '该申请已处理' });
    }

    db.prepare(`
      UPDATE vacation_records 
      SET status = 'approved', approver_id = ?, approve_time = CURRENT_TIMESTAMP, approve_note = ?
      WHERE id = ?
    `).run(req.user.id, note || '', recordId);

    res.json({ message: '审批通过' });
  } catch (error) {
    console.error('审批通过错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 审批拒绝
router.put('/:id/reject', authenticateToken, requireAdmin, (req, res) => {
  try {
    const recordId = parseInt(req.params.id);
    const { note } = req.body;

    const record = db.prepare('SELECT * FROM vacation_records WHERE id = ?').get(recordId);
    if (!record) {
      return res.status(404).json({ error: '申请不存在' });
    }

    if (record.status !== 'pending') {
      return res.status(400).json({ error: '该申请已处理' });
    }

    db.prepare(`
      UPDATE vacation_records 
      SET status = 'rejected', approver_id = ?, approve_time = CURRENT_TIMESTAMP, approve_note = ?
      WHERE id = ?
    `).run(req.user.id, note || '', recordId);

    res.json({ message: '已拒绝' });
  } catch (error) {
    console.error('审批拒绝错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取我的假期余额
router.get('/balance', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT vacation_days FROM users WHERE id = ?').get(req.user.id);
    
    const used = db.prepare(`
      SELECT COALESCE(SUM(days), 0) as used 
      FROM vacation_records 
      WHERE user_id = ? AND status = 'approved' AND type = '年假'
    `).get(req.user.id);

    res.json({
      total: user.vacation_days,
      used: used.used,
      remaining: user.vacation_days - used.used
    });
  } catch (error) {
    console.error('获取假期余额错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;