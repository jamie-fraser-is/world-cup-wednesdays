const express = require('express');
const pool = require('../database/connection');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.display_name,
        u.avatar_url,
        us.total_competitions,
        us.total_wins,
        us.win_rate,
        us.times_hosted,
        us.total_votes_cast
      FROM users u
      JOIN user_stats us ON u.id = us.user_id
      WHERE us.total_competitions > 0
      ORDER BY us.total_wins DESC, us.win_rate DESC
      LIMIT 50
    `);

    res.json({ leaderboard: result.rows });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await pool.query(`
      SELECT 
        u.id,
        u.display_name,
        u.avatar_url,
        u.created_at,
        us.total_competitions,
        us.total_wins,
        us.win_rate,
        us.times_hosted,
        us.total_votes_cast
      FROM users u
      JOIN user_stats us ON u.id = us.user_id
      WHERE u.id = $1
    `, [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get recent competitions
    const competitionsResult = await pool.query(`
      SELECT 
        c.id,
        c.title,
        c.topic,
        c.status,
        c.created_at,
        e.selection,
        e.image_url,
        CASE WHEN c.winner_id = $1 THEN true ELSE false END as won
      FROM competitions c
      JOIN entries e ON c.id = e.competition_id
      WHERE e.user_id = $1
      ORDER BY c.created_at DESC
      LIMIT 10
    `, [id]);

    res.json({
      user: userResult.rows[0],
      recentCompetitions: competitionsResult.rows
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { displayName, avatarUrl } = req.body;

    const result = await pool.query(
      'UPDATE users SET display_name = $1, avatar_url = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, display_name, avatar_url',
      [displayName, avatarUrl, req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;