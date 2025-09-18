const express = require('express');
const pool = require('../database/connection');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    let query = `
      SELECT n.*, c.title as competition_title
      FROM notifications n
      LEFT JOIN competitions c ON n.competition_id = c.id
      WHERE n.user_id = $1
    `;
    
    const params = [req.user.id];
    
    if (unreadOnly === 'true') {
      query += ' AND n.is_read = false';
    }
    
    query += `
      ORDER BY n.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get unread count
    const unreadResult = await pool.query(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );

    res.json({
      notifications: result.rows,
      unreadCount: parseInt(unreadResult.rows[0].unread_count)
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1',
      [req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create notification (internal function)
const createNotification = async (userId, type, title, message, competitionId = null) => {
  try {
    await pool.query(`
      INSERT INTO notifications (user_id, type, title, message, competition_id)
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, type, title, message, competitionId]);
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

// Bulk create notifications
const createBulkNotifications = async (userIds, type, title, message, competitionId = null) => {
  try {
    const values = userIds.map((userId, index) => 
      `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${index * 5 + 4}, $${index * 5 + 5})`
    ).join(', ');

    const params = userIds.flatMap(userId => [userId, type, title, message, competitionId]);

    await pool.query(`
      INSERT INTO notifications (user_id, type, title, message, competition_id)
      VALUES ${values}
    `, params);
  } catch (error) {
    console.error('Create bulk notifications error:', error);
  }
};

module.exports = { 
  router, 
  createNotification, 
  createBulkNotifications 
};